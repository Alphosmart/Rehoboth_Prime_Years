require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const HomepageContent = require("../src/models/HomepageContent");
const PageContent = require("../src/models/PageContent");

const vision = "To passionately nurture future Christian leaders, equipped with academic excellence, grounded in faith, and committed to making a transformative impact on their communities and beyond";
const mission = "We are dedicated to nurturing the spiritual, academic and personal growth of each child through the use of biblical-integrated curriculum, innovative teaching techniques, and cutting edge technology.";
const coreValuesIntro = "These core values form the foundation of Rehoboth Prime Years and guide its approach to education and learners development";
const coreValues = [
  "Integrity and Character",
  "Nurturing Environment",
  "Academic Excellence",
  "Faith-Based Education",
  "Transformative Impact",
  "Leadership Development",
  "Community Engagement",
  "Discipleship"
];

const aboutContent = {
  title: "About Rehoboth Prime Years",
  excerpt: "A nurturing Christian school community where children are known, guided, and encouraged to grow in faith, excellence, and purpose.",
  content: `<p>${coreValuesIntro}</p>`,
  vision,
  mission,
  coreValues
};

async function syncSchoolStatements() {
  await connectDB();
  await HomepageContent.findOneAndUpdate(
    {},
    { heroSubtitle: vision, aboutPreview: vision },
    { new: true, upsert: true, runValidators: true }
  );
  await PageContent.findOneAndUpdate(
    { slug: "about" },
    { ...aboutContent, slug: "about" },
    { new: true, upsert: true, runValidators: true }
  );
  console.log("School statements synced");
  await mongoose.disconnect();
}

syncSchoolStatements().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
