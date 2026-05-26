import { useCallback, useEffect, useRef, useState } from "react";
import { normalizeLegacyBrand } from "../utils/legacyBrand";

const CACHE_PREFIX = "rehoboth-api-cache:v1:";

function hasContent(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return Object.values(value).some(hasContent);
  return value !== null && value !== undefined && value !== "";
}

function mergeWithFallback(fallbackData, nextData) {
  if (!fallbackData || !nextData || Array.isArray(fallbackData) || Array.isArray(nextData) || typeof fallbackData !== "object" || typeof nextData !== "object") {
    return nextData;
  }

  const merged = { ...nextData };
  Object.entries(fallbackData).forEach(([key, fallbackValue]) => {
    if (!hasContent(nextData[key])) {
      merged[key] = fallbackValue;
    }
  });
  return merged;
}

function readCache(cacheKey) {
  if (!cacheKey || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`${CACHE_PREFIX}${cacheKey}`);
    if (!raw) return null;
    return JSON.parse(raw).data || null;
  } catch {
    return null;
  }
}

function writeCache(cacheKey, data) {
  if (!cacheKey || typeof window === "undefined" || !hasContent(data)) return;
  try {
    window.localStorage.setItem(`${CACHE_PREFIX}${cacheKey}`, JSON.stringify({ data, savedAt: Date.now() }));
  } catch {
    // Storage can be unavailable or full; the live response should still render.
  }
}

function getInitialData(cacheKey, fallbackData) {
  const cachedData = readCache(cacheKey);
  return hasContent(cachedData) ? mergeWithFallback(fallbackData, cachedData) : fallbackData;
}

export function useApi(loader, deps = [], options = {}) {
  const { cacheKey = "", fallbackData = null, retryDelayMs = 5000, retryOnError = Boolean(cacheKey) } = options;
  const retryTimerRef = useRef(null);
  const [data, setData] = useState(() => normalizeLegacyBrand(getInitialData(cacheKey, fallbackData)));
  const [loading, setLoading] = useState(() => !hasContent(getInitialData(cacheKey, fallbackData)));
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const cachedData = readCache(cacheKey);
    const initialData = hasContent(cachedData) ? mergeWithFallback(fallbackData, cachedData) : fallbackData;
    setLoading(!hasContent(initialData));
    setError("");
    try {
      const result = await loader();
      const nextData = result.data;
      const nextMergedData = fallbackData && !hasContent(nextData) ? fallbackData : mergeWithFallback(fallbackData, nextData);
      const normalizedData = normalizeLegacyBrand(nextMergedData);
      setData(normalizedData);
      writeCache(cacheKey, normalizedData);
    } catch (err) {
      const fallbackOrCachedData = hasContent(cachedData) ? mergeWithFallback(fallbackData, cachedData) : fallbackData;
      if (hasContent(fallbackOrCachedData)) {
        setData(normalizeLegacyBrand(fallbackOrCachedData));
        if (retryOnError && typeof window !== "undefined") {
          window.clearTimeout(retryTimerRef.current);
          retryTimerRef.current = window.setTimeout(load, retryDelayMs);
        }
      } else {
        setError(err.response?.data?.message || err.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }, [cacheKey, fallbackData, retryDelayMs, retryOnError, ...deps]);

  useEffect(() => {
    load();
    return () => {
      if (typeof window !== "undefined") window.clearTimeout(retryTimerRef.current);
    };
  }, [load]);

  return { data, loading, error, reload: load, setData };
}
