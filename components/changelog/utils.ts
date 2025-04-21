import { exec } from 'child_process';
import { promisify } from 'util';

// Types
export type CommitType = 'feature' | 'fix' | 'docs' | 'chore' | 'refactor' | 'test' | 'style' | 'other';

export interface Commit {
  hash: string;
  author: string;
  date: string;
  message: string;
  type: CommitType;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface CommitFilters {
  type: CommitType | 'all';
  searchQuery: string;
  dateRange: DateRange | null;
}

// Constants
export const COMMITS_PER_PAGE = 10;

// Convert Node.js exec to Promise-based
const execPromise = promisify(exec);

/**
 * Fetches git history with pagination and filtering options
 * 
 * @param page Current page number, starting from 1
 * @param perPage Number of commits per page
 * @returns Object containing commit data and total count
 */
export async function fetchGitHistory(page = 1, perPage = COMMITS_PER_PAGE): Promise<{ commits: Commit[], totalCount: number }> {
  try {
    // Get total number of commits for pagination
    const { stdout: countOutput } = await execPromise('git rev-list --count HEAD');
    const totalCount = parseInt(countOutput.trim(), 10);
    
    // Calculate offset for pagination
    const skip = (page - 1) * perPage;
    
    // Fetch commits with pagination
    const { stdout } = await execPromise(
      `git log --pretty=format:"%h|%an|%ad|%s" --date=short -n ${perPage} --skip=${skip}`
    );
    
    if (!stdout.trim()) {
      return { commits: [], totalCount };
    }
    
    // Parse the git log output
    const commits = parseGitLog(stdout);
    
    return { commits, totalCount };
  } catch (err) {
    console.error('Error fetching git log:', err);
    throw new Error('Failed to fetch git history. This could be because the component is running in a build environment without git access.');
  }
}

/**
 * Parse raw git log output into structured commit objects
 * 
 * @param logOutput Raw git log output string
 * @returns Array of parsed Commit objects
 */
export function parseGitLog(logOutput: string): Commit[] {
  return logOutput
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => {
      const [hash, author, date, ...messageParts] = line.split('|');
      const message = messageParts.join('|'); // In case commit message contains the delimiter
      const type = detectCommitType(message);
      return { 
        hash, 
        author, 
        date, 
        message, 
        type 
      };
    });
}

/**
 * Detect commit type from commit message using conventional commit format
 * 
 * @param message The commit message to analyze
 * @returns Detected commit type
 */
export function detectCommitType(message: string): CommitType {
  const lowerMessage = message.toLowerCase();
  
  // Check for conventional commit format or common patterns
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
  
  // Secondary check for common keywords if the format doesn't match the above
  if (lowerMessage.includes('add') || lowerMessage.includes('new') || lowerMessage.includes('implement')) {
    return 'feature';
  } else if (lowerMessage.includes('fix') || lowerMessage.includes('bug') || lowerMessage.includes('issue')) {
    return 'fix';
  } else if (lowerMessage.includes('document') || lowerMessage.includes('readme') || lowerMessage.includes('comment')) {
    return 'docs';
  } else if (lowerMessage.includes('clean') || lowerMessage.includes('update') || lowerMessage.includes('upgrade')) {
    return 'chore';
  }
  
  return 'other';
}

/**
 * Apply filters to a list of commits
 * 
 * @param commits List of commits to filter
 * @param filters Filter criteria to apply
 * @returns Filtered list of commits
 */
export function filterCommits(commits: Commit[], filters: CommitFilters): Commit[] {
  let result = [...commits];
  
  // Filter by type
  if (filters.type !== 'all') {
    result = result.filter(commit => commit.type === filters.type);
  }
  
  // Filter by search query
  if (filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase();
    result = result.filter(
      commit => 
        commit.message.toLowerCase().includes(query) || 
        commit.author.toLowerCase().includes(query) ||
        commit.hash.toLowerCase().includes(query)
    );
  }
  
  // Filter by date range
  if (filters.dateRange) {
    const { startDate, endDate } = filters.dateRange;
    
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
  
  return result;
}

/**
 * Format a date string to a more user-friendly format
 * 
 * @param dateStr Date string in YYYY-MM-DD format
 * @param format Desired format ('relative' for relative time, 'long' for full date, 'short' for compact date)
 * @returns Formatted date string
 */
export function formatDate(dateStr: string, format: 'relative' | 'long' | 'short' = 'long'): string {
  const date = new Date(dateStr);
  
  if (format === 'relative') {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    }
  } else if (format === 'long') {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  } else {
    // Short format
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  }
}

/**
 * Gets color scheme for different commit types
 * 
 * @param type Commit type
 * @returns Object with background, text, and border colors
 */
export function getCommitTypeColors(type: CommitType): { bg: string; text: string; border: string } {
  const typeColors: Record<CommitType, { bg: string; text: string; border: string }> = {
    feature: { bg: '#e6f7ff', text: '#0070f3', border: '#0070f3' },
    fix: { bg: '#fff2e8', text: '#d46b08', border: '#ffbb96' },
    docs: { bg: '#f6ffed', text: '#389e0d', border: '#b7eb8f' },
    chore: { bg: '#f9f0ff', text: '#722ed1', border: '#d3adf7' },
    refactor: { bg: '#e6fffb', text: '#08979c', border: '#87e8de' },
    test: { bg: '#fcffe6', text: '#7cb305', border: '#eaff8f' },
    style: { bg: '#fff0f6', text: '#eb2f96', border: '#ffadd2' },
    other: { bg: '#f0f0f0', text: '#666666', border: '#d9d9d9' }
  };
  
  return typeColors[type] || typeColors.other;
}

/**
 * Get a shortened version of a commit hash
 * 
 * @param hash Full commit hash
 * @param length Desired length of the shortened hash
 * @returns Shortened hash
 */
export function shortenHash(hash: string, length = 7): string {
  if (!hash) return '';
  return hash.length > length ? hash.substring(0, length) : hash;
}