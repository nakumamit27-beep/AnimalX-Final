import { useState, useEffect, useCallback } from "react";
import { useSearch } from "wouter";
import animals, { categories } from "../data/animals";
import AnimalCard from "../components/AnimalCard";
import CategoryFilter from "../components/CategoryFilter";

const PAGE_SIZE = 20;

export default function Animals() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const urlCategory = params.get("category");

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
    const matchSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  return (
    <div className="animals-page">
      <div className="animals-header">
        <h1 className="page-title">Wildlife Explorer</h1>
        <p className="page-subtitle">Discover {animals.length.toLocaleString()} incredible creatures and natural wonders</p>
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
        <span>Showing {visible.length} of {filtered.length} results</span>
      </div>

      <div className="animals-grid">
        {visible.map(animal => (
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
        <div className="end-message">You've seen all {filtered.length} results ✓</div>
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
