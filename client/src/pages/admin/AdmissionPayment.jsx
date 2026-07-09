import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CreditCard } from "lucide-react";
import http from "../../api/http";

const initialForm = {
  admissionFormFee: 0,
  admissionPaymentCurrency: "NGN",
  admissionPaymentProvider: "paystack"
};

function formatCurrency(amount, currency) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency || "NGN",
    maximumFractionDigits: 0
  }).format(Number(amount) || 0);
}

export default function AdmissionPayment() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    http.get("/admissions")
      .then((res) => {
        if (!active) return;
        setForm({
          ...initialForm,
          admissionFormFee: res.data?.admissionFormFee ?? 0,
          admissionPaymentCurrency: res.data?.admissionPaymentCurrency || "NGN",
          admissionPaymentProvider: res.data?.admissionPaymentProvider || "paystack"
        });
      })
      .catch((error) => toast.error(error?.response?.data?.message || "Unable to load payment settings."))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function setValue(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await http.put("/admissions", {
        admissionFormFee: Number(form.admissionFormFee) || 0,
        admissionPaymentCurrency: form.admissionPaymentCurrency,
        admissionPaymentProvider: form.admissionPaymentProvider
      });
      toast.success("Payment settings saved");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to save payment settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-950">Admission Payment</h1>
      <p className="mt-2 text-sm text-slate-600">Set the admission form fee. When the fee is above zero, applicants must pay before the form opens.</p>

      <form className="card mt-7 max-w-3xl p-6" onSubmit={save}>
        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : (
          <div className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="label">Application fee amount</span>
                <input
                  className="input"
                  min="0"
                  type="number"
                  value={form.admissionFormFee}
                  onChange={(event) => setValue("admissionFormFee", event.target.value)}
                />
              </label>
              <label>
                <span className="label">Currency</span>
                <select className="input" value={form.admissionPaymentCurrency} onChange={(event) => setValue("admissionPaymentCurrency", event.target.value)}>
                  <option value="NGN">NGN</option>
                </select>
              </label>
            </div>

            <label>
              <span className="label">Payment provider</span>
              <select className="input" value={form.admissionPaymentProvider} onChange={(event) => setValue("admissionPaymentProvider", event.target.value)}>
                <option value="paystack">Paystack</option>
              </select>
            </label>

            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-indigo-950">
                <CreditCard size={18} />
                Applicant charge
              </div>
              <p className="mt-3 text-3xl font-black text-slate-950">
                {formatCurrency(form.admissionFormFee, form.admissionPaymentCurrency)}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {Number(form.admissionFormFee) > 0
                  ? "Applicants must complete this payment before they can access the form."
                  : "No payment is required while the fee is set to zero."}
              </p>
            </div>

            <button className="btn bg-indigo-950 text-white hover:bg-indigo-900 focus:ring-indigo-950 sm:w-fit" disabled={saving} type="submit">
              {saving ? "Saving..." : "Save payment settings"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
