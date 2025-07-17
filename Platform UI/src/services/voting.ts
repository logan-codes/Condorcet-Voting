export interface Election {
  id: string;
  title: string;
  candidates: string[];
  status: 'draft' | 'active' | 'completed';
  voterCount: number;
  createdAt: Date;
  createdBy?: string;
}

export interface Vote {
  electionId: string;
  rankings: string[]; // Array of candidate IDs in order of preference
  timestamp: Date;
  voterId?: string; // Optional for anonymous voting
}

class VotingService {
  private static instance: VotingService;

  private constructor() {}

  static getInstance(): VotingService {
    if (!VotingService.instance) {
      VotingService.instance = new VotingService();
    }
    return VotingService.instance;
  }

  // Election Management
  getElections(): Election[] {
    const saved = localStorage.getItem('condorcet-elections');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((e: any) => ({
        ...e,
        createdAt: new Date(e.createdAt)
      }));
    }
    return [];
  }

  getElection(id: string): Election | null {
    const elections = this.getElections();
    return elections.find(e => e.id === id) || null;
  }

  saveElection(election: Election): void {
    const elections = this.getElections();
    const existingIndex = elections.findIndex(e => e.id === election.id);
    
    if (existingIndex >= 0) {
      elections[existingIndex] = election;
    } else {
      elections.unshift(election);
    }
    
    localStorage.setItem('condorcet-elections', JSON.stringify(elections));
  }

  deleteElection(id: string): void {
    const elections = this.getElections();
    const filtered = elections.filter(e => e.id !== id);
    localStorage.setItem('condorcet-elections', JSON.stringify(filtered));
  }

  // Voting Operations
  getVotes(electionId: string): Vote[] {
    const saved = localStorage.getItem(`condorcet-votes-${electionId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((v: any) => ({
        ...v,
        timestamp: new Date(v.timestamp)
      }));
    }
    return [];
  }

  submitVote(electionId: string, rankings: string[]): boolean {
    try {
      const votes = this.getVotes(electionId);
      const newVote: Vote = {
        electionId,
        rankings,
        timestamp: new Date()
      };
      
      votes.push(newVote);
      localStorage.setItem(`condorcet-votes-${electionId}`, JSON.stringify(votes));
      
      // Update election voter count
      const election = this.getElection(electionId);
      if (election) {
        election.voterCount = votes.length;
        this.saveElection(election);
      }
      
      return true;
    } catch (error) {
      console.error('Error submitting vote:', error);
      return false;
    }
  }

  // Check if user has already voted
  hasVoted(electionId: string, voterId?: string): boolean {
    const votes = this.getVotes(electionId);
    if (voterId) {
      return votes.some(v => v.voterId === voterId);
    }
    // For anonymous voting, we could use session storage or other methods
    // For now, we'll allow multiple votes per election
    return false;
  }

  // Get active elections for voters
  getActiveElections(): Election[] {
    return this.getElections().filter(e => e.status === 'active');
  }

  // Get elections created by a specific user
  getUserElections(username: string): Election[] {
    return this.getElections().filter(e => e.createdBy === username);
  }
}

export default VotingService.getInstance(); 