# Condorcet Voting System

A modern web application for creating and participating in ranked-choice elections using the Condorcet method. Designed for up to 90+ concurrent voters with real-time results.

## Features

### For Election Managers (Requires Login)
- **Create Elections**: Set up new voting elections with custom candidates
- **Manage Elections**: Start, stop, and monitor active elections
- **Share Links**: Generate and share direct voting links with participants
- **View Results**: Real-time election results and analytics
- **Export Data**: Download election data and voting statistics

### For Voters (Anonymous)
- **Direct Link Access**: Vote using shared election links without registration
- **Ranked Voting**: Rank candidates in order of preference
- **Anonymous Voting**: Vote without revealing personal information
- **View Results**: See live election results and outcomes

## Architecture

### Directory Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── ProtectedRoute.tsx  # Authentication wrapper
│   └── LogoutButton.tsx    # Logout functionality
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication state management
│   └── useVoting.ts    # Voting operations and election management
├── pages/              # Application pages
│   ├── Index.tsx       # Landing page
│   ├── Login.tsx       # Authentication page
│   ├── VotingManager.tsx  # Election management (protected)
│   ├── VoterPortal.tsx    # Voter access portal
│   ├── Vote.tsx        # Voting interface
│   ├── Results.tsx     # Election results
│   ├── Admin.tsx       # Admin panel (protected)
│   └── NotFound.tsx    # 404 page
├── services/           # Business logic services
│   ├── auth.ts         # Authentication service
│   └── voting.ts       # Voting and election management
└── lib/               # Utility libraries
```

### Authentication Flow

1. **Public Access**: Voters can access voting via direct links without authentication
2. **Manager Login**: Election managers must authenticate to create/manage elections
3. **Protected Routes**: `/manager` and `/admin/:id` require authentication
4. **Anonymous Voting**: Voters remain anonymous throughout the voting process

### Key Components

#### Authentication
- `ProtectedRoute`: Wraps protected pages with authentication checks
- `Login`: Authentication page for election managers
- `useAuth`: Custom hook for authentication state management
- `authService`: Handles login, logout, and authentication state

#### Voting System
- `useVoting`: Custom hook for election and voting operations
- `votingService`: Manages election data and voting submissions
- `Vote`: Anonymous voting interface
- `Results`: Real-time election results display

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd condorcet-crowd-vote-now
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### For Election Managers

1. **Login**: Navigate to the home page and click "Login to Manage"
2. **Create Election**: Use the Voting Manager to create new elections
3. **Share Links**: Copy and share voting links with participants
4. **Monitor**: Track voting progress and view results

### For Voters

1. **Access**: Use a shared voting link or enter an election ID
2. **Vote**: Rank candidates in order of preference
3. **Submit**: Cast your anonymous vote
4. **View Results**: See live election results

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **UI Framework**: Tailwind CSS + shadcn/ui
- **Routing**: React Router v6
- **State Management**: React hooks + custom services
- **Build Tool**: Vite
- **Authentication**: Local storage-based (demo implementation)

## Security Considerations

- **Production**: Replace local storage authentication with secure backend
- **Vote Integrity**: Implement proper vote validation and storage
- **Rate Limiting**: Add protection against vote manipulation
- **HTTPS**: Ensure secure connections in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
