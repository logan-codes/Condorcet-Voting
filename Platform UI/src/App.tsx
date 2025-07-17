
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Vote from "./pages/Vote";
import Results from "./pages/Results";
import Admin from "./pages/Admin";
import VotingManager from "./pages/VotingManager";
import VoterPortal from "./pages/VoterPortal";
import NotFound from "./pages/NotFound";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Header />
        <Routes>
          {/* Public Routes - No authentication required */}
          <Route path="/" element={<Index />} />
          <Route path="/vote/:id" element={<Vote />} />
          <Route path="/results/:id" element={<Results />} />
          <Route path="/voter" element={<VoterPortal />} />
          
          {/* Protected Routes - Authentication required */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/manager" element={
            <ProtectedRoute>
              <VotingManager />
            </ProtectedRoute>
          } />
          <Route path="/admin/:id" element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } />
          
          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
