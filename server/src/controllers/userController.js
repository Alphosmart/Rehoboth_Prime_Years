const { z } = require("zod");
const crypto = require("crypto");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const { sendEmail } = require("../utils/email");

function passwordSetupUrl(token) {
  const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").split(",")[0].trim();
  const url = new URL("/school-office/access/set-password", clientUrl);
  url.searchParams.set("token", token);
  return url.toString();
}

exports.listUsers = asyncHandler(async (req, res) => {
  res.json(await User.find().select("-password").sort("name"));
});

exports.createUser = asyncHandler(async (req, res) => {
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email()
  });
  const { name, email } = schema.parse(req.body);
  const token = crypto.randomBytes(32).toString("hex");
  const user = await User.create({
    name,
    email,
    password: crypto.randomBytes(32).toString("hex"),
    passwordSetupTokenHash: crypto.createHash("sha256").update(token).digest("hex"),
    passwordSetupExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  });
  const setupUrl = passwordSetupUrl(token);
  try {
    const delivery = await sendEmail({
      to: user.email,
      subject: "Set up your school admin account",
      text: `Hello ${user.name},\n\nYour admin account has been created. Sign in with ${user.email} after setting your password using this one-time link (expires in 24 hours):\n\n${setupUrl}\n`
    });
    if (!delivery.delivered && process.env.NODE_ENV === "production") {
      await User.findByIdAndDelete(user._id);
      return res.status(503).json({ message: "Email delivery is unavailable. The account was not created." });
    }
  } catch (error) {
    await User.findByIdAndDelete(user._id);
    throw error;
  }
  res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name, email: req.body.email, isActive: req.body.isActive },
    { new: true, runValidators: true }
  ).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

exports.deleteUser = asyncHandler(async (req, res) => {
  if (String(req.user._id) === req.params.id) return res.status(400).json({ message: "You cannot delete your own account" });
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ message: "Deleted successfully" });
});
