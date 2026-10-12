import React from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

const SearchBar = ({ search, setSearch, category, setCategory, sort, setSort }) => {
  const categories = ['All Categories', 'Electronics', 'Fashion', 'Books', 'Home'];

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.85rem',
      alignItems: 'center',
      marginBottom: '1.5rem',
      background: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      padding: '0.85rem 1rem',
      borderRadius: '0.5rem'
    }}>
      {/* Search Input */}
      <div style={{ position: 'relative', flex: '1 1 250px' }}>
        <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input
          type="text"
          className="form-input"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: '2.3rem' }}
        />
      </div>

      {/* Category Dropdown Filter */}
      <div style={{ position: 'relative', flex: '0 1 180px' }}>
        <Filter size={14} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <select
          className="form-input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ paddingLeft: '2.2rem', cursor: 'pointer' }}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat === 'All Categories' ? '' : cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Sorting Dropdown (Bonus Challenge +10 Marks) */}
      <div style={{ position: 'relative', flex: '0 1 180px' }}>
        <ArrowUpDown size={14} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <select
          className="form-input"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{ paddingLeft: '2.2rem', cursor: 'pointer' }}
        >
          <option value="">Sort: Default</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
};

export default SearchBar;
