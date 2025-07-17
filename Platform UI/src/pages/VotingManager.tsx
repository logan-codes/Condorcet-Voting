
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, BarChart3, Settings, Share2, Copy, Link, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LogoutButton from "@/components/LogoutButton";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import CandidatePreferences from "@/components/CandidatePreferences";
import { electionsAPI } from "@/services/api";

interface Candidate {
  name: string;
  description: string;
}

interface Category {
  id: string;
  name: string;
  candidates: Candidate[];
  numWinners: number;
}

interface Election {
  id: string;
  title: string;
  // candidates: string[]; // Remove this, now per category
  status: 'draft' | 'active' | 'completed';
  voterCount: number;
  createdAt: Date;
  candidatePreferences?: CandidatePreference[];
  contestType: ContestType;
  categories: Category[];
}

interface CandidatePreference {
  candidateId: string;
  candidateName: string;
  preferences: string[];
  isAllCandidates: boolean;
}

// Add contest type enum
export type ContestType = 'Condorcet' | 'Plurality' | 'Approval' | 'Borda';

const VotingManager = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);
  const [newElection, setNewElection] = useState({
    title: '',
    contestType: 'Condorcet' as ContestType,
    categories: [
      { id: crypto.randomUUID(), name: '', candidates: [{ name: '', description: '' }], numWinners: 1 }
    ]
  });
  const [candidatePreferences, setCandidatePreferences] = useState<CandidatePreference[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load elections from server
  useEffect(() => {
    const loadElections = async () => {
      try {
        const response = await electionsAPI.getAll();
        if (response.success) {
          setElections(response.data.map((e: any) => ({
            ...e,
            createdAt: new Date(e.createdAt)
          })));
        }
      } catch (error) {
        toast({
          title: "Error Loading Elections",
          description: "Failed to load elections from server.",
          variant: "destructive",
        });
      }
    };

    loadElections();
  }, []);



  const createElection = async () => {
    // Validate title
    if (!newElection.title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter an election title.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate candidates
    const validCandidates = newElection.categories.flatMap(cat => cat.candidates.filter(c => c.name.trim()));
    if (validCandidates.length < 2) {
      toast({
        title: "Insufficient Candidates",
        description: "You need at least 2 candidates to create an election.",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate candidates
    const uniqueCandidates = [...new Set(validCandidates)];
    if (uniqueCandidates.length !== validCandidates.length) {
      toast({
        title: "Duplicate Candidates",
        description: "Please remove duplicate candidate names.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await electionsAPI.create({
        title: newElection.title.trim(),
        contestType: newElection.contestType,
        categories: newElection.categories.map(cat => ({
          ...cat,
          name: cat.name.trim(),
          candidates: cat.candidates.filter(c => c.name.trim()),
          numWinners: Math.max(1, cat.numWinners),
        })),
      });

      if (response.success) {
        setElections(prev => [response.data, ...prev]);
        setNewElection({ title: '', contestType: 'Condorcet', categories: [{ id: crypto.randomUUID(), name: '', candidates: [{ name: '', description: '' }], numWinners: 1 }] });
        setCandidatePreferences([]);
        setShowCreateForm(false);
        setShowPreferences(false);
        
        toast({
          title: "Election Created",
          description: "Your election has been created successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error Creating Election",
        description: "Failed to create election. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startElection = async (id: string) => {
    try {
      const response = await electionsAPI.updateStatus(id, 'active');
      if (response.success) {
        setElections(prev => prev.map(e => 
          e.id === id ? { ...e, status: 'active' } : e
        ));
        toast({
          title: "Election Started",
          description: "Your election is now active and ready for voting.",
        });
      }
    } catch (error) {
      toast({
        title: "Error Starting Election",
        description: "Failed to start election. Please try again.",
        variant: "destructive",
      });
    }
  };

  const shareVotingLink = (electionId: string) => {
    const votingLink = `${window.location.origin}/vote/${electionId}`;
    navigator.clipboard.writeText(votingLink);
    toast({
      title: "Link Copied!",
      description: "Voting link has been copied to your clipboard.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  // Remove any canSetPreferences or similar logic that references newElection.candidates
  // Only use per-category candidate logic

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Voting Manager
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create and manage your Condorcet elections. Share voting links with participants.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-semibold text-gray-800">My Elections</h2>
            <div className="flex gap-4">
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
              >
                Public Elections
              </Button>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Election
              </Button>
              <LogoutButton />
            </div>
          </div>

          {showCreateForm && (
            <Card className="mb-8 border-2 border-blue-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-blue-800">Create New Election</CardTitle>
                <CardDescription>Set up a new Condorcet voting election</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contest Type Selection */}
                <div>
                  <Label htmlFor="contestType" className="text-lg font-medium">Contest Type</Label>
                  <select
                    id="contestType"
                    value={newElection.contestType}
                    onChange={e => setNewElection(prev => ({ ...prev, contestType: e.target.value as ContestType }))}
                    className="mt-2 text-lg border rounded px-3 py-2 w-full"
                  >
                    <option value="Condorcet">Condorcet</option>
                    <option value="Plurality">Plurality</option>
                    <option value="Approval">Approval</option>
                    <option value="Borda">Borda Count</option>
                  </select>
                </div>
                {/* Categories Section */}
                <div className="space-y-6">
                  <Label className="text-lg font-medium">Categories</Label>
                  {newElection.categories.map((cat, catIdx) => (
                    <div key={cat.id} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                      <div className="flex gap-2 items-center">
                        <Input
                          value={cat.name}
                          onChange={e => {
                            const cats = [...newElection.categories];
                            cats[catIdx].name = e.target.value;
                            setNewElection(prev => ({ ...prev, categories: cats }));
                          }}
                          placeholder={`Category Name`}
                          className="text-lg flex-1"
                        />
                        <Button
                          onClick={() => setNewElection(prev => ({ ...prev, categories: prev.categories.filter((_, i) => i !== catIdx) }))}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          disabled={newElection.categories.length === 1}
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="flex gap-4 items-center">
                        <Label className="text-sm">Number of Winners</Label>
                        <Input
                          type="number"
                          min={1}
                          value={cat.numWinners}
                          onChange={e => {
                            const cats = [...newElection.categories];
                            cats[catIdx].numWinners = Math.max(1, Number(e.target.value));
                            setNewElection(prev => ({ ...prev, categories: cats }));
                          }}
                          className="w-24"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Candidates</Label>
                        <div className="space-y-2 mt-2">
                          {cat.candidates.map((candidate, candIdx) => (
                            <div key={candIdx} className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                              <Input
                                value={candidate.name}
                                onChange={e => {
                                  const cats = [...newElection.categories];
                                  cats[catIdx].candidates[candIdx].name = e.target.value;
                                  setNewElection(prev => ({ ...prev, categories: cats }));
                                }}
                                placeholder={`Candidate ${candIdx + 1} Name`}
                                className="text-lg md:w-1/3"
                              />
                              <Input
                                value={candidate.description}
                                onChange={e => {
                                  const cats = [...newElection.categories];
                                  cats[catIdx].candidates[candIdx].description = e.target.value;
                                  setNewElection(prev => ({ ...prev, categories: cats }));
                                }}
                                placeholder="Description (optional)"
                                className="text-sm md:flex-1"
                              />
                              {cat.candidates.length > 1 && (
                                <Button
                                  onClick={() => {
                                    const cats = [...newElection.categories];
                                    cats[catIdx].candidates = cats[catIdx].candidates.filter((_, i) => i !== candIdx);
                                    setNewElection(prev => ({ ...prev, categories: cats }));
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            onClick={() => {
                              const cats = [...newElection.categories];
                              cats[catIdx].candidates.push({ name: '', description: '' });
                              setNewElection(prev => ({ ...prev, categories: cats }));
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Add Candidate
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    onClick={() => setNewElection(prev => ({ ...prev, categories: [...prev.categories, { id: crypto.randomUUID(), name: '', candidates: [{ name: '', description: '' }], numWinners: 1 }] }))}
                    variant="outline"
                    size="sm"
                  >
                    Add Category
                  </Button>
                </div>
                
                <div className="flex gap-4 pt-4">
                  {/* Remove the Set Preferences button for now, as it depends on newElection.candidates. Add a TODO comment for future per-category preferences support. */}
                  <Button onClick={createElection} className="bg-green-600 hover:bg-green-700 text-white">
                    Create Election
                  </Button>
                  <Button onClick={() => setShowCreateForm(false)} variant="outline">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {elections.map((election) => (
              <Card key={election.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{election.title}</CardTitle>
                    <Badge className={`${getStatusColor(election.status)} text-white`}>
                      {election.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    <span className="block">Created {election.createdAt.toLocaleDateString()}</span>
                    <span className="block text-sm text-gray-500">Type: {election.contestType}</span>
                    {election.categories && election.categories.length > 0 && (
                      <span className="block text-sm text-gray-700 mt-2">
                        Categories: {election.categories.map(cat => cat.name).filter(Boolean).join(', ')}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      {election.categories.reduce((sum, cat) => sum + cat.candidates.filter(c => c.name.trim()).length, 0)} candidates
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BarChart3 className="w-4 h-4" />
                      {election.voterCount} votes cast
                    </div>
                    
                    <div className="space-y-2">
                      {election.status === 'draft' && (
                        <Button 
                          onClick={() => startElection(election.id)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                          Start Election
                        </Button>
                      )}
                      
                      {election.status === 'active' && (
                        <Button 
                          onClick={() => shareVotingLink(election.id)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share Voting Link
                        </Button>
                      )}

                      <div className="flex gap-2">
                        <Button 
                          onClick={() => navigate(`/results/${election.id}`)}
                          variant="outline"
                          size="sm"
                        >
                          <BarChart3 className="w-4 h-4 mr-1" />
                          Results
                        </Button>
                        <Button 
                          onClick={() => setShowQRCode(election.id)}
                          variant="outline"
                          size="sm"
                        >
                          <QrCode className="w-4 h-4 mr-1" />
                          QR
                        </Button>
                        <Button 
                          onClick={() => navigate(`/admin/${election.id}`)}
                          variant="outline"
                          size="sm"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {elections.length === 0 && !showCreateForm && (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Elections Yet</h3>
              <p className="text-gray-500 mb-6">Create your first election to get started</p>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Election
              </Button>
            </div>
          )}

          {/* Preferences Modal */}
          {showPreferences && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Set Candidate Preferences</h2>
                    <Button 
                      onClick={() => setShowPreferences(false)}
                      variant="outline"
                    >
                      Close
                    </Button>
                  </div>
                  
                  {/* TODO: Support candidate preferences per category */}
                  {/*
                  <CandidatePreferences
                    candidates={newElection.categories.flatMap(cat => cat.candidates.filter(c => c.name.trim()))}
                    onPreferencesChange={setCandidatePreferences}
                  />
                  */}
                  {/* TODO: Support candidate preferences per category */}
                  
                  <div className="flex gap-4 mt-6">
                    <Button 
                      onClick={() => setShowPreferences(false)}
                      variant="outline"
                    >
                      Back to Form
                    </Button>
                    <Button 
                      onClick={createElection}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Create Election
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* QR Code Modal */}
          {showQRCode && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">QR Code Generator</h2>
                    <Button 
                      onClick={() => setShowQRCode(null)}
                      variant="outline"
                    >
                      Close
                    </Button>
                  </div>
                  
                  <QRCodeGenerator
                    votingLink={`${window.location.origin}/vote/${showQRCode}`}
                    electionTitle={elections.find(e => e.id === showQRCode)?.title || 'Election'}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VotingManager;
