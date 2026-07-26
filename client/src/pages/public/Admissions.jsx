import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import http from "../../api/http";
import { useApi } from "../../hooks/useApi";
import Loader from "../../components/public/Loader";
import ErrorMessage from "../../components/public/ErrorMessage";
import RichContent from "../../components/public/RichContent";
import { setSeo } from "../../utils/seo";
import { defaultAdmissions } from "../../data/defaultContent";

export default function Admissions() {
  const { data, loading, error } = useApi(() => http.get("/admissions"), [], { cacheKey: "admissions", fallbackData: defaultAdmissions });
  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;
  setSeo(data.seoTitle || data.title, data.seoDescription);
  return <main className="container-pad py-14"><h1 className="text-4xl font-black">{data.title}</h1><RichContent as="article" className="prose mt-6 max-w-none" html={data.content} /><div className="mt-6"><Link className="btn bg-brand text-white hover:bg-[#006b31]" to="/admissions/apply">Apply <ArrowRight size={18} /></Link></div><section className="mt-10 grid gap-6 md:grid-cols-2"><div className="card p-6"><h2 className="text-2xl font-bold">Requirements</h2><ul className="mt-4 space-y-2">{data.requirements?.map((r) => <li key={r}>{r}</li>)}</ul></div><div className="card p-6"><h2 className="text-2xl font-bold">Process</h2><div className="mt-4 space-y-4">{data.processSteps?.map((s) => <div key={s.title}><h3 className="font-semibold">{s.title}</h3><p className="text-sm text-slate-600">{s.description}</p></div>)}</div></div></section></main>;
}
