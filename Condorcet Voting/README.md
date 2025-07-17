# Condorcet Voting Platform

A modern web application for running Condorcet voting elections, allowing users to create, manage, and participate in ranked-choice elections with a user-friendly interface.

## Features
- Create and manage elections
- Secure voter registration and authentication
- Cast ranked-choice (Condorcet) ballots
- Real-time results and winner calculation
- Admin and voter portals
- Responsive UI

## Project Structure
```
Condorcet Voting/         # Main frontend app
  src/
    components/           # Reusable UI components
    hooks/                # Custom React hooks
    pages/                # App pages (Vote, Results, Admin, etc.)
    services/             # API and business logic
    ...
  public/                 # Static assets
  server/                 # Backend server (if applicable)

Condorcet Vote/           # (Legacy or alternate frontend)

```

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or bun

### Installation
1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd Condorcet Voting
   ```
2. Install dependencies:
   ```sh
   npm install
   # or
   bun install
   ```

### Running the App
- Start the frontend:
  ```sh
  npm run dev
  # or
  bun run dev
  ```
- (Optional) Start the backend server:
  ```sh
  cd server
  npm install
  npm start
  ```

### Usage
- Access the app at `http://localhost:5173` (or the port shown in your terminal)
- Register/login as a voter or admin
- Create or join an election
- Rank candidates and submit your vote
- View results in real time

## Contributing
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License
MIT

---

For questions or support, please open an issue or contact the maintainers. 