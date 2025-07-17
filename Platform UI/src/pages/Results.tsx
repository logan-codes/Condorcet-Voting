
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Trophy, Users, BarChart3, RefreshCw } from "lucide-react";

interface Election {
  id: string;
  title: string;
  candidates: string[];
  status: string;
  voterCount: number;
}

interface Vote {
  electionId: string;
  voterId: string;
  ranking: string[];
  timestamp: Date;
}

interface PairwiseResult {
  candidate1: string;
  candidate2: string;
  candidate1Wins: number;
  candidate2Wins: number;
  winner: string;
}

interface CandidateStats {
  name: string;
  wins: number;
  losses: number;
  winPercentage: number;
  isCondorcetWinner: boolean;
}

const Results = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState<Election | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [pairwiseResults, setPairwiseResults] = useState<PairwiseResult[]>([]);
  const [candidateStats, setCandidateStats] = useState<CandidateStats[]>([]);
  const [condorcetWinner, setCondorcetWinner] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadData = () => {
    const elections = JSON.parse(localStorage.getItem('condorcet-elections') || '[]');
    const currentElection = elections.find((e: Election) => e.id === id);
    
    if (!currentElection) {
      navigate('/');
      return;
    }

    setElection(currentElection);

    const allVotes = JSON.parse(localStorage.getItem('condorcet-votes') || '[]');
    const electionVotes = allVotes.filter((v: Vote) => v.electionId === id);
    setVotes(electionVotes);

    if (electionVotes.length > 0) {
      calculateResults(currentElection, electionVotes);
    }

    setLastUpdate(new Date());
  };

  useEffect(() => {
    loadData();
    
    // Auto-refresh every 5 seconds for live updates
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [id, navigate]);

  const calculateResults = (election: Election, votes: Vote[]) => {
    const candidates = election.candidates;
    const pairwise: PairwiseResult[] = [];
    
    // Calculate pairwise comparisons
    for (let i = 0; i < candidates.length; i++) {
      for (let j = i + 1; j < candidates.length; j++) {
        const candidate1 = candidates[i];
        const candidate2 = candidates[j];
        
        let candidate1Wins = 0;
        let candidate2Wins = 0;
        
        votes.forEach(vote => {
          const rank1 = vote.ranking.indexOf(candidate1);
          const rank2 = vote.ranking.indexOf(candidate2);
          
          if (rank1 < rank2) {
            candidate1Wins++;
          } else if (rank2 < rank1) {
            candidate2Wins++;
          }
        });
        
        pairwise.push({
          candidate1,
          candidate2,
          candidate1Wins,
          candidate2Wins,
          winner: candidate1Wins > candidate2Wins ? candidate1 : candidate2
        });
      }
    }
    
    setPairwiseResults(pairwise);
    
    // Calculate candidate statistics
    const stats: CandidateStats[] = candidates.map(candidate => {
      const wins = pairwise.filter(p => 
        (p.candidate1 === candidate && p.winner === candidate) ||
        (p.candidate2 === candidate && p.winner === candidate)
      ).length;
      
      const losses = pairwise.filter(p => 
        (p.candidate1 === candidate && p.winner !== candidate) ||
        (p.candidate2 === candidate && p.winner !== candidate)
      ).length;
      
      const totalMatches = wins + losses;
      const winPercentage = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;
      
      return {
        name: candidate,
        wins,
        losses,
        winPercentage,
        isCondorcetWinner: wins === candidates.length - 1
      };
    });
    
    setCandidateStats(stats.sort((a, b) => b.winPercentage - a.winPercentage));
    
    // Find Condorcet winner (beats all other candidates in pairwise comparisons)
    const winner = stats.find(s => s.isCondorcetWinner);
    setCondorcetWinner(winner ? winner.name : null);
  };

  if (!election) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Election Not Found</h1>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Button 
            onClick={() => navigate('/')} 
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Elections
          </Button>
          <Button 
            onClick={loadData}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="max-w-6xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl">{election.title}</CardTitle>
                  <CardDescription className="mt-2 text-lg">
                    Live results using the Condorcet method
                  </CardDescription>
                </div>
                <div className="text-right">
                  <Badge className={election.status === 'active' ? 'bg-green-500' : 'bg-blue-500'}>
                    {election.status}
                  </Badge>
                  <p className="text-sm text-gray-500 mt-2">
                    Last updated: {lastUpdate.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800">{votes.length}</div>
                  <div className="text-sm text-gray-600">Total Votes</div>
                </div>
                <div className="text-center">
                  <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800">{election.candidates.length}</div>
                  <div className="text-sm text-gray-600">Candidates</div>
                </div>
                <div className="text-center">
                  <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800">
                    {condorcetWinner ? '1' : '0'}
                  </div>
                  <div className="text-sm text-gray-600">Condorcet Winner</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {condorcetWinner && (
            <Card className="mb-8 border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl text-yellow-700">
                  <Trophy className="w-6 h-6" />
                  Condorcet Winner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">{condorcetWinner}</h2>
                  <p className="text-lg text-gray-600">
                    This candidate defeats all others in head-to-head comparisons
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-8 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Candidate Rankings</CardTitle>
                <CardDescription>
                  Based on pairwise comparison wins
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {candidateStats.map((candidate, index) => (
                    <div key={candidate.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`
                            w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-white
                            ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-gray-300'}
                          `}>
                            {index + 1}
                          </div>
                          <span className="font-medium">{candidate.name}</span>
                          {candidate.isCondorcetWinner && (
                            <Trophy className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {candidate.wins}W - {candidate.losses}L
                        </div>
                      </div>
                      <Progress 
                        value={candidate.winPercentage} 
                        className="h-2"
                      />
                      <div className="text-xs text-gray-500 text-right">
                        {candidate.winPercentage.toFixed(1)}% win rate
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Pairwise Comparisons</CardTitle>
                <CardDescription>
                  Head-to-head matchup results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {pairwiseResults.map((result, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{result.candidate1}</span>
                        <span className="text-sm text-gray-500">vs</span>
                        <span className="font-medium">{result.candidate2}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className={result.winner === result.candidate1 ? 'text-green-600 font-semibold' : 'text-gray-500'}>
                          {result.candidate1Wins} votes
                        </span>
                        <span className={result.winner === result.candidate2 ? 'text-green-600 font-semibold' : 'text-gray-500'}>
                          {result.candidate2Wins} votes
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-center text-gray-600">
                        Winner: <span className="font-semibold text-green-600">{result.winner}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {votes.length === 0 && (
            <Card className="mt-8">
              <CardContent className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Votes Yet</h3>
                <p className="text-gray-500 mb-6">Results will appear here as votes are cast</p>
                {election.status === 'active' && (
                  <Button 
                    onClick={() => navigate(`/vote/${election.id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Cast Your Vote
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;
