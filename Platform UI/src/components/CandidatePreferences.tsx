import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, Users, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CandidatePreference {
  candidateId: string;
  candidateName: string;
  preferences: string[];
  isAllCandidates: boolean;
}

interface CandidatePreferencesProps {
  candidates: string[];
  onPreferencesChange: (preferences: CandidatePreference[]) => void;
}

const CandidatePreferences = ({ candidates, onPreferencesChange }: CandidatePreferencesProps) => {
  const [preferences, setPreferences] = useState<CandidatePreference[]>(
    candidates.map((candidate, index) => ({
      candidateId: `candidate-${index}`,
      candidateName: candidate,
      preferences: [],
      isAllCandidates: false
    }))
  );
  const { toast } = useToast();

  const updatePreference = (candidateId: string, newPreferences: string[], isAllCandidates: boolean) => {
    const updated = preferences.map(pref => 
      pref.candidateId === candidateId 
        ? { ...pref, preferences: newPreferences, isAllCandidates }
        : pref
    );
    setPreferences(updated);
    onPreferencesChange(updated);
  };

  const setAllCandidatesForPreference = (candidateId: string, isAllCandidates: boolean) => {
    const updated = preferences.map(pref => 
      pref.candidateId === candidateId 
        ? { 
            ...pref, 
            preferences: isAllCandidates ? candidates.filter(c => c !== pref.candidateName) : [],
            isAllCandidates 
          }
        : pref
    );
    setPreferences(updated);
    onPreferencesChange(updated);
  };

  const addPreference = (candidateId: string, preference: string) => {
    const candidate = preferences.find(p => p.candidateId === candidateId);
    if (!candidate) return;

    if (candidate.preferences.includes(preference)) {
      toast({
        title: "Duplicate Preference",
        description: "This preference is already added.",
        variant: "destructive",
      });
      return;
    }

    const newPreferences = [...candidate.preferences, preference];
    updatePreference(candidateId, newPreferences, false);
  };

  const removePreference = (candidateId: string, preferenceToRemove: string) => {
    const candidate = preferences.find(p => p.candidateId === candidateId);
    if (!candidate) return;

    const newPreferences = candidate.preferences.filter(p => p !== preferenceToRemove);
    updatePreference(candidateId, newPreferences, false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Candidate Preferences
        </CardTitle>
        <CardDescription>
          Set preferences for each candidate. You can specify individual preferences or set all other candidates as preferences.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {preferences.map((candidate) => (
          <div key={candidate.candidateId} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="font-medium text-lg">{candidate.candidateName}</h3>
              </div>
              <Badge variant={candidate.isAllCandidates ? "default" : "secondary"}>
                {candidate.isAllCandidates ? "All Candidates" : "Custom Preferences"}
              </Badge>
            </div>

            <div className="space-y-3">
              {/* All Candidates Toggle */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`all-candidates-${candidate.candidateId}`}
                  checked={candidate.isAllCandidates}
                  onCheckedChange={(checked) => 
                    setAllCandidatesForPreference(candidate.candidateId, checked as boolean)
                  }
                />
                <Label htmlFor={`all-candidates-${candidate.candidateId}`} className="text-sm">
                  Set all other candidates as preferences
                </Label>
              </div>

              {!candidate.isAllCandidates && (
                <div className="space-y-3">
                  {/* Add Preference */}
                  <div className="flex gap-2">
                    <Select onValueChange={(value) => addPreference(candidate.candidateId, value)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Add preference..." />
                      </SelectTrigger>
                      <SelectContent>
                        {candidates
                          .filter(c => c !== candidate.candidateName && !candidate.preferences.includes(c))
                          .map((candidateName) => (
                            <SelectItem key={candidateName} value={candidateName}>
                              {candidateName}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Current Preferences */}
                  {candidate.preferences.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Current Preferences:</Label>
                      <div className="flex flex-wrap gap-2">
                        {candidate.preferences.map((preference, index) => (
                          <Badge 
                            key={index} 
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <Star className="w-3 h-3" />
                            {preference}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 ml-1 text-red-600 hover:text-red-700"
                              onClick={() => removePreference(candidate.candidateId, preference)}
                            >
                              ×
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {candidate.isAllCandidates && (
                <div className="text-sm text-gray-600">
                  <p>All other candidates will be set as preferences for {candidate.candidateName}:</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {candidates
                      .filter(c => c !== candidate.candidateName)
                      .map((candidateName) => (
                        <Badge key={candidateName} variant="secondary">
                          {candidateName}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CandidatePreferences; 