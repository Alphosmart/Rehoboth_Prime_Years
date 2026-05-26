import { ExternalLink } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { defaultSettings } from "../../data/defaultContent";

export default function Portal() {
  const { settings } = useOutletContext();
  const portalUrl = settings?.portalUrl || defaultSettings.portalUrl;
  return <main className="container-pad py-20"><div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-wide text-schoolBlue">School Portal</p><h1 className="mt-2 text-4xl font-black">Parent/student login portal</h1><p className="mt-4 text-slate-600">Parents, students, and staff can continue to use the official portal for records, assignments, payments, and account services.</p><a className="btn-primary mt-8" href={portalUrl} target="_blank" rel="noreferrer"><ExternalLink size={18} /> Open portal</a></div></main>;
}
