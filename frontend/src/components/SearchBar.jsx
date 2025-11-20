import { motion } from 'framer-motion';
import { Search, X, Filter } from 'lucide-react';
import './SearchBar.css';

const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  onClear,
  filterOptions = [],
  selectedFilter,
  onFilterChange
}) => {
  return (
    <motion.div 
      className="aesthetic-search-bar glass-panel"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="search-input-wrapper">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="search-input"
        />
        {value && (
          <button onClick={onClear} className="clear-button">
            <X size={16} />
          </button>
        )}
      </div>

      {filterOptions.length > 0 && (
        <div className="filter-wrapper">
          <div className="filter-divider"></div>
          <div className="filter-dropdown-container">
            <Filter size={18} className="filter-icon" />
            <select 
              value={selectedFilter} 
              onChange={(e) => onFilterChange(e.target.value)}
              className="filter-select"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SearchBar;
