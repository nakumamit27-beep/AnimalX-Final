import { useState, useEffect, useCallback } from "react";
import { useSearch, Link } from "wouter";
import animals, { categories } from "../data/animals";
import AnimalCard from "../components/AnimalCard";
import CategoryFilter from "../components/CategoryFilter";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 40;
const CATEGORY_FREE_LIMIT = 130;

function isLockedAnimal(animal) {
  const localIndex = (animal.id - 1) % 150;
  return localIndex >= CATEGORY_FREE_LIMIT;
}

export default function Animals() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const urlCategory = params.get("category");
  const { isPremium } = useAuth();

  const [activeCategory, setActiveCategory] = useState(urlCategory || "All");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (urlCategory && categories.includes(urlCategory)) {
      setActiveCategory(urlCategory);
    }
  }, [urlCategory]);

  const filtered = animals.filter(a => {
    const matchCat = activeCategory === "All" || a.category === activeCategory;
    const matchSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeCategory, searchQuery]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + PAGE_SIZE);
      setLoading(false);
    }, 400);
  }, [loading, hasMore]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 300) {
        loadMore();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMore]);

  const freeCount = filtered.filter(a => !isLockedAnimal(a)).length;
  const lockedCount = filtered.filter(a => isLockedAnimal(a)).length;

  return (
    <div className="animals-page">
      <div className="animals-header">
        <h1 className="page-title">Wildlife Explorer</h1>
        <p className="page-subtitle">Discover {animals.length.toLocaleString()} incredible creatures and natural wonders</p>
        {!isPremium && (
          <div className="free-notice">
            🔒 Free: {freeCount} visible, {lockedCount} locked per category.{" "}
            <Link href="/premium" className="premium-cta-link">Unlock all with Premium 👑</Link>
          </div>
        )}
        <div className="search-bar">
          <input
            type="search"
            placeholder="Search animals, categories..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <CategoryFilter
        categories={["All", ...categories]}
        active={activeCategory}
        onChange={cat => setActiveCategory(cat)}
      />

      <div className="animals-stats">
        <span>
          {isPremium
            ? `Showing ${Math.min(visible.length, filtered.length)} of ${filtered.length} results`
            : `Showing ${freeCount} free of ${filtered.length} results`}
        </span>
      </div>

      <div className="animals-grid">
        {visible.map(animal => {
          if (!isPremium && isLockedAnimal(animal)) {
            return (
              <Link key={`locked-${animal.id}`} href="/premium" className="locked-card">
                <div className="locked-icon">🔒</div>
                <div className="locked-name">{animal.name}</div>
                <div className="locked-label">Premium Only</div>
              </Link>
            );
          }
          return <AnimalCard key={animal.id} animal={animal} />;
        })}
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
