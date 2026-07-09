import { useState } from "react";
import toast from "react-hot-toast";
import { Download, Eye, Trash2 } from "lucide-react";
import http from "../../api/http";
import { useApi } from "../../hooks/useApi";
import ConfirmDeleteModal from "../../components/admin/ConfirmDeleteModal";

const sections = [
  {
    title: "Pupil / Student Information",
    fields: [
      ["Name of Pupil/Student", "childName"],
      ["Date of Birth", "dob"],
      ["Age", "age"],
      ["Sex", "sex"],
      ["Home Address", "homeAddress"],
      ["State of Origin", "stateOfOrigin"],
      ["L.G.A.", "lga"],
      ["Religion", "religion"],
      ["If Christian, Church Attending", "churchAttending"],
      ["Blood Group", "bloodGroup"],
      ["Genotype", "genotype"],
      ["Class into which admission is sought", "classSought"],
      ["Number of Children in the Family", "numberOfChildren"],
      ["Child's Position", "childPosition"],
      ["Allergy, if any", "allergies"],
      ["Immunization up to date", "immunizationUpToDate"],
      ["Medical condition", "hasMedicalCondition"],
      ["Medical condition details", "medicalDetails"]
    ]
  },
  {
    title: "Parents' Information",
    fields: [
      ["Father's Name", "fatherName"],
      ["Father's Occupation", "fatherOccupation"],
      ["Father's Office Address", "fatherOfficeAddress"],
      ["Mother's Name", "motherName"],
      ["Mother's Occupation", "motherOccupation"],
      ["Mother's Office Address", "motherOfficeAddress"],
      ["Parent / Guardian Phone", "primaryPhone"],
      ["Parents' Email", "parentEmail"],
      ["Preferred Method of Communication", "communicationPreferences"],
      ["Emergency Contact Name", "emergencyContactName"],
      ["Emergency Contact Phone", "emergencyContactPhone"]
    ]
  },
  {
    title: "Other People Authorized to Pick Your Child from School",
    fields: [
      ["Authorized Person 1 Name", "pickupOneName"],
      ["Authorized Person 1 Address", "pickupOneAddress"],
      ["Authorized Person 1 Phone Number", "pickupOnePhone"],
      ["Authorized Person 2 Name", "pickupTwoName"],
      ["Authorized Person 2 Address", "pickupTwoAddress"],
      ["Authorized Person 2 Phone Number", "pickupTwoPhone"]
    ]
  },
  {
    title: "Attestation",
    fields: [
      ["Parent / Guardian's Name", "attestationName"],
      ["Date", "attestationDate"],
      ["Typed Signature Accepted", "attestationAgreement"]
    ]
  },
  {
    title: "Payment",
    fields: [
      ["Payment Reference", "paymentReference"],
      ["Amount Paid", "paymentAmountKobo", formatKobo],
      ["Currency", "paymentCurrency"],
      ["Paid At", "paymentPaidAt", formatDateTime]
    ]
  }
];

function displayValue(value) {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "N/A";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return value === undefined || value === null || value === "" ? "N/A" : String(value);
}

function formatDateTime(value) {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
}

function formatKobo(value) {
  if (!value) return "N/A";
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Number(value) / 100);
}

function applicationNumber(application) {
  if (application.applicationNumber) return application.applicationNumber;
  const date = application.createdAt ? new Date(application.createdAt) : new Date();
  const datePart = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("");
  const suffix = String(application._id || "000000").slice(-6).toUpperCase();
  return `ADM-${datePart}-${suffix}`;
}

function escapeHtml(value) {
  return displayValue(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function slugify(value) {
  return displayValue(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "application";
}

const actionButtonClass = "inline-flex items-center justify-center gap-2 rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm font-semibold text-indigo-950 transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-200";

function buildPrintableApplication(application) {
  const sectionMarkup = sections.map((section) => `
    <section>
      <h2>${escapeHtml(section.title)}</h2>
      <table>
        <tbody>
          ${section.fields.map(([label, key, formatter]) => `
            <tr>
              <th>${escapeHtml(label)}</th>
              <td>${escapeHtml(formatter ? formatter(application[key], application) : application[key])}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `).join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Admission Application - ${escapeHtml(application.childName)}</title>
  <style>
    body { color: #111827; font-family: Arial, sans-serif; margin: 32px; }
    header { border-bottom: 3px solid #0a7a3d; margin-bottom: 24px; padding-bottom: 16px; text-align: center; }
    h1 { font-size: 24px; margin: 0 0 6px; text-transform: uppercase; }
    header p { margin: 3px 0; }
    h2 { background: #eef5dd; border-left: 4px solid #0a7a3d; font-size: 16px; margin: 24px 0 10px; padding: 8px 10px; text-transform: uppercase; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #d1d5db; padding: 8px 10px; text-align: left; vertical-align: top; }
    th { background: #f8fafc; width: 34%; }
    .attestation { line-height: 1.6; }
    .official-line { border-bottom: 1px solid #111827; display: inline-block; min-width: 220px; }
    @media print { body { margin: 18mm; } button { display: none; } }
  </style>
</head>
<body>
  <header>
    <h1>Rehoboth Prime Years</h1>
    <p>Pre-School, Nursery, Primary, and Secondary</p>
    <p>Plot 7, Golden Spring Estate, Duboyi District, F.C.T Abuja</p>
    <p>Contact: 07034558581 | rehoboth.sch.ng | rehobothprimeyears@gmail.com</p>
    <p><strong>Admission Application</strong></p>
    <p>Application No.: ${escapeHtml(applicationNumber(application))}</p>
    <p>Submitted: ${escapeHtml(formatDateTime(application.createdAt))}</p>
  </header>
  ${sectionMarkup}
  <section>
    <h2>Attestation Statement</h2>
    <p class="attestation">
      I, ${escapeHtml(application.attestationName)}, parent/guardian of ${escapeHtml(application.childName)}, hereby acknowledge and confirm my desire to enroll my child in Rehoboth Prime Years. I understand and agree to the Christian values and educational standards upheld by the school. I commit to supporting my child in adhering to the school's policies and actively participate in ${escapeHtml(application.childName)}'s educational journey.
    </p>
  </section>
  <section>
    <h2>Official Use Only</h2>
    <p>Remark: <span class="official-line"></span></p>
    <p>Date of Registration: <span class="official-line"></span></p>
    <p>Admission No.: <span class="official-line"></span></p>
    <p>Signature: <span class="official-line"></span></p>
  </section>
</body>
</html>`;
}

export default function Applications() {
  const [pendingDelete, setPendingDelete] = useState(null);
  const { data = [], loading, reload } = useApi(() => http.get("/admission-applications"), []);

  async function remove() {
    await http.delete(`/admission-applications/${pendingDelete._id}`);
    toast.success("Application deleted");
    setPendingDelete(null);
    reload();
  }

  function viewApplication(application) {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      toast.error("Allow pop-ups to view this application.");
      return;
    }
    printWindow.document.write(buildPrintableApplication(application));
    printWindow.document.close();
    printWindow.focus();
  }

  function downloadApplication(application) {
    const blob = new Blob([buildPrintableApplication(application)], { type: "text/html;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `admission-application-${slugify(application.childName)}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-950">Admission Forms</h1>
      <p className="mt-2 text-sm text-slate-600">Review and download applications submitted from the public Admissions page.</p>

      <div className="card mt-6 overflow-x-auto">
        {loading ? (
          <p className="p-5">Loading...</p>
        ) : !data.length ? (
          <p className="p-5 text-sm text-slate-600">No admission applications yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3">Applicant</th>
                <th className="p-3">Application No.</th>
                <th className="p-3">Class</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Submitted</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((application) => (
                <tr className="border-t align-top" key={application._id}>
                  <td className="p-3 font-medium">{application.childName}</td>
                  <td className="p-3">{applicationNumber(application)}</td>
                  <td className="p-3">{application.classSought}</td>
                  <td className="p-3">
                    <span className="block font-medium">{application.paymentAmountKobo ? formatKobo(application.paymentAmountKobo) : "-"}</span>
                    <span className="mt-1 block text-xs text-slate-400">{application.paymentReference || "No payment"}</span>
                  </td>
                  <td className="p-3 text-slate-500">
                    {application.parentEmail ? <a className="block hover:text-brand" href={`mailto:${application.parentEmail}`}>{application.parentEmail}</a> : <span className="block">No email</span>}
                    {application.primaryPhone ? <a className="mt-1 block hover:text-brand" href={`tel:${application.primaryPhone}`}>{application.primaryPhone}</a> : <span className="mt-1 block">No phone</span>}
                  </td>
                  <td className="p-3">{formatDateTime(application.createdAt)}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <button className={actionButtonClass} type="button" onClick={() => viewApplication(application)}>
                        <Eye size={16} /> View
                      </button>
                      <button className={actionButtonClass} type="button" onClick={() => downloadApplication(application)}>
                        <Download size={16} /> Download
                      </button>
                      <button className={`${actionButtonClass} text-red-600 hover:bg-red-50`} type="button" onClick={() => setPendingDelete(application)}>
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDeleteModal
        open={Boolean(pendingDelete)}
        title="Delete application?"
        message={`Delete the application from ${pendingDelete?.childName || "this student"}?`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={remove}
      />
    </div>
  );
}
