import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Resets scroll position to the top on every route change. Handles both the
// public site (window scroll) and the admin panel, whose content lives in an
// independently-scrolling column marked with [data-scroll-container].
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.querySelectorAll("[data-scroll-container]").forEach((el) => {
      el.scrollTop = 0;
    });
  }, [pathname]);

  return null;
}
