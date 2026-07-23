import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";
import { useApi } from "../../hooks/useApi";
import Loader from "../../components/public/Loader";
import ErrorMessage from "../../components/public/ErrorMessage";
import { GalleryCard } from "../../components/public/Cards";
import { localGallery } from "./localGallery";

const PAGE_SIZE = 24;

export default function Gallery() {
  const [category, setCategory] = useState("");
  const [active, setActive] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { data, loading, error } = useApi(() => http.get("/gallery"), [], {
    cacheKey: "gallery",
    fallbackData: localGallery,
  });
  const allItems = useMemo(() => {
    const byId = new Map();
    [...localGallery, ...(data || [])].forEach((item) => byId.set(item._id, item));
    return [...byId.values()];
  }, [data]);
  const items = useMemo(
    () => allItems.filter((item) => !category || item.category === category),
    [allItems, category]
  );
  const categories = useMemo(
    () => [...new Set(allItems.map((item) => item.category).filter(Boolean))].sort(),
    [allItems]
  );

  useEffect(() => setVisibleCount(PAGE_SIZE), [category]);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;
  return (
    <main className="container-pad py-14">
      <h1 className="text-4xl font-black">Gallery</h1>
      <select className="input mt-6 max-w-xs" value={category} onChange={(event) => setCategory(event.target.value)}>
        <option value="">All categories</option>
        {categories.map((itemCategory) => <option key={itemCategory}>{itemCategory}</option>)}
      </select>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {items.slice(0, visibleCount).map((item) => (
          <GalleryCard key={item._id} item={item} onOpen={setActive} />
        ))}
      </div>
      {visibleCount < items.length && (
        <div className="mt-8 text-center">
          <button className="btn btn-primary" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
            Load more
          </button>
        </div>
      )}
      {active && (
        <button
          type="button"
          aria-label="Close image preview"
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4"
          onClick={() => setActive(null)}
        >
          <img src={active.image} alt={active.title} className="max-h-[85vh] rounded-lg object-contain" />
        </button>
      )}
    </main>
  );
}
