# Test Directory Structure

This directory contains all test files for the Condorcet Voting System.

## Test Organization

```
src/
├── __tests__/                    # Main test directory
│   ├── components/               # Component tests
│   │   ├── Header.test.tsx
│   │   ├── ProtectedRoute.test.tsx
│   │   └── LogoutButton.test.tsx
│   ├── pages/                   # Page component tests
│   │   ├── Login.test.tsx
│   │   ├── VotingManager.test.tsx
│   │   ├── VoterPortal.test.tsx
│   │   └── Vote.test.tsx
│   ├── services/                # Service tests
│   │   ├── auth.test.ts
│   │   └── voting.test.ts
│   ├── hooks/                   # Custom hook tests
│   │   ├── useAuth.test.ts
│   │   └── useVoting.test.ts
│   └── utils/                   # Utility function tests
│       └── helpers.test.ts
```

## Test File Naming Convention

- Component tests: `ComponentName.test.tsx`
- Service tests: `serviceName.test.ts`
- Hook tests: `hookName.test.ts`
- Utility tests: `utilityName.test.ts`

## Running Tests

To set up testing, you would need to:

1. Install testing dependencies:
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom
```

2. Add test script to package.json:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

3. Configure vitest in vite.config.ts:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
  },
})
```

## Example Test Structure

```typescript
// src/__tests__/services/auth.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import authService from '@/services/auth'

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should authenticate with valid credentials', async () => {
    const result = await authService.login('admin', 'admin123')
    expect(result).toBe(true)
  })

  it('should reject invalid credentials', async () => {
    const result = await authService.login('invalid', 'invalid')
    expect(result).toBe(false)
  })
})
```

## Test Credentials for Testing

Use these test credentials in your tests:
- Username: `admin`, Password: `admin123`
- Username: `manager`, Password: `manager456` 