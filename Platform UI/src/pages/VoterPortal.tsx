
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Vote, Users, Calendar, ArrowRight, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { electionsAPI } from "@/services/api";

interface Election {
  id: string;
  title: string;
  status: 'draft' | 'active' | 'completed';
  voterCount: number;
  createdAt: Date;
  contestType: string;
  categories: Array<{
    id: string;
    name: string;
    candidates: Array<{
      name: string;
      description: string;
    }>;
    numWinners: number;
  }>;
}

const VoterPortal = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Load elections from server
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
      } finally {
        setIsLoading(false);
      }
    };

    loadElections();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const copyVotingLink = (electionId: string) => {
    const votingLink = `${window.location.origin}/vote/${electionId}`;
    navigator.clipboard.writeText(votingLink);
    toast({
      title: "Link Copied!",
      description: "Voting link has been copied to your clipboard.",
    });
  };

  const openVotingLink = (electionId: string) => {
    const votingLink = `${window.location.origin}/vote/${electionId}`;
    window.open(votingLink, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading elections...</p>
        </div>
      </div>
    );
  }

  const activeElections = elections.filter(e => e.status === 'active');
  const completedElections = elections.filter(e => e.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Voter Portal
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {isAuthenticated 
              ? `Welcome back, ${user?.username}! Participate in active elections.`
              : 'Access voting links for active elections.'
            }
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Active Elections */}
          <div className="mb-12">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6 flex items-center">
              <Vote className="w-8 h-8 mr-3 text-green-600" />
              Active Elections
            </h2>
            
            {activeElections.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeElections.map((election) => (
                  <Card key={election.id} className="hover:shadow-lg transition-shadow duration-300 border-green-200">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{election.title}</CardTitle>
                        <Badge className={`${getStatusColor(election.status)} text-white`}>
                          {election.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        <span className="block">Type: {election.contestType}</span>
                        <span className="block">Created {election.createdAt.toLocaleDateString()}</span>
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
                          <Calendar className="w-4 h-4" />
                          {election.voterCount} votes cast
                        </div>
                        
                        <div className="space-y-2">
                          <Button 
                            onClick={() => openVotingLink(election.id)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Vote Now
                          </Button>
                          <Button 
                            onClick={() => copyVotingLink(election.id)}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Copy Link
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <Vote className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Active Elections</h3>
                <p className="text-gray-500 mb-6">There are currently no active elections to vote in</p>
                <Button 
                  onClick={() => navigate('/')}
                  variant="outline"
                >
                  Back to Home
                </Button>
              </div>
            )}
          </div>

          {/* Completed Elections */}
          {completedElections.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl font-semibold text-gray-800 mb-6 flex items-center">
                <Calendar className="w-8 h-8 mr-3 text-blue-600" />
                Completed Elections
              </h2>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {completedElections.map((election) => (
                  <Card key={election.id} className="hover:shadow-lg transition-shadow duration-300 border-blue-200">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{election.title}</CardTitle>
                        <Badge className={`${getStatusColor(election.status)} text-white`}>
                          {election.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        <span className="block">Type: {election.contestType}</span>
                        <span className="block">Created {election.createdAt.toLocaleDateString()}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          {election.categories.reduce((sum, cat) => sum + cat.candidates.filter(c => c.name.trim()).length, 0)} candidates
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {election.voterCount} votes cast
                        </div>
                        
                        <Button 
                          onClick={() => navigate(`/results/${election.id}`)}
                          variant="outline"
                          className="w-full"
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          View Results
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="text-center">
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="mr-4"
            >
              Back to Home
            </Button>
            {!isAuthenticated && (
              <Button 
                onClick={() => navigate('/register')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Register to Vote
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoterPortal;
