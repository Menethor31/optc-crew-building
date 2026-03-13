'use client';

import { useState, useEffect } from 'react';

interface VoteButtonProps {
  teamId: string;
  initialScore: number;
  compact?: boolean;
}

function getVotedTeams(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('optc_voted_teams');
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function setVotedTeam(teamId: string) {
  if (typeof window === 'undefined') return;
  try {
    const voted = getVotedTeams();
    if (voted.indexOf(teamId) < 0) {
      voted.push(teamId);
      localStorage.setItem('optc_voted_teams', JSON.stringify(voted));
    }
  } catch { /* ignore */ }
}

function removeVotedTeam(teamId: string) {
  if (typeof window === 'undefined') return;
  try {
    const voted = getVotedTeams().filter(id => id !== teamId);
    localStorage.setItem('optc_voted_teams', JSON.stringify(voted));
  } catch { /* ignore */ }
}

export default function VoteButton({ teamId, initialScore, compact }: VoteButtonProps) {
  const [score, setScore] = useState(initialScore);
  const [hasVoted, setHasVoted] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setHasVoted(getVotedTeams().indexOf(teamId) >= 0);
  }, [teamId]);

  async function handleVote(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const newDirection = hasVoted ? 'down' : 'up';
    const optimisticScore = hasVoted ? Math.max(0, score - 1) : score + 1;

    setScore(optimisticScore);
    setHasVoted(!hasVoted);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    if (newDirection === 'up') {
      setVotedTeam(teamId);
    } else {
      removeVotedTeam(teamId);
    }

    try {
      const res = await fetch('/api/teams/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, direction: newDirection }),
      });
      if (res.ok) {
        const data = await res.json();
        setScore(data.score);
      }
    } catch {
      // Revert on error
      setScore(initialScore);
      setHasVoted(newDirection === 'down');
    }
  }

  if (compact) {
    return (
      <button onClick={handleVote}
        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${
          hasVoted
            ? 'bg-optc-accent/20 text-optc-accent'
            : 'bg-optc-bg-hover text-optc-text-secondary hover:text-optc-accent hover:bg-optc-accent/10'
        } ${animating ? 'scale-110' : ''}`}>
        <span className={`transition-transform ${animating ? 'scale-125' : ''}`}>
          {hasVoted ? '▲' : '△'}
        </span>
        <span>{score}</span>
      </button>
    );
  }

  return (
    <button onClick={handleVote}
      className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border transition-all ${
        hasVoted
          ? 'border-optc-accent bg-optc-accent/10 text-optc-accent'
          : 'border-optc-border bg-optc-bg-hover text-optc-text-secondary hover:border-optc-accent/50 hover:text-optc-accent'
      } ${animating ? 'scale-105' : ''}`}>
      <span className={`text-lg leading-none transition-transform ${animating ? '-translate-y-0.5' : ''}`}>
        {hasVoted ? '▲' : '△'}
      </span>
      <span className="text-sm font-bold">{score}</span>
    </button>
  );
}
