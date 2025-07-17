import { useState, useEffect } from 'react';
import votingService, { Election, Vote } from '@/services/voting';

export const useVoting = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(false);

  const loadElections = () => {
    setLoading(true);
    const elections = votingService.getElections();
    setElections(elections);
    setLoading(false);
  };

  const loadActiveElections = () => {
    setLoading(true);
    const elections = votingService.getActiveElections();
    setElections(elections);
    setLoading(false);
  };

  const loadUserElections = (username: string) => {
    setLoading(true);
    const elections = votingService.getUserElections(username);
    setElections(elections);
    setLoading(false);
  };

  const getElection = (id: string): Election | null => {
    return votingService.getElection(id);
  };

  const saveElection = (election: Election) => {
    votingService.saveElection(election);
    loadElections();
  };

  const deleteElection = (id: string) => {
    votingService.deleteElection(id);
    loadElections();
  };

  const submitVote = (electionId: string, rankings: string[]): boolean => {
    return votingService.submitVote(electionId, rankings);
  };

  const getVotes = (electionId: string): Vote[] => {
    return votingService.getVotes(electionId);
  };

  const hasVoted = (electionId: string, voterId?: string): boolean => {
    return votingService.hasVoted(electionId, voterId);
  };

  useEffect(() => {
    loadElections();
  }, []);

  return {
    elections,
    loading,
    loadElections,
    loadActiveElections,
    loadUserElections,
    getElection,
    saveElection,
    deleteElection,
    submitVote,
    getVotes,
    hasVoted
  };
}; 