
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Vote, Settings, Users, BarChart3, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Condorcet Voting System
          </h1>
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
            Create and participate in ranked-choice elections using the Condorcet method. 
            Designed for up to 90+ concurrent voters with real-time results.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid gap-8 md:grid-cols-1">
            {/* Voter Portal Card */}
            <Card className="hover:shadow-xl transition-all duration-300 border-2 border-green-200">
              <CardHeader className="text-center pb-6">
                <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Vote className="w-10 h-10 text-green-600" />
                </div>
                <CardTitle className="text-3xl text-green-800">Voter Portal</CardTitle>
                <CardDescription className="text-lg">
                  Participate in active elections and cast your vote
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Browse available active elections</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Join elections using direct ID links</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Rank candidates by preference</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>View live election results</span>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/voter')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg mt-6"
                >
                  <Vote className="w-5 h-5 mr-2" />
                  Start Voting
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Features Section */}
          <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
              How It Works
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Share2 className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Create & Share</h3>
                <p className="text-gray-600">Set up elections and share voting links with participants</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Ranked Voting</h3>
                <p className="text-gray-600">Voters rank candidates in order of preference</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Condorcet Results</h3>
                <p className="text-gray-600">Determine winners using the Condorcet method</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
