import React, { useState } from 'react';
import { CommitType } from './ChangelogItem';

interface DateRange {
  startDate: string;
  endDate: string;
}

interface ChangelogFilterProps {
  onFilterChange: (filters: {
    type: CommitType | 'all';
    searchQuery: string;
    dateRange: DateRange | null;
  }) => void;
  activeType: CommitType | 'all';
}

const ChangelogFilter: React.FC<ChangelogFilterProps> = ({ onFilterChange, activeType }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [type, setType] = useState<CommitType | 'all'>(activeType || 'all');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  const handleTypeChange = (newType: CommitType | 'all') => {
    setType(newType);
    onFilterChange({
      type: newType,
      searchQuery,
      dateRange,
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onFilterChange({
      type,
      searchQuery: value,
      dateRange,
    });
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const updatedDateRange = dateRange ? { ...dateRange } : { startDate: '', endDate: '' };
    updatedDateRange[field] = value;
    
    setDateRange(updatedDateRange);
    
    if (updatedDateRange.startDate || updatedDateRange.endDate) {
      onFilterChange({
        type,
        searchQuery,
        dateRange: updatedDateRange,
      });
    } else {
      onFilterChange({
        type,
        searchQuery,
        dateRange: null,
      });
    }
  };

  const toggleDateFilter = () => {
    setShowDateFilter(!showDateFilter);
    if (showDateFilter && dateRange) {
      setDateRange(null);
      onFilterChange({
        type,
        searchQuery,
        dateRange: null,
      });
    }
  };

  const commitTypes: Array<CommitType | 'all'> = [
    'all', 'feature', 'fix', 'docs', 'chore', 'refactor', 'test', 'style', 'other'
  ];

  return (
    <div className="changelog-filter-container">
      <div className="filter-row">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search commits..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
            aria-label="Search commits"
          />
        </div>
        
        <div className="type-filter">
          <select 
            value={type}
            onChange={(e) => handleTypeChange(e.target.value as CommitType | 'all')}
            className="type-select"
            aria-label="Filter by commit type"
          >
            {commitTypes.map(commitType => (
              <option key={commitType} value={commitType}>
                {commitType === 'all' ? 'All Types' : commitType.charAt(0).toUpperCase() + commitType.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={toggleDateFilter}
          className={`date-toggle-btn ${showDateFilter ? 'active' : ''}`}
        >
          {showDateFilter ? 'Hide Date Filter' : 'Show Date Filter'}
        </button>
      </div>

      {showDateFilter && (
        <div className="date-filter-row">
          <div className="date-input-group">
            <label htmlFor="start-date">From:</label>
            <input
              id="start-date"
              type="date"
              value={dateRange?.startDate || ''}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="date-input"
            />
          </div>
          <div className="date-input-group">
            <label htmlFor="end-date">To:</label>
            <input
              id="end-date"
              type="date"
              value={dateRange?.endDate || ''}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className="date-input"
            />
          </div>
        </div>
      )}

      <style jsx>{`
        .changelog-filter-container {
          margin-bottom: 24px;
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 16px;
        }

        .filter-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 12px;
          align-items: center;
        }

        .search-container {
          flex: 1;
          min-width: 200px;
        }

        .search-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          font-size: 0.9rem;
          transition: border-color 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #0070f3;
        }

        .type-filter {
          width: 150px;
        }

        .type-select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          background-color: white;
          font-size: 0.9rem;
          cursor: pointer;
        }

        .type-select:focus {
          outline: none;
          border-color: #0070f3;
        }

        .date-toggle-btn {
          background-color: white;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          padding: 8px 12px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .date-toggle-btn:hover {
          background-color: #f0f0f0;
        }

        .date-toggle-btn.active {
          background-color: #e6f7ff;
          border-color: #0070f3;
          color: #0070f3;
        }

        .date-filter-row {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-items: center;
          animation: fadeIn 0.3s ease;
        }

        .date-input-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .date-input {
          padding: 6px 10px;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .date-input:focus {
          outline: none;
          border-color: #0070f3;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .filter-row {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-container, .type-filter {
            width: 100%;
          }

          .date-filter-row {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
};

export default ChangelogFilter;