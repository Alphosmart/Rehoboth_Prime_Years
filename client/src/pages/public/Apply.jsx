import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import http from "../../api/http";
import SectionTitle from "../../components/public/SectionTitle";
import { setSeo } from "../../utils/seo";

export default function Apply() {
  setSeo("Application Form", "Start your child's admission to Rehoboth Prime Years.");
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  async function onSubmit(values) {
    await http.post("/contact", {
      fullName: values.parentName,
      email: values.email,
      phone: values.phone,
      subject: `Admission Application — ${values.childName} (${values.programme})`,
      message: `Parent/Guardian: ${values.parentName}\nChild: ${values.childName}\nDate of birth: ${values.dob || "—"}\nProgramme applied for: ${values.programme}\nPrevious school: ${values.previousSchool || "—"}\n\nNotes:\n${values.notes || "—"}`
    });
    toast.success("Application submitted. Our admissions team will be in touch.");
    reset();
  }

  return (
    <main className="container-pad py-14">
      <Link to="/admissions" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-navy hover:underline"><ArrowLeft size={16} /> Back to Admissions</Link>
      <SectionTitle eyebrow="Admissions" title="Application form" text="Complete the form below to begin your child's admission. Our admissions team will contact you to confirm the placement test and next steps." />
      {/* Placeholder application form — to be replaced with the school's own form when provided. */}
      <form onSubmit={handleSubmit(onSubmit)} className="card mt-8 grid max-w-3xl gap-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Parent / guardian name</label>
            <input className="input" {...register("parentName", { required: true, minLength: 2 })} />
            {errors.parentName && <p className="mt-1 text-xs text-red-600">Parent or guardian name is required.</p>}
          </div>
          <div>
            <label className="label">Child's full name</label>
            <input className="input" {...register("childName", { required: true, minLength: 2 })} />
            {errors.childName && <p className="mt-1 text-xs text-red-600">Child's name is required.</p>}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Email</label><input className="input" type="email" {...register("email", { required: true })} />{errors.email && <p className="mt-1 text-xs text-red-600">Email is required.</p>}</div>
          <div><label className="label">Phone</label><input className="input" {...register("phone", { required: true })} />{errors.phone && <p className="mt-1 text-xs text-red-600">Phone is required.</p>}</div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Child's date of birth</label><input className="input" type="date" {...register("dob")} /></div>
          <div>
            <label className="label">Programme applying for</label>
            <select className="input" {...register("programme", { required: true })}>
              <option value="Early Years">Early Years</option>
              <option value="Primary School">Primary School</option>
              <option value="Secondary School">Secondary School</option>
            </select>
          </div>
        </div>
        <div><label className="label">Previous school (if any)</label><input className="input" {...register("previousSchool")} /></div>
        <div><label className="label">Additional notes</label><textarea className="input min-h-32" {...register("notes")} /></div>
        <button className="btn-primary" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit application"}</button>
      </form>
    </main>
  );
}
