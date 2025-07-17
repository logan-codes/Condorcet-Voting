
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Play, Square, Trash2, Download, Users, Settings } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Election {
  id: string;
  title: string;
  candidates: string[];
  status: 'draft' | 'active' | 'completed';
  voterCount: number;
  createdAt: Date;
}

interface Vote {
  electionId: string;
  voterId: string;
  ranking: string[];
  timestamp: Date;
}

const Admin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState<Election | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editedElection, setEditedElection] = useState<Partial<Election>>({});

  useEffect(() => {
    const elections = JSON.parse(localStorage.getItem('condorcet-elections') || '[]');
    const currentElection = elections.find((e: Election) => e.id === id);
    
    if (!currentElection) {
      navigate('/');
      return;
    }

    setElection(currentElection);
    setEditedElection(currentElection);

    const allVotes = JSON.parse(localStorage.getItem('condorcet-votes') || '[]');
    const electionVotes = allVotes.filter((v: Vote) => v.electionId === id);
    setVotes(electionVotes);
  }, [id, navigate]);

  const updateElectionStatus = (newStatus: 'draft' | 'active' | 'completed') => {
    if (!election) return;

    const elections = JSON.parse(localStorage.getItem('condorcet-elections') || '[]');
    const updatedElections = elections.map((e: Election) => 
      e.id === election.id ? { ...e, status: newStatus } : e
    );
    localStorage.setItem('condorcet-elections', JSON.stringify(updatedElections));
    setElection({ ...election, status: newStatus });
  };

  const saveElectionChanges = () => {
    if (!election || !editedElection.title || !editedElection.candidates) return;

    const elections = JSON.parse(localStorage.getItem('condorcet-elections') || '[]');
    const updatedElections = elections.map((e: Election) => 
      e.id === election.id ? { ...e, ...editedElection } : e
    );
    localStorage.setItem('condorcet-elections', JSON.stringify(updatedElections));
    setElection({ ...election, ...editedElection });
    setEditMode(false);
  };

  const deleteElection = () => {
    if (!election) return;
    
    if (!confirm('Are you sure you want to delete this election? This action cannot be undone.')) {
      return;
    }

    // Remove election
    const elections = JSON.parse(localStorage.getItem('condorcet-elections') || '[]');
    const updatedElections = elections.filter((e: Election) => e.id !== election.id);
    localStorage.setItem('condorcet-elections', JSON.stringify(updatedElections));

    // Remove votes
    const allVotes = JSON.parse(localStorage.getItem('condorcet-votes') || '[]');
    const updatedVotes = allVotes.filter((v: Vote) => v.electionId !== election.id);
    localStorage.setItem('condorcet-votes', JSON.stringify(updatedVotes));

    navigate('/');
  };

  const exportResults = () => {
    if (!election) return;

    const data = {
      election,
      votes,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${election.title.replace(/\s+/g, '_')}_results.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addCandidate = () => {
    if (!editedElection.candidates) return;
    setEditedElection({
      ...editedElection,
      candidates: [...editedElection.candidates, '']
    });
  };

  const updateCandidate = (index: number, value: string) => {
    if (!editedElection.candidates) return;
    const newCandidates = [...editedElection.candidates];
    newCandidates[index] = value;
    setEditedElection({
      ...editedElection,
      candidates: newCandidates
    });
  };

  const removeCandidate = (index: number) => {
    if (!editedElection.candidates || editedElection.candidates.length <= 2) return;
    const newCandidates = editedElection.candidates.filter((_, i) => i !== index);
    setEditedElection({
      ...editedElection,
      candidates: newCandidates
    });
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
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
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <Settings className="w-8 h-8" />
                    Election Administration
                  </CardTitle>
                  <CardDescription className="mt-2 text-lg">
                    Manage your election settings and monitor voting activity
                  </CardDescription>
                </div>
                <Badge className={
                  election.status === 'draft' ? 'bg-gray-500' :
                  election.status === 'active' ? 'bg-green-500' : 'bg-blue-500'
                }>
                  {election.status}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          <div className="grid gap-8 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Election Details</CardTitle>
                <CardDescription>
                  {editMode ? 'Edit election information' : 'View and modify election settings'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {editMode ? (
                  <>
                    <div>
                      <Label htmlFor="title">Election Title</Label>
                      <Input
                        id="title"
                        value={editedElection.title || ''}
                        onChange={(e) => setEditedElection({
                          ...editedElection,
                          title: e.target.value
                        })}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label>Candidates</Label>
                        <Button onClick={addCandidate} size="sm" variant="outline">
                          Add Candidate
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {editedElection.candidates?.map((candidate, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={candidate}
                              onChange={(e) => updateCandidate(index, e.target.value)}
                              placeholder={`Candidate ${index + 1}`}
                            />
                            {editedElection.candidates && editedElection.candidates.length > 2 && (
                              <Button
                                onClick={() => removeCandidate(index)}
                                size="sm"
                                variant="outline"
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button onClick={saveElectionChanges} className="bg-green-600 hover:bg-green-700">
                        Save Changes
                      </Button>
                      <Button onClick={() => setEditMode(false)} variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Title</Label>
                      <p className="text-lg font-semibold">{election.title}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Candidates</Label>
                      <div className="mt-1 space-y-1">
                        {election.candidates.map((candidate, index) => (
                          <div key={index} className="bg-gray-50 px-3 py-2 rounded">
                            {candidate}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-600">Created</Label>
                      <p>{new Date(election.createdAt).toLocaleString()}</p>
                    </div>

                    {election.status === 'draft' && (
                      <Button 
                        onClick={() => setEditMode(true)} 
                        variant="outline" 
                        className="w-full"
                      >
                        Edit Election
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Election Controls</CardTitle>
                <CardDescription>
                  Manage the voting process and access results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{votes.length}</div>
                    <div className="text-sm text-gray-600">Total Votes</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <Settings className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{election.candidates.length}</div>
                    <div className="text-sm text-gray-600">Candidates</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {election.status === 'draft' && (
                    <>
                      <Button 
                        onClick={() => updateElectionStatus('active')}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Election
                      </Button>
                      <Alert>
                        <AlertDescription>
                          Once started, the election cannot be edited but can be stopped.
                        </AlertDescription>
                      </Alert>
                    </>
                  )}

                  {election.status === 'active' && (
                    <>
                      <Button 
                        onClick={() => navigate(`/vote/${election.id}`)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Vote Now
                      </Button>
                      <Button 
                        onClick={() => navigate(`/results/${election.id}`)}
                        variant="outline"
                        className="w-full"
                      >
                        View Live Results
                      </Button>
                      <Button 
                        onClick={() => updateElectionStatus('completed')}
                        variant="outline"
                        className="w-full"
                      >
                        <Square className="w-4 h-4 mr-2" />
                        End Election
                      </Button>
                    </>
                  )}

                  {election.status === 'completed' && (
                    <>
                      <Button 
                        onClick={() => navigate(`/results/${election.id}`)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        View Final Results
                      </Button>
                      <Button 
                        onClick={() => updateElectionStatus('active')}
                        variant="outline"
                        className="w-full"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Reopen Election
                      </Button>
                    </>
                  )}

                  <Button 
                    onClick={exportResults}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Results
                  </Button>

                  <hr className="my-4" />

                  <Button 
                    onClick={deleteElection}
                    variant="outline"
                    className="w-full text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Election
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {votes.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-xl">Recent Voting Activity</CardTitle>
                <CardDescription>
                  Latest votes cast in this election
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {votes
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 10)
                    .map((vote, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">Voter {vote.voterId.slice(-8)}</div>
                          <div className="text-sm text-gray-600">
                            Top choice: {vote.ranking[0]}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(vote.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
