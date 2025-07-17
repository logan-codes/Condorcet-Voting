const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for users (replace with database in production)
const users = [
  {
    id: 1,
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10),
    email: 'admin@electora.com',
    role: 'election-manager'
  },
  {
    id: 2,
    username: 'manager',
    password: bcrypt.hashSync('manager456', 10),
    email: 'manager@electora.com',
    role: 'election-manager'
  }
];

// In-memory storage for elections (replace with database in production)
const elections = [
  {
    id: '1',
    title: 'Sample Election',
    status: 'active',
    voterCount: 0,
    createdAt: new Date(),
    contestType: 'Condorcet',
    categories: [
      {
        id: 'cat1',
        name: 'President',
        candidates: [
          { name: 'Alice Johnson', description: 'Experienced leader' },
          { name: 'Bob Smith', description: 'Innovative thinker' },
          { name: 'Carol Davis', description: 'Community advocate' }
        ],
        numWinners: 1
      }
    ],
    allowedVoters: [], // Empty means open to all
    endDate: null,
    isPrivate: false
  }
];

// In-memory storage for votes (replace with database in production)
const votes = [];

// JWT Secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Electora server is running' });
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }

    // Find user
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Logout endpoint (client-side token removal)
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Logout successful' 
  });
});

// Registration endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Passwords do not match' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if username already exists
    const existingUsername = users.find(u => u.username === username);
    if (existingUsername) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username already exists' 
      });
    }

    // Check if email already exists
    const existingEmail = users.find(u => u.email === email);
    if (existingEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Create new user
    const newUser = {
      id: users.length + 1,
      username,
      email,
      password: bcrypt.hashSync(password, 10),
      role: 'voter' // Default role for registered users
    };

    users.push(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newUser.id, 
        username: newUser.username, 
        role: newUser.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get current user profile
app.get('/api/auth/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ 
      success: false, 
      message: 'User not found' 
    });
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
});

// Get all users (for admin purposes)
app.get('/api/users', authenticateToken, (req, res) => {
  // Only allow election managers to see user list
  if (req.user.role !== 'election-manager') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied' 
    });
  }

  const userList = users.map(user => ({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  }));

  res.json({
    success: true,
    data: userList
  });
});

// Election Management Endpoints

// Get all elections
app.get('/api/elections', (req, res) => {
  try {
    res.json({
      success: true,
      data: elections
    });
  } catch (error) {
    console.error('Error fetching elections:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get election by ID
app.get('/api/elections/:id', (req, res) => {
  try {
    const election = elections.find(e => e.id === req.params.id);
    if (!election) {
      return res.status(404).json({ 
        success: false, 
        message: 'Election not found' 
      });
    }

    res.json({
      success: true,
      data: election
    });
  } catch (error) {
    console.error('Error fetching election:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Create new election (protected - only election managers)
app.post('/api/elections', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'election-manager') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    const { title, contestType, categories, allowedVoters, endDate, isPrivate } = req.body;

    // Validation
    if (!title || !contestType || !categories || categories.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Validate categories
    for (const category of categories) {
      if (!category.name || !category.candidates || category.candidates.length < 2) {
        return res.status(400).json({ 
          success: false, 
          message: 'Each category must have a name and at least 2 candidates' 
        });
      }
    }

    const newElection = {
      id: Date.now().toString(),
      title: title.trim(),
      status: 'draft',
      voterCount: 0,
      createdAt: new Date(),
      contestType,
      categories: categories.map(cat => ({
        ...cat,
        id: cat.id || crypto.randomUUID(),
        name: cat.name.trim(),
        candidates: cat.candidates.filter(c => c.name.trim()),
        numWinners: Math.max(1, cat.numWinners || 1)
      })),
      allowedVoters: allowedVoters || [],
      endDate: endDate ? new Date(endDate) : null,
      isPrivate: isPrivate || false
    };

    elections.push(newElection);

    res.status(201).json({
      success: true,
      message: 'Election created successfully',
      data: newElection
    });

  } catch (error) {
    console.error('Error creating election:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Update election status
app.patch('/api/elections/:id/status', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'election-manager') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    const { status } = req.body;
    const election = elections.find(e => e.id === req.params.id);
    
    if (!election) {
      return res.status(404).json({ 
        success: false, 
        message: 'Election not found' 
      });
    }

    election.status = status;

    res.json({
      success: true,
      message: 'Election status updated successfully',
      data: election
    });

  } catch (error) {
    console.error('Error updating election status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Delete election
app.delete('/api/elections/:id', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'election-manager') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    const electionIndex = elections.findIndex(e => e.id === req.params.id);
    
    if (electionIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Election not found' 
      });
    }

    // Remove associated votes
    const voteIndexes = votes
      .map((vote, index) => vote.electionId === req.params.id ? index : -1)
      .filter(index => index !== -1)
      .reverse(); // Reverse to avoid index shifting

    voteIndexes.forEach(index => votes.splice(index, 1));

    // Remove election
    elections.splice(electionIndex, 1);

    res.json({
      success: true,
      message: 'Election deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting election:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Voting Endpoints

// Submit a vote
app.post('/api/elections/:id/vote', (req, res) => {
  try {
    const { voterId, voterName, votes: voteData } = req.body;
    const electionId = req.params.id;

    // Find election
    const election = elections.find(e => e.id === electionId);
    if (!election) {
      return res.status(404).json({ 
        success: false, 
        message: 'Election not found' 
      });
    }

    // Check if election is active
    if (election.status !== 'active') {
      return res.status(400).json({ 
        success: false, 
        message: 'Election is not active' 
      });
    }

    // Check if election has ended
    if (election.endDate && new Date() > new Date(election.endDate)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Election has ended' 
      });
    }

    // Check voter eligibility if allowedVoters is set
    if (election.allowedVoters && election.allowedVoters.length > 0) {
      if (!voterId || !election.allowedVoters.includes(voterId)) {
        return res.status(403).json({ 
          success: false, 
          message: 'You are not authorized to vote in this election' 
        });
      }
    }

    // Check for duplicate votes (if voterId is provided)
    if (voterId) {
      const existingVote = votes.find(v => 
        v.electionId === electionId && v.voterId === voterId
      );
      if (existingVote) {
        return res.status(400).json({ 
          success: false, 
          message: 'You have already voted in this election' 
        });
      }
    }

    // Validate vote data
    if (!voteData || !Array.isArray(voteData)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid vote data' 
      });
    }

    // Validate that all categories are voted on
    const electionCategoryIds = election.categories.map(cat => cat.id);
    const votedCategoryIds = voteData.map(vote => vote.categoryId);
    
    const missingCategories = electionCategoryIds.filter(id => 
      !votedCategoryIds.includes(id)
    );
    
    if (missingCategories.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'You must vote in all categories' 
      });
    }

    // Validate vote format based on contest type
    for (const vote of voteData) {
      const category = election.categories.find(cat => cat.id === vote.categoryId);
      if (!category) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid category ID' 
        });
      }

      const validCandidateIds = category.candidates.map(c => c.name);
      
      switch (election.contestType) {
        case 'Condorcet':
          if (!vote.preferences || !Array.isArray(vote.preferences)) {
            return res.status(400).json({ 
              success: false, 
              message: 'Condorcet voting requires preference rankings' 
            });
          }
          // Check if all candidates are ranked
          if (vote.preferences.length !== validCandidateIds.length) {
            return res.status(400).json({ 
              success: false, 
              message: 'All candidates must be ranked' 
            });
          }
          break;
          
        case 'Plurality':
          if (!vote.selected || !Array.isArray(vote.selected) || vote.selected.length !== 1) {
            return res.status(400).json({ 
              success: false, 
              message: 'Plurality voting requires exactly one selection' 
            });
          }
          break;
          
        case 'Approval':
          if (!vote.selected || !Array.isArray(vote.selected)) {
            return res.status(400).json({ 
              success: false, 
              message: 'Approval voting requires selected candidates' 
            });
          }
          break;
          
        case 'Borda':
          if (!vote.preferences || !Array.isArray(vote.preferences)) {
            return res.status(400).json({ 
              success: false, 
              message: 'Borda voting requires preference rankings' 
            });
          }
          break;
      }
    }

    // Create vote record
    const vote = {
      id: Date.now().toString(),
      electionId,
      voterId: voterId || null,
      voterName: voterName || 'Anonymous',
      votes: voteData,
      submittedAt: new Date(),
      ipAddress: req.ip || req.connection.remoteAddress
    };

    votes.push(vote);

    // Update election voter count
    election.voterCount = votes.filter(v => v.electionId === electionId).length;

    res.status(201).json({
      success: true,
      message: 'Vote submitted successfully',
      data: {
        voteId: vote.id,
        voterCount: election.voterCount
      }
    });

  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get votes for an election (protected - only election managers)
app.get('/api/elections/:id/votes', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'election-manager') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    const electionVotes = votes.filter(v => v.electionId === req.params.id);
    
    res.json({
      success: true,
      data: electionVotes
    });

  } catch (error) {
    console.error('Error fetching votes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get election results (public for completed elections)
app.get('/api/elections/:id/results', (req, res) => {
  try {
    const election = elections.find(e => e.id === req.params.id);
    if (!election) {
      return res.status(404).json({ 
        success: false, 
        message: 'Election not found' 
      });
    }

    // Only show results for completed elections or if user is election manager
    if (election.status !== 'completed' && (!req.user || req.user.role !== 'election-manager')) {
      return res.status(403).json({ 
        success: false, 
        message: 'Results not available' 
      });
    }

    const electionVotes = votes.filter(v => v.electionId === req.params.id);
    
    // Calculate results based on contest type
    const results = calculateResults(election, electionVotes);

    res.json({
      success: true,
      data: {
        election,
        results,
        totalVotes: electionVotes.length
      }
    });

  } catch (error) {
    console.error('Error calculating results:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Helper function to calculate election results
function calculateResults(election, votes) {
  const results = {
    contestType: election.contestType,
    categories: []
  };

  for (const category of election.categories) {
    const categoryVotes = votes.map(vote => 
      vote.votes.find(v => v.categoryId === category.id)
    ).filter(Boolean);

    let categoryResults;
    
    switch (election.contestType) {
      case 'Condorcet':
        categoryResults = calculateCondorcetResults(category, categoryVotes);
        break;
      case 'Plurality':
        categoryResults = calculatePluralityResults(category, categoryVotes);
        break;
      case 'Approval':
        categoryResults = calculateApprovalResults(category, categoryVotes);
        break;
      case 'Borda':
        categoryResults = calculateBordaResults(category, categoryVotes);
        break;
      default:
        categoryResults = { error: 'Unknown contest type' };
    }

    results.categories.push({
      categoryId: category.id,
      categoryName: category.name,
      results: categoryResults
    });
  }

  return results;
}

// Calculate Condorcet results
function calculateCondorcetResults(category, votes) {
  const candidates = category.candidates.map(c => c.name);
  const pairwiseResults = {};
  
  // Initialize pairwise results
  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      const pair = `${candidates[i]} vs ${candidates[j]}`;
      pairwiseResults[pair] = { wins: 0, losses: 0 };
    }
  }

  // Count pairwise preferences
  for (const vote of votes) {
    if (!vote.preferences) continue;
    
    for (let i = 0; i < vote.preferences.length; i++) {
      for (let j = i + 1; j < vote.preferences.length; j++) {
        const candidate1 = vote.preferences[i];
        const candidate2 = vote.preferences[j];
        const pair = `${candidate1} vs ${candidate2}`;
        const reversePair = `${candidate2} vs ${candidate1}`;
        
        if (pairwiseResults[pair]) {
          pairwiseResults[pair].wins++;
        } else if (pairwiseResults[reversePair]) {
          pairwiseResults[reversePair].losses++;
        }
      }
    }
  }

  // Find Condorcet winner (candidate who beats all others)
  const candidateScores = {};
  candidates.forEach(candidate => {
    candidateScores[candidate] = { wins: 0, losses: 0 };
  });

  for (const [pair, result] of Object.entries(pairwiseResults)) {
    const [candidate1, candidate2] = pair.split(' vs ');
    if (result.wins > result.losses) {
      candidateScores[candidate1].wins++;
      candidateScores[candidate2].losses++;
    } else if (result.losses > result.wins) {
      candidateScores[candidate2].wins++;
      candidateScores[candidate1].losses++;
    }
  }

  const winners = candidates.filter(candidate => 
    candidateScores[candidate].losses === 0
  );

  return {
    method: 'Condorcet',
    pairwiseResults,
    candidateScores,
    winners: winners.length > 0 ? winners : ['No Condorcet winner'],
    totalVotes: votes.length
  };
}

// Calculate Plurality results
function calculatePluralityResults(category, votes) {
  const candidates = category.candidates.map(c => c.name);
  const voteCounts = {};
  candidates.forEach(candidate => voteCounts[candidate] = 0);

  for (const vote of votes) {
    if (vote.selected && vote.selected.length > 0) {
      voteCounts[vote.selected[0]]++;
    }
  }

  const sortedCandidates = candidates.sort((a, b) => voteCounts[b] - voteCounts[a]);
  const maxVotes = voteCounts[sortedCandidates[0]];
  const winners = sortedCandidates.filter(candidate => voteCounts[candidate] === maxVotes);

  return {
    method: 'Plurality',
    voteCounts,
    winners,
    totalVotes: votes.length
  };
}

// Calculate Approval results
function calculateApprovalResults(category, votes) {
  const candidates = category.candidates.map(c => c.name);
  const voteCounts = {};
  candidates.forEach(candidate => voteCounts[candidate] = 0);

  for (const vote of votes) {
    if (vote.selected) {
      for (const selectedCandidate of vote.selected) {
        voteCounts[selectedCandidate]++;
      }
    }
  }

  const sortedCandidates = candidates.sort((a, b) => voteCounts[b] - voteCounts[a]);
  const maxVotes = voteCounts[sortedCandidates[0]];
  const winners = sortedCandidates.filter(candidate => voteCounts[candidate] === maxVotes);

  return {
    method: 'Approval',
    voteCounts,
    winners,
    totalVotes: votes.length
  };
}

// Calculate Borda results
function calculateBordaResults(category, votes) {
  const candidates = category.candidates.map(c => c.name);
  const scores = {};
  candidates.forEach(candidate => scores[candidate] = 0);

  for (const vote of votes) {
    if (!vote.preferences) continue;
    
    for (let i = 0; i < vote.preferences.length; i++) {
      const candidate = vote.preferences[i];
      const points = candidates.length - i - 1; // First place gets n-1 points, last gets 0
      scores[candidate] += points;
    }
  }

  const sortedCandidates = candidates.sort((a, b) => scores[b] - scores[a]);
  const maxScore = scores[sortedCandidates[0]];
  const winners = sortedCandidates.filter(candidate => scores[candidate] === maxScore);

  return {
    method: 'Borda',
    scores,
    winners,
    totalVotes: votes.length
  };
}

// Protected route example
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ 
    success: true, 
    message: 'This is a protected route',
    user: req.user 
  });
});

// Election Management Endpoints

// Get all elections
app.get('/api/elections', (req, res) => {
  try {
    res.json({
      success: true,
      data: elections
    });
  } catch (error) {
    console.error('Error fetching elections:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get election by ID
app.get('/api/elections/:id', (req, res) => {
  try {
    const election = elections.find(e => e.id === req.params.id);
    if (!election) {
      return res.status(404).json({ 
        success: false, 
        message: 'Election not found' 
      });
    }

    res.json({
      success: true,
      data: election
    });
  } catch (error) {
    console.error('Error fetching election:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Create new election (protected - only election managers)
app.post('/api/elections', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'election-manager') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    const { title, contestType, categories, allowedVoters, endDate, isPrivate } = req.body;

    // Validation
    if (!title || !contestType || !categories || categories.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Validate categories
    for (const category of categories) {
      if (!category.name || !category.candidates || category.candidates.length < 2) {
        return res.status(400).json({ 
          success: false, 
          message: 'Each category must have a name and at least 2 candidates' 
        });
      }
    }

    const newElection = {
      id: Date.now().toString(),
      title: title.trim(),
      status: 'draft',
      voterCount: 0,
      createdAt: new Date(),
      contestType,
      categories: categories.map(cat => ({
        ...cat,
        id: cat.id || crypto.randomUUID(),
        name: cat.name.trim(),
        candidates: cat.candidates.filter(c => c.name.trim()),
        numWinners: Math.max(1, cat.numWinners || 1)
      })),
      allowedVoters: allowedVoters || [],
      endDate: endDate ? new Date(endDate) : null,
      isPrivate: isPrivate || false
    };

    elections.push(newElection);

    res.status(201).json({
      success: true,
      message: 'Election created successfully',
      data: newElection
    });

  } catch (error) {
    console.error('Error creating election:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Update election status
app.patch('/api/elections/:id/status', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'election-manager') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    const { status } = req.body;
    const election = elections.find(e => e.id === req.params.id);
    
    if (!election) {
      return res.status(404).json({ 
        success: false, 
        message: 'Election not found' 
      });
    }

    election.status = status;

    res.json({
      success: true,
      message: 'Election status updated successfully',
      data: election
    });

  } catch (error) {
    console.error('Error updating election status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Delete election
app.delete('/api/elections/:id', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'election-manager') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    const electionIndex = elections.findIndex(e => e.id === req.params.id);
    
    if (electionIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Election not found' 
      });
    }

    // Remove associated votes
    const voteIndexes = votes
      .map((vote, index) => vote.electionId === req.params.id ? index : -1)
      .filter(index => index !== -1)
      .reverse(); // Reverse to avoid index shifting

    voteIndexes.forEach(index => votes.splice(index, 1));

    // Remove election
    elections.splice(electionIndex, 1);

    res.json({
      success: true,
      message: 'Election deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting election:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Voting Endpoints

// Submit a vote
app.post('/api/elections/:id/vote', (req, res) => {
  try {
    const { voterId, voterName, votes: voteData } = req.body;
    const electionId = req.params.id;

    // Find election
    const election = elections.find(e => e.id === electionId);
    if (!election) {
      return res.status(404).json({ 
        success: false, 
        message: 'Election not found' 
      });
    }

    // Check if election is active
    if (election.status !== 'active') {
      return res.status(400).json({ 
        success: false, 
        message: 'Election is not active' 
      });
    }

    // Check if election has ended
    if (election.endDate && new Date() > new Date(election.endDate)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Election has ended' 
      });
    }

    // Check voter eligibility if allowedVoters is set
    if (election.allowedVoters && election.allowedVoters.length > 0) {
      if (!voterId || !election.allowedVoters.includes(voterId)) {
        return res.status(403).json({ 
          success: false, 
          message: 'You are not authorized to vote in this election' 
        });
      }
    }

    // Check for duplicate votes (if voterId is provided)
    if (voterId) {
      const existingVote = votes.find(v => 
        v.electionId === electionId && v.voterId === voterId
      );
      if (existingVote) {
        return res.status(400).json({ 
          success: false, 
          message: 'You have already voted in this election' 
        });
      }
    }

    // Validate vote data
    if (!voteData || !Array.isArray(voteData)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid vote data' 
      });
    }

    // Validate that all categories are voted on
    const electionCategoryIds = election.categories.map(cat => cat.id);
    const votedCategoryIds = voteData.map(vote => vote.categoryId);
    
    const missingCategories = electionCategoryIds.filter(id => 
      !votedCategoryIds.includes(id)
    );
    
    if (missingCategories.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'You must vote in all categories' 
      });
    }

    // Validate vote format based on contest type
    for (const vote of voteData) {
      const category = election.categories.find(cat => cat.id === vote.categoryId);
      if (!category) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid category ID' 
        });
      }

      const validCandidateIds = category.candidates.map(c => c.name);
      
      switch (election.contestType) {
        case 'Condorcet':
          if (!vote.preferences || !Array.isArray(vote.preferences)) {
            return res.status(400).json({ 
              success: false, 
              message: 'Condorcet voting requires preference rankings' 
            });
          }
          // Check if all candidates are ranked
          if (vote.preferences.length !== validCandidateIds.length) {
            return res.status(400).json({ 
              success: false, 
              message: 'All candidates must be ranked' 
            });
          }
          break;
          
        case 'Plurality':
          if (!vote.selected || !Array.isArray(vote.selected) || vote.selected.length !== 1) {
            return res.status(400).json({ 
              success: false, 
              message: 'Plurality voting requires exactly one selection' 
            });
          }
          break;
          
        case 'Approval':
          if (!vote.selected || !Array.isArray(vote.selected)) {
            return res.status(400).json({ 
              success: false, 
              message: 'Approval voting requires selected candidates' 
            });
          }
          break;
          
        case 'Borda':
          if (!vote.preferences || !Array.isArray(vote.preferences)) {
            return res.status(400).json({ 
              success: false, 
              message: 'Borda voting requires preference rankings' 
            });
          }
          break;
      }
    }

    // Create vote record
    const vote = {
      id: Date.now().toString(),
      electionId,
      voterId: voterId || null,
      voterName: voterName || 'Anonymous',
      votes: voteData,
      submittedAt: new Date(),
      ipAddress: req.ip || req.connection.remoteAddress
    };

    votes.push(vote);

    // Update election voter count
    election.voterCount = votes.filter(v => v.electionId === electionId).length;

    res.status(201).json({
      success: true,
      message: 'Vote submitted successfully',
      data: {
        voteId: vote.id,
        voterCount: election.voterCount
      }
    });

  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get votes for an election (protected - only election managers)
app.get('/api/elections/:id/votes', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'election-manager') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    const electionVotes = votes.filter(v => v.electionId === req.params.id);
    
    res.json({
      success: true,
      data: electionVotes
    });

  } catch (error) {
    console.error('Error fetching votes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get election results (public for completed elections)
app.get('/api/elections/:id/results', (req, res) => {
  try {
    const election = elections.find(e => e.id === req.params.id);
    if (!election) {
      return res.status(404).json({ 
        success: false, 
        message: 'Election not found' 
      });
    }

    // Only show results for completed elections or if user is election manager
    if (election.status !== 'completed' && (!req.user || req.user.role !== 'election-manager')) {
      return res.status(403).json({ 
        success: false, 
        message: 'Results not available' 
      });
    }

    const electionVotes = votes.filter(v => v.electionId === req.params.id);
    
    // Calculate results based on contest type
    const results = calculateResults(election, electionVotes);

    res.json({
      success: true,
      data: {
        election,
        results,
        totalVotes: electionVotes.length
      }
    });

  } catch (error) {
    console.error('Error calculating results:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Helper function to calculate election results
function calculateResults(election, votes) {
  const results = {
    contestType: election.contestType,
    categories: []
  };

  for (const category of election.categories) {
    const categoryVotes = votes.map(vote => 
      vote.votes.find(v => v.categoryId === category.id)
    ).filter(Boolean);

    let categoryResults;
    
    switch (election.contestType) {
      case 'Condorcet':
        categoryResults = calculateCondorcetResults(category, categoryVotes);
        break;
      case 'Plurality':
        categoryResults = calculatePluralityResults(category, categoryVotes);
        break;
      case 'Approval':
        categoryResults = calculateApprovalResults(category, categoryVotes);
        break;
      case 'Borda':
        categoryResults = calculateBordaResults(category, categoryVotes);
        break;
      default:
        categoryResults = { error: 'Unknown contest type' };
    }

    results.categories.push({
      categoryId: category.id,
      categoryName: category.name,
      results: categoryResults
    });
  }

  return results;
}

// Calculate Condorcet results
function calculateCondorcetResults(category, votes) {
  const candidates = category.candidates.map(c => c.name);
  const pairwiseResults = {};
  
  // Initialize pairwise results
  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      const pair = `${candidates[i]} vs ${candidates[j]}`;
      pairwiseResults[pair] = { wins: 0, losses: 0 };
    }
  }

  // Count pairwise preferences
  for (const vote of votes) {
    if (!vote.preferences) continue;
    
    for (let i = 0; i < vote.preferences.length; i++) {
      for (let j = i + 1; j < vote.preferences.length; j++) {
        const candidate1 = vote.preferences[i];
        const candidate2 = vote.preferences[j];
        const pair = `${candidate1} vs ${candidate2}`;
        const reversePair = `${candidate2} vs ${candidate1}`;
        
        if (pairwiseResults[pair]) {
          pairwiseResults[pair].wins++;
        } else if (pairwiseResults[reversePair]) {
          pairwiseResults[reversePair].losses++;
        }
      }
    }
  }

  // Find Condorcet winner (candidate who beats all others)
  const candidateScores = {};
  candidates.forEach(candidate => {
    candidateScores[candidate] = { wins: 0, losses: 0 };
  });

  for (const [pair, result] of Object.entries(pairwiseResults)) {
    const [candidate1, candidate2] = pair.split(' vs ');
    if (result.wins > result.losses) {
      candidateScores[candidate1].wins++;
      candidateScores[candidate2].losses++;
    } else if (result.losses > result.wins) {
      candidateScores[candidate2].wins++;
      candidateScores[candidate1].losses++;
    }
  }

  const winners = candidates.filter(candidate => 
    candidateScores[candidate].losses === 0
  );

  return {
    method: 'Condorcet',
    pairwiseResults,
    candidateScores,
    winners: winners.length > 0 ? winners : ['No Condorcet winner'],
    totalVotes: votes.length
  };
}

// Calculate Plurality results
function calculatePluralityResults(category, votes) {
  const candidates = category.candidates.map(c => c.name);
  const voteCounts = {};
  candidates.forEach(candidate => voteCounts[candidate] = 0);

  for (const vote of votes) {
    if (vote.selected && vote.selected.length > 0) {
      voteCounts[vote.selected[0]]++;
    }
  }

  const sortedCandidates = candidates.sort((a, b) => voteCounts[b] - voteCounts[a]);
  const maxVotes = voteCounts[sortedCandidates[0]];
  const winners = sortedCandidates.filter(candidate => voteCounts[candidate] === maxVotes);

  return {
    method: 'Plurality',
    voteCounts,
    winners,
    totalVotes: votes.length
  };
}

// Calculate Approval results
function calculateApprovalResults(category, votes) {
  const candidates = category.candidates.map(c => c.name);
  const voteCounts = {};
  candidates.forEach(candidate => voteCounts[candidate] = 0);

  for (const vote of votes) {
    if (vote.selected) {
      for (const selectedCandidate of vote.selected) {
        voteCounts[selectedCandidate]++;
      }
    }
  }

  const sortedCandidates = candidates.sort((a, b) => voteCounts[b] - voteCounts[a]);
  const maxVotes = voteCounts[sortedCandidates[0]];
  const winners = sortedCandidates.filter(candidate => voteCounts[candidate] === maxVotes);

  return {
    method: 'Approval',
    voteCounts,
    winners,
    totalVotes: votes.length
  };
}

// Calculate Borda results
function calculateBordaResults(category, votes) {
  const candidates = category.candidates.map(c => c.name);
  const scores = {};
  candidates.forEach(candidate => scores[candidate] = 0);

  for (const vote of votes) {
    if (!vote.preferences) continue;
    
    for (let i = 0; i < vote.preferences.length; i++) {
      const candidate = vote.preferences[i];
      const points = candidates.length - i - 1; // First place gets n-1 points, last gets 0
      scores[candidate] += points;
    }
  }

  const sortedCandidates = candidates.sort((a, b) => scores[b] - scores[a]);
  const maxScore = scores[sortedCandidates[0]];
  const winners = sortedCandidates.filter(candidate => scores[candidate] === maxScore);

  return {
    method: 'Borda',
    scores,
    winners,
    totalVotes: votes.length
  };
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Electora server running on port ${PORT}`);
  console.log(`📝 Test credentials:`);
  console.log(`   Username: admin, Password: admin123`);
  console.log(`   Username: manager, Password: manager456`);
}); 