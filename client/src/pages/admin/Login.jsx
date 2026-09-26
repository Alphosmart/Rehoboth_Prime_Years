import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import http from "../../api/http";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, getValues, formState: { isSubmitting } } = useForm();
  const [needsTwoFactor, setNeedsTwoFactor] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  if (user) return <Navigate to="/admin" replace />;

  async function onSubmit(values) {
    try {
      const result = await login(values.email, values.password, values.token);
      if (result?.twoFactorRequired) {
        setNeedsTwoFactor(true);
        toast("Enter the 6-digit code from your authenticator app");
        return;
      }
      navigate("/admin");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  }

  async function sendResetLink() {
    const email = getValues("email");
    if (!email) {
      toast.error("Enter your email address first.");
      return;
    }
    try {
      setForgotSubmitting(true);
      const response = await http.post("/auth/forgot-password", { email });
      toast.success(response.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to send password instructions.");
    } finally {
      setForgotSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="card w-full max-w-md p-6">
        <h1 className="text-2xl font-black">{forgotMode ? "Reset your password" : "Admin Login"}</h1>
        <label className="mt-5 block">
          <span className="label">Email</span>
          <input className="input" type="email" autoComplete="username" {...register("email", { required: true })} />
        </label>
        {!forgotMode && <>
          <label className="mt-4 block">
            <span className="label">Password</span>
            <input className="input" type="password" autoComplete="current-password" {...register("password", { required: true })} />
          </label>
          {needsTwoFactor && (
            <label className="mt-4 block">
              <span className="label">Two-factor code</span>
              <input className="input tracking-widest" inputMode="numeric" autoComplete="one-time-code" placeholder="123456" {...register("token")} />
            </label>
          )}
          <button className="btn-primary mt-6 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : needsTwoFactor ? "Verify code" : "Login"}
          </button>
          <button type="button" className="mt-4 w-full text-sm font-semibold text-schoolBlue hover:underline" onClick={() => setForgotMode(true)}>
            Forgot password?
          </button>
        </>}
        {forgotMode && <>
          <p className="mt-3 text-sm text-slate-600">We will email password instructions if an active account matches this address.</p>
          <button type="button" className="btn-primary mt-6 w-full" disabled={forgotSubmitting} onClick={sendResetLink}>
            {forgotSubmitting ? "Sending..." : "Send reset link"}
          </button>
          <button type="button" className="mt-4 w-full text-sm font-semibold text-schoolBlue hover:underline" onClick={() => setForgotMode(false)}>
            Back to login
          </button>
        </>}
      </form>
    </main>
  );
}
