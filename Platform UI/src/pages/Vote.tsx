
import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Check } from "lucide-react";

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

const Vote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState<Election | null>(null);
  const [preferences, setPreferences] = useState<{ [key: string]: number }>({});
  const [hasVoted, setHasVoted] = useState(false);
  const [voterId] = useState(() => `voter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const elections = JSON.parse(localStorage.getItem('condorcet-elections') || '[]');
    const currentElection = elections.find((e: Election) => e.id === id);
    
    if (!currentElection) {
      navigate('/');
      return;
    }

    if (currentElection.status !== 'active') {
      navigate('/');
      return;
    }

    setElection(currentElection);

    // Check if this voter has already voted
    const votes = JSON.parse(localStorage.getItem('condorcet-votes') || '[]');
    const existingVote = votes.find((v: Vote) => 
      v.electionId === id && v.voterId === voterId
    );
    setHasVoted(!!existingVote);
  }, [id, navigate, voterId]);

  const handlePreferenceChange = (candidate: string, preference: number) => {
    setPreferences(prev => {
      const newPreferences = { ...prev };
      
      // Clear any existing preference for this candidate
      Object.keys(newPreferences).forEach(key => {
        if (newPreferences[key] === preference && key !== candidate) {
          delete newPreferences[key];
        }
      });
      
      // Set new preference
      if (preference === 0) {
        delete newPreferences[candidate];
      } else {
        newPreferences[candidate] = preference;
      }
      
      return newPreferences;
    });
  };

  const submitVote = () => {
    if (!election || Object.keys(preferences).length === 0) return;

    // Convert preferences to ranking array
    const sortedCandidates = Object.entries(preferences)
      .sort(([, a], [, b]) => a - b)
      .map(([candidate]) => candidate);

    const vote: Vote = {
      electionId: election.id,
      voterId,
      ranking: sortedCandidates,
      timestamp: new Date()
    };

    // Save vote
    const votes = JSON.parse(localStorage.getItem('condorcet-votes') || '[]');
    votes.push(vote);
    localStorage.setItem('condorcet-votes', JSON.stringify(votes));

    // Update election voter count
    const elections = JSON.parse(localStorage.getItem('condorcet-elections') || '[]');
    const updatedElections = elections.map((e: Election) => 
      e.id === election.id ? { ...e, voterCount: e.voterCount + 1 } : e
    );
    localStorage.setItem('condorcet-elections', JSON.stringify(updatedElections));

    setHasVoted(true);
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

  if (hasVoted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <Button 
            onClick={() => navigate('/')} 
            variant="outline" 
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Elections
          </Button>

          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Vote Submitted!</h1>
              <p className="text-lg text-gray-600 mb-6">
                Your ranked preferences for "{election.title}" have been successfully recorded.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate('/')}>
                  Return Home
                </Button>
                <Button 
                  onClick={() => navigate(`/results/${election.id}`)}
                  variant="outline"
                >
                  View Results
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const maxCandidates = election.candidates.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <Button 
          onClick={() => navigate('/')} 
          variant="outline" 
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Elections
        </Button>

        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{election.title}</CardTitle>
                  <CardDescription className="mt-2">
                    Select your preference for each candidate (1 = most preferred)
                  </CardDescription>
                </div>
                <Badge className="bg-green-500 text-white">Active</Badge>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Your Ballot</CardTitle>
              <CardDescription>
                Click on the table cells to assign preferences. Each candidate can only have one preference level.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-32">Preference</TableHead>
                      {election.candidates.map(candidate => (
                        <TableHead key={candidate} className="text-center min-w-32">
                          {candidate}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: maxCandidates }, (_, index) => {
                      const preferenceLevel = index + 1;
                      return (
                        <TableRow key={preferenceLevel}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                                {preferenceLevel}
                              </div>
                              <span>
                                {preferenceLevel === 1 ? 'Most Preferred' : 
                                 preferenceLevel === maxCandidates ? 'Least Preferred' : 
                                 `${preferenceLevel}${
                                   preferenceLevel === 2 ? 'nd' : 
                                   preferenceLevel === 3 ? 'rd' : 'th'
                                 } Choice`}
                              </span>
                            </div>
                          </TableCell>
                          {election.candidates.map(candidate => {
                            const isSelected = preferences[candidate] === preferenceLevel;
                            const hasPreference = preferences[candidate] !== undefined;
                            return (
                              <TableCell key={candidate} className="text-center">
                                <button
                                  onClick={() => handlePreferenceChange(candidate, isSelected ? 0 : preferenceLevel)}
                                  className={`
                                    w-12 h-12 rounded-lg border-2 transition-all duration-200
                                    ${isSelected 
                                      ? 'bg-blue-500 border-blue-500 text-white' 
                                      : hasPreference
                                        ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                                    }
                                  `}
                                  disabled={hasPreference && !isSelected}
                                >
                                  {isSelected && <Check className="w-5 h-5 mx-auto" />}
                                </button>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Current Preferences:</h4>
                <div className="text-sm text-blue-700">
                  {Object.keys(preferences).length === 0 ? (
                    <p>No preferences selected yet</p>
                  ) : (
                    <div className="space-y-1">
                      {Object.entries(preferences)
                        .sort(([, a], [, b]) => a - b)
                        .map(([candidate, preference]) => (
                          <p key={candidate}>
                            <span className="font-medium">{preference}.</span> {candidate}
                          </p>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">How This Works:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Click on cells to assign preference levels to candidates</li>
                  <li>• 1 = Most preferred, higher numbers = less preferred</li>
                  <li>• You don't need to rank all candidates</li>
                  <li>• The system will use your rankings for Condorcet comparisons</li>
                </ul>
              </div>

              <Button 
                onClick={submitVote}
                disabled={Object.keys(preferences).length === 0}
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 text-lg disabled:bg-gray-400"
              >
                Submit My Preferences
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Vote;
