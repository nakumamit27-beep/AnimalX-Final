import { useState, useEffect, useLayoutEffect, useCallback, useMemo, useRef } from "react";
import { useSearch } from "wouter";
import animals, { categories } from "../data/animals";
import AnimalCard from "../components/AnimalCard";
import CategoryFilter from "../components/CategoryFilter";
import { getCustomAnimals } from "../utils/customAnimals";

const PAGE_SIZE = 40;
const SCROLL_KEY = "ax_animals_scroll_state";

function saveScrollState(state) {
  try { sessionStorage.setItem(SCROLL_KEY, JSON.stringify(state)); } catch {}
}
function loadScrollState() {
  try { return JSON.parse(sessionStorage.getItem(SCROLL_KEY) || "null"); } catch { return null; }
}

export default function Animals() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const urlCategory = params.get("category");
  const urlQuery = params.get("q") || "";

  /* Restore state from sessionStorage if coming back from a detail page */
  const savedState = useRef(null);
  const [stateRestored, setStateRestored] = useState(false);
  if (!stateRestored) {
    const fromDetail = sessionStorage.getItem("ax_back_from_detail");
    if (fromDetail) {
      savedState.current = loadScrollState();
      sessionStorage.removeItem("ax_back_from_detail");
    }
  }

  const initCategory = savedState.current?.category ?? (urlCategory || "All");
  const initQuery    = savedState.current?.query    ?? urlQuery;
  const initVisible  = savedState.current?.visible  ?? PAGE_SIZE;

  const [activeCategory, setActiveCategory] = useState(initCategory);
  const [searchQuery, setSearchQuery] = useState(initQuery);
  const [visibleCount, setVisibleCount] = useState(initVisible);
  const [loading, setLoading] = useState(false);
  const [customAnimals, setCustomAnimals] = useState(() => getCustomAnimals());

  /* After mount, restore scroll position instantly */
  useLayoutEffect(() => {
    setStateRestored(true);
    if (savedState.current?.scrollY) {
      const y = savedState.current.scrollY;
      requestAnimationFrame(() => window.scrollTo(0, y));
    }
  }, []);

  /* Continuously save scroll + filter state while on this page */
  useEffect(() => {
    let raf = null;
    function onScroll() {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        saveScrollState({
          scrollY: window.scrollY,
          category: activeCategory,
          query: searchQuery,
          visible: visibleCount,
        });
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [activeCategory, searchQuery, visibleCount]);

  useEffect(() => {
    if (urlCategory && categories.includes(urlCategory)) setActiveCategory(urlCategory);
  }, [urlCategory]);

  useEffect(() => {
    if (urlQuery) setSearchQuery(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    function refresh() { setCustomAnimals(getCustomAnimals()); }
    window.addEventListener("ax-custom-animals-changed", refresh);
    return () => window.removeEventListener("ax-custom-animals-changed", refresh);
  }, []);

  const allAnimals = useMemo(() => [...customAnimals, ...animals], [customAnimals]);

  const filtered = useMemo(() => allAnimals.filter((a) => {
    const matchCat = activeCategory === "All" || a.category === activeCategory;
    const matchSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  }), [allAnimals, activeCategory, searchQuery]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  function handleCategoryChange(cat) {
    setActiveCategory(cat);
    setVisibleCount(PAGE_SIZE);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSearchChange(q) {
    setSearchQuery(q);
    setVisibleCount(PAGE_SIZE);
  }

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + PAGE_SIZE);
      setLoading(false);
    }, 200);
  }, [loading, hasMore]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 300) {
        loadMore();
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMore]);

  return (
    <div className="animals-page">
      <div className="animals-header">
        <h1 className="page-title">Wildlife Explorer</h1>
        <p className="page-subtitle">
          Discover {allAnimals.length.toLocaleString()} incredible creatures and natural wonders — all free.
        </p>
        <div className="search-bar">
          <input
            type="search"
            placeholder="Search animals, categories..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <CategoryFilter
        categories={["All", ...categories]}
        active={activeCategory}
        onChange={handleCategoryChange}
      />

      <div className="animals-stats">
        <span>Showing {Math.min(visible.length, filtered.length)} of {filtered.length} results</span>
      </div>

      <div className="animals-grid">
        {visible.map((animal) => (
          <AnimalCard key={animal.id} animal={animal} />
        ))}
      </div>

      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span>Loading more...</span>
        </div>
      )}

      {!hasMore && filtered.length > 0 && (
        <div className="end-message">All {filtered.length} results shown ✓</div>
      )}

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-emoji">🔍</div>
          <p>No results found for "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}
