import React, { useState, useEffect } from 'react';
import { exec } from 'child_process';
import { promisify } from 'util';

import ChangelogItem, { Commit, CommitType } from './ChangelogItem';
import ChangelogFilter from './ChangelogFilter';
import Pagination from './Pagination';
import styles from './changelog.module.css';

// Convert exec to Promise-based
const execPromise = promisify(exec);

// Number of commits to display per page
const COMMITS_PER_PAGE = 10;

interface DateRange {
  startDate: string;
  endDate: string;
}

interface Filters {
  type: CommitType | 'all';
  searchQuery: string;
  dateRange: DateRange | null;
}

const Changelog: React.FC = () => {
  // State for storing the commits
  const [commits, setCommits] = useState<Commit[]>([]);
  const [filteredCommits, setFilteredCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCommits, setTotalCommits] = useState(0);

  // State for filters
  const [filters, setFilters] = useState<Filters>({
    type: 'all',
    searchQuery: '',
    dateRange: null,
  });

  // Function to detect commit type from commit message
  const detectCommitType = (message: string): CommitType => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.startsWith('feat') || lowerMessage.includes(': feat')) {
      return 'feature';
    } else if (lowerMessage.startsWith('fix') || lowerMessage.includes(': fix')) {
      return 'fix';
    } else if (lowerMessage.startsWith('docs') || lowerMessage.includes(': docs')) {
      return 'docs';
    } else if (lowerMessage.startsWith('chore') || lowerMessage.includes(': chore')) {
      return 'chore';
    } else if (lowerMessage.startsWith('refactor') || lowerMessage.includes(': refactor')) {
      return 'refactor';
    } else if (lowerMessage.startsWith('test') || lowerMessage.includes(': test')) {
      return 'test';
    } else if (lowerMessage.startsWith('style') || lowerMessage.includes(': style')) {
      return 'style';
    }
    
    return 'other';
  };

  // Function to fetch git history with pagination
  const fetchGitHistory = async (page: number = 1) => {
    setLoading(true);
    try {
      // First, get total number of commits for pagination
      const { stdout: countOutput } = await execPromise('git rev-list --count HEAD');
      const totalCount = parseInt(countOutput.trim(), 10);
      setTotalCommits(totalCount);
      
      // Calculate offset for pagination
      const skip = (page - 1) * COMMITS_PER_PAGE;
      
      // Fetch commits with pagination
      const { stdout } = await execPromise(
        `git log --pretty=format:"%h|%an|%ad|%s" --date=short -n ${COMMITS_PER_PAGE} --skip=${skip}`
      );
      
      if (!stdout.trim()) {
        setCommits([]);
        setFilteredCommits([]);
        setLoading(false);
        return;
      }
      
      // Parse the git log output
      const logEntries = stdout
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => {
          const [hash, author, date, ...messageParts] = line.split('|');
          const message = messageParts.join('|'); // In case commit message contains the delimiter
          const type = detectCommitType(message);
          return { hash, author, date, message, type };
        });
        
      setCommits(logEntries);
      applyFilters(logEntries, filters);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching git log:', err);
      setError('Failed to load git history. This could be because the component is running in a build environment without git access.');
      setLoading(false);
    }
  };

  // Apply filters to commits
  const applyFilters = (commitsToFilter: Commit[], currentFilters: Filters) => {
    let result = [...commitsToFilter];
    
    // Filter by type
    if (currentFilters.type !== 'all') {
      result = result.filter(commit => commit.type === currentFilters.type);
    }
    
    // Filter by search query
    if (currentFilters.searchQuery.trim()) {
      const query = currentFilters.searchQuery.toLowerCase();
      result = result.filter(
        commit => 
          commit.message.toLowerCase().includes(query) || 
          commit.author.toLowerCase().includes(query) ||
          commit.hash.toLowerCase().includes(query)
      );
    }
    
    // Filter by date range
    if (currentFilters.dateRange) {
      const { startDate, endDate } = currentFilters.dateRange;
      
      if (startDate) {
        result = result.filter(commit => {
          const commitDate = new Date(commit.date);
          const filterStart = new Date(startDate);
          return commitDate >= filterStart;
        });
      }
      
      if (endDate) {
        result = result.filter(commit => {
          const commitDate = new Date(commit.date);
          const filterEnd = new Date(endDate);
          // Add one day to include the end date fully
          filterEnd.setDate(filterEnd.getDate() + 1);
          return commitDate < filterEnd;
        });
      }
    }
    
    setFilteredCommits(result);
  };

  // Handler for filter changes
  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    applyFilters(commits, newFilters);
  };

  // Handler for page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchGitHistory(page);
  };

  // Initial data fetch
  useEffect(() => {
    fetchGitHistory(currentPage);
  }, []);

  const totalPages = Math.ceil(totalCommits / COMMITS_PER_PAGE);

  return (
    <div className={styles['changelog-container']}>
      <div className={styles['changelog-header']}>
        <h1>Project Changelog</h1>
        <p>Track all changes to the project, organized by type and date.</p>
      </div>

      <ChangelogFilter 
        onFilterChange={handleFilterChange} 
        activeType={filters.type} 
      />
      
      {loading ? (
        <div className={styles['loading-container']}>
          <div className={styles['loading-spinner']} />
          <p>Loading commit history...</p>
        </div>
      ) : error ? (
        <div className={styles['error-container']}>
          <p>{error}</p>
          <p>You may need to view this page in development mode with git repository access.</p>
        </div>
      ) : filteredCommits.length === 0 ? (
        <div className={styles['empty-state']}>
          <p>No commits found matching your criteria.</p>
        </div>
      ) : (
        <div className={styles['fade-in']}>
          <ul className={styles['changelog-list']}>
            {filteredCommits.map((commit) => (
              <li key={commit.hash}>
                <ChangelogItem commit={commit} />
              </li>
            ))}
          </ul>
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default Changelog;