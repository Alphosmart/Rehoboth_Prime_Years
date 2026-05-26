import { Facebook, Instagram, Menu, MessageCircle, X, Youtube } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import http from "../api/http";
import { useApi } from "../hooks/useApi";
import { defaultSettings } from "../data/defaultContent";

const links = [
  ["Home", "/"],
  ["About", "/about"],
  ["Academics", "/academics"],
  ["Admissions", "/admissions"],
  ["Blog", "/blog"],
  ["Gallery", "/gallery"],
  ["Events", "/events"],
  ["Staff", "/staff"],
  ["FAQ", "/faq"],
  ["Contact", "/contact"]
];

function isProductionUnsafeMediaUrl(url) {
  if (!url) return true;
  if (url.startsWith("data:") || url.startsWith("blob:")) return false;
  if (typeof window !== "undefined") {
    try {
      const parsedUrl = new URL(url, window.location.origin);
      if (["localhost", "127.0.0.1", "::1"].includes(parsedUrl.hostname)) return window.location.hostname !== parsedUrl.hostname;
    } catch {
      return true;
    }
  }
  return false;
}

function safeMediaUrl(url, fallback) {
  return isProductionUnsafeMediaUrl(url) ? fallback : url;
}

function toWhatsAppNumber(value) {
  const digits = value?.replace(/[^\d]/g, "") || "";
  if (!digits) return "";
  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0")) return `234${digits.slice(1)}`;
  return digits;
}

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { data: settings } = useApi(() => http.get("/settings"), [], { cacheKey: "settings-v3", fallbackData: defaultSettings });
  const whatsapp = toWhatsAppNumber(settings?.whatsapp);
  const fallbackLogo = defaultSettings.logo;
  const logoSrc = safeMediaUrl(settings?.logo, fallbackLogo);
  const portalUrl = settings?.portalUrl || defaultSettings.portalUrl;

  useEffect(() => {
    const fallbackIcon = defaultSettings.favicon || fallbackLogo;
    const href = safeMediaUrl(settings?.favicon || settings?.logo, fallbackIcon);
    if (!href) return;
    let link = document.querySelector("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = href;
    if (href === fallbackIcon) return;

    let cancelled = false;
    const img = new Image();
    img.onerror = () => {
      if (!cancelled) link.href = fallbackIcon;
    };
    img.src = href;
    return () => {
      cancelled = true;
    };
  }, [fallbackLogo, settings?.favicon, settings?.logo]);

  return (
    <div className="min-h-screen bg-[#FAFBF8]">
      <header className="sticky top-0 z-40 border-b border-schoolLime/35 bg-white/95 backdrop-blur">
        <div className="hidden bg-[#24391d] py-2 text-sm text-white lg:block">
          <div className="container-pad flex items-center justify-between gap-6">
            <p className="font-medium text-accent">{settings?.motto || "Growing in wisdom and favour with God and Man"}</p>
            <p className="truncate text-white/85">{settings?.phone}</p>
          </div>
        </div>
        <div className="container-pad flex h-20 items-center justify-between">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img
              src={logoSrc}
              alt=""
              className="h-12 w-12 rounded-md bg-white object-contain p-0.5 shadow-sm ring-1 ring-schoolLime/45"
              onError={(event) => {
                if (event.currentTarget.dataset.fallbackApplied) return;
                event.currentTarget.dataset.fallbackApplied = "true";
                event.currentTarget.src = fallbackLogo;
              }}
            />
            <span className="max-w-[210px] text-lg font-black leading-tight text-slate-950">{settings?.schoolName || "School"}</span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            <a className="rounded-full bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-[#006b31]" href={portalUrl} target="_blank" rel="noreferrer">Login</a>
            {links.map(([label, to]) => <NavLink key={to} to={to} className={({ isActive }) => `rounded-full px-3 py-2 text-sm font-semibold ${isActive ? "bg-schoolLime/20 text-brand" : "text-slate-700 hover:bg-accent/20 hover:text-slate-950"}`}>{label}</NavLink>)}
          </nav>
          <button className="grid h-10 w-10 place-items-center rounded-md border border-schoolLime/45 bg-white text-brand lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
        {open && (
          <nav className="container-pad grid gap-2 border-t border-schoolLime/35 pb-5 pt-4 lg:hidden">
            <a className="btn-primary" href={portalUrl} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>Login</a>
            {links.map(([label, to]) => <NavLink key={to} onClick={() => setOpen(false)} to={to} className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-schoolLime/20 hover:text-brand">{label}</NavLink>)}
          </nav>
        )}
      </header>
      <Outlet context={{ settings }} />
      {whatsapp && <a className="fixed bottom-5 right-5 z-40 rounded-full bg-brand p-4 text-white shadow-lg hover:bg-[#4f6b2a]" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle /></a>}
      <footer className="border-t border-schoolGreen bg-[#24391d] text-white">
        <div className="container-pad grid gap-8 py-12 md:grid-cols-4">
          <div>
            <h2 className="text-xl font-bold">{settings?.schoolName}</h2>
            <p className="mt-3 text-sm leading-6 text-white/85">{settings?.footerText}</p>
          </div>
          <div>
            <h3 className="font-semibold text-accent">Quick Links</h3>
            <div className="mt-3 grid gap-2 text-sm">{links.slice(1, 6).map(([label, to]) => <Link key={to} to={to} className="text-white/85 hover:text-accent">{label}</Link>)}</div>
          </div>
          <div>
            <h3 className="font-semibold text-accent">Contact</h3>
            <p className="mt-3 text-sm leading-6 text-white/85">{settings?.address}</p>
            <p className="mt-2 text-sm text-white/85">{settings?.phone}</p>
            <p className="mt-2 text-sm text-white/85">{settings?.email}</p>
          </div>
          <div>
            <h3 className="font-semibold text-accent">Connect</h3>
            <div className="mt-3 flex gap-3 text-white/85">
              {settings?.facebookUrl && <a href={settings.facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:text-accent"><Facebook size={20} /></a>}
              {settings?.instagramUrl && <a href={settings.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-accent"><Instagram size={20} /></a>}
              {settings?.youtubeUrl && <a href={settings.youtubeUrl} target="_blank" rel="noreferrer" aria-label="YouTube" className="hover:text-accent"><Youtube size={20} /></a>}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
