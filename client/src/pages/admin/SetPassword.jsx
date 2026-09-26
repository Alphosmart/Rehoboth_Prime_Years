import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import http from "../../api/http";
import { ADMIN_LOGIN_PATH } from "../../config/admin";

export default function SetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const token = searchParams.get("token");

  async function onSubmit(values) {
    try {
      setSubmitting(true);
      const response = await http.post("/auth/set-password", { token, password: values.password });
      toast.success(response.data.message);
      navigate(ADMIN_LOGIN_PATH, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to set password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="card w-full max-w-md p-6">
        <h1 className="text-2xl font-black">Set your password</h1>
        <p className="mt-2 text-sm text-slate-600">Choose a password to finish setting up your admin account or reset your existing password.</p>
        {!token && <p className="mt-4 text-sm text-red-600">This password link is missing its token. Request a new one from the login page.</p>}
        <label className="mt-5 block">
          <span className="label">New password</span>
          <input
            className="input"
            type="password"
            autoComplete="new-password"
            {...register("password", { required: "Password is required", minLength: { value: 8, message: "Use at least 8 characters" } })}
          />
          {errors.password && <span className="mt-1 block text-sm text-red-600">{errors.password.message}</span>}
        </label>
        <label className="mt-4 block">
          <span className="label">Confirm password</span>
          <input
            className="input"
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) => value === watch("password") || "Passwords do not match"
            })}
          />
          {errors.confirmPassword && <span className="mt-1 block text-sm text-red-600">{errors.confirmPassword.message}</span>}
        </label>
        <button className="btn-primary mt-6 w-full" disabled={submitting || !token}>
          {submitting ? "Saving..." : "Save password"}
        </button>
        <Link to={ADMIN_LOGIN_PATH} className="mt-4 block text-center text-sm font-semibold text-schoolBlue hover:underline">Back to login</Link>
      </form>
    </main>
  );
}