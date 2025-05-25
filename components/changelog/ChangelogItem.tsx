import React from 'react';

export type CommitType = 'feature' | 'fix' | 'docs' | 'chore' | 'refactor' | 'test' | 'style' | 'other';

export interface Commit {
  hash: string;
  author: string;
  date: string;
  message: string;
  type: CommitType;
}

interface ChangelogItemProps {
  commit: Commit;
}

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

const ChangelogItem: React.FC<ChangelogItemProps> = ({ commit }) => {
  // Truncate hash to first 7 characters if longer
  const shortHash = commit.hash.length > 7 ? commit.hash.substring(0, 7) : commit.hash;
  
  // Get colors based on commit type
  const colors = typeColors[commit.type] || typeColors.other;

  return (
    <div 
      style={{
        border: `1px solid #eaeaea`,
        borderLeft: `3px solid ${colors.border}`,
        borderRadius: '4px',
        padding: '16px',
        marginBottom: '16px',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer',
        backgroundColor: '#ffffff',
      }}
      className="changelog-item"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div 
          style={{ 
            backgroundColor: colors.bg, 
            color: colors.text, 
            borderRadius: '16px', 
            padding: '2px 12px',
            fontWeight: 500,
            fontSize: '0.8rem',
            textTransform: 'capitalize',
            display: 'inline-block'
          }}
        >
          {commit.type}
        </div>
        <span style={{ color: '#666666', fontSize: '0.9rem' }}>{commit.date}</span>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <h3 style={{ 
          margin: '0 0 4px 0', 
          fontSize: '1.1rem', 
          lineHeight: 1.4,
          fontWeight: 600,
          wordBreak: 'break-word'
        }}>
          {commit.message}
        </h3>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#666666', fontSize: '0.85rem' }}>
        <div>by <strong>{commit.author}</strong></div>
        <div style={{ 
          fontFamily: 'monospace', 
          backgroundColor: '#f5f5f5', 
          padding: '2px 6px', 
          borderRadius: '4px'
        }}>
          {shortHash}
        </div>
      </div>

      <style jsx>{`
        .changelog-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
      `}</style>
    </div>
  );
};

export default ChangelogItem;