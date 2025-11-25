# Testing Documentation

## Overview

This project implements comprehensive automated testing for both frontend and backend, with continuous integration via GitHub Actions.

## Test Coverage Summary

- **Frontend**: 9 E2E tests × 3 browsers = 27 test runs
- **Backend**: 12 unit & integration tests
- **Total**: 39 automated tests
- **CI/CD**: Automated on every push to `main`

---

## Frontend Testing (Playwright)

### Technology Stack
- **Framework**: Playwright v1.56.1
- **Language**: TypeScript
- **Browsers**: Chromium, Firefox, WebKit

### Test Coverage

#### 1. Basic UI Tests (3 tests)
- Homepage loads successfully
- All three tabs are visible (Uploads, Gallery, All Jobs)
- File input is present and functional

#### 2. Navigation Tests (3 tests)
- Navigation between tabs works correctly
- Active tab has purple theme styling
- Tab content updates when switching

#### 3. Responsive Design Tests (3 tests)
- Mobile viewport renders correctly
- Tablet viewport renders correctly
- Desktop viewport renders correctly

### Running Frontend Tests Locally

```bash
# Install dependencies
npm install

# Run tests in headless mode
npm test

# Run tests with UI
npx playwright test --ui

# Run tests in specific browser
npx playwright test --project=chromium

# Show test report
npx playwright show-report
```

### Test Configuration

Location: `playwright.config.ts`

```typescript
{
  baseURL: 'https://image-labeler-theta.vercel.app',
  retries: 2 (on CI),
  workers: 1 (on CI),
  browsers: ['chromium', 'firefox', 'webkit']
}
```

### Test Files
- `tests/e2e/image-labeler.spec.ts` - All E2E tests
- `tests/fixtures/` - Test images for upload testing

---

## Backend Testing (Vitest + Supertest)

### Technology Stack
- **Framework**: Vitest v4.0
- **HTTP Testing**: Supertest
- **Language**: TypeScript

### Test Coverage

#### 1. Job Store Tests (4 tests)
- Empty store returns empty object
- Adding jobs to store works correctly
- Retrieving jobs from store works correctly
- Updating job status works correctly

#### 2. API Endpoint Tests (8 tests)

**GET /jobs/:id**
- Returns 404 when job doesn't exist
- Returns job when it exists

**GET /api/**
- Returns empty array when no jobs exist
- Returns all jobs sorted by creation date (newest first)

**POST /api/**
- Creates job and returns it immediately
- Handles single image upload
- Generates unique job IDs and image IDs

**CORS**
- CORS headers are enabled

### Running Backend Tests Locally

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:ci

# Run tests with coverage
npm test -- --coverage
```

### Test Configuration

Location: `backend/vitest.config.ts`

```typescript
{
  globals: true,
  environment: 'node',
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html']
  }
}
```

### Test Files
- `backend/src/__tests__/jobsStore.test.ts` - Job store unit tests
- `backend/src/__tests__/api.test.ts` - API endpoint integration tests

---

## Continuous Integration (GitHub Actions)

### Workflows

#### 1. Playwright Tests (`.github/workflows/playwright.yml`)

**Triggers**: Push to `main`, Pull requests
**Duration**: ~2 minutes

```yaml
Steps:
1. Checkout code
2. Setup Node.js 20
3. Install dependencies (root, frontend, backend)
4. Install Playwright browsers
5. Run tests against deployed app
6. Upload test results & artifacts
```

**View Results**: https://github.com/dataorket/image-labeler/actions

#### 2. Backend Tests (`.github/workflows/backend-tests.yml`)

**Triggers**: Push to `main`, Pull requests
**Duration**: ~30 seconds

```yaml
Steps:
1. Checkout code
2. Setup Node.js 20
3. Install backend dependencies
4. Run Vitest tests
5. Upload coverage reports
```

**View Results**: https://github.com/dataorket/image-labeler/actions

---

## Test Execution Flow

### On Every Push to `main`:

```
1. Code pushed to GitHub
   ↓
2. GitHub Actions triggered (2 workflows in parallel)
   ↓
3. Playwright Tests                 Backend Tests
   - Install dependencies           - Install dependencies
   - Setup browsers                 - Run unit tests
   - Run 27 E2E tests              - Run integration tests
   - Generate reports               - Generate coverage
   ↓                                 ↓
4. Results displayed on GitHub
   ✅ All tests pass → Green checkmark
   ❌ Any test fails → Red X + detailed logs
```

### Local Development Flow:

```
1. Make code changes
   ↓
2. Run tests locally
   - Frontend: npm test
   - Backend: cd backend && npm test
   ↓
3. Fix any failures
   ↓
4. Commit and push
   ↓
5. CI runs automatically
```

---

## Test Reports

### Frontend (Playwright)
- **HTML Report**: Generated after each run
- **Screenshots**: Captured on failure
- **Traces**: Available for failed tests
- **View**: `npx playwright show-report`

### Backend (Vitest)
- **Console Output**: Pass/fail status with timing
- **Coverage Report**: Available in `backend/coverage/`
- **CI Artifacts**: Uploaded to GitHub Actions

---

## Writing New Tests

### Frontend (Playwright)

```typescript
// tests/e2e/your-feature.spec.ts
import { test, expect } from '@playwright/test';

test('should do something', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.element')).toBeVisible();
});
```

### Backend (Vitest + Supertest)

```typescript
// backend/src/__tests__/your-feature.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('Feature', () => {
  it('should work', async () => {
    const response = await request(app)
      .get('/endpoint')
      .expect(200);
    
    expect(response.body).toBeDefined();
  });
});
```

---

## Best Practices

### Frontend Testing
✅ Test user workflows, not implementation
✅ Use data-testid for stable selectors
✅ Test across all target browsers
✅ Keep tests independent and isolated
✅ Use meaningful test descriptions

### Backend Testing
✅ Test each endpoint thoroughly
✅ Test error cases and edge cases
✅ Clean up test data after each test
✅ Mock external services when needed
✅ Use descriptive assertion messages

### CI/CD
✅ Keep tests fast (< 3 minutes total)
✅ Run tests on every commit
✅ Fix failing tests immediately
✅ Review test reports regularly
✅ Monitor test flakiness

---

## Troubleshooting

### Frontend Tests Failing

**Issue**: "Locator not found"
- Solution: Check if element exists in deployed app
- Use `page.pause()` to debug interactively

**Issue**: "Timeout waiting for element"
- Solution: Increase timeout or check network speed
- Verify element is actually rendered

### Backend Tests Failing

**Issue**: "Cannot read property of undefined"
- Solution: Check if mock data matches types
- Verify API response structure

**Issue**: "Port already in use"
- Solution: Kill existing process
- Use different port for tests

### CI Tests Failing

**Issue**: "Tests pass locally but fail in CI"
- Solution: Check environment differences
- Verify all dependencies are committed
- Check if tests depend on local state

---

## Metrics & Monitoring

### Current Status
- ✅ **Frontend**: 27/27 tests passing
- ✅ **Backend**: 12/12 tests passing
- ✅ **CI/CD**: Both workflows operational
- ✅ **Coverage**: Core functionality covered

### Test Execution Times
- Frontend E2E: ~2 minutes
- Backend Unit: ~30 seconds
- Total CI time: ~2.5 minutes

### GitHub Actions Status
View live status: https://github.com/dataorket/image-labeler/actions

---

## Future Enhancements

### Potential Additions
- [ ] Visual regression testing
- [ ] Performance testing
- [ ] API load testing
- [ ] Security testing
- [ ] Accessibility testing (a11y)
- [ ] Code coverage thresholds
- [ ] Test result notifications

### Suggested Tools
- Percy/Chromatic for visual testing
- k6 or Artillery for load testing
- OWASP ZAP for security testing
- axe-core for accessibility testing

---

## Resources

### Documentation
- [Playwright Documentation](https://playwright.dev)
- [Vitest Documentation](https://vitest.dev)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

### Project Links
- **Live App**: https://image-labeler-theta.vercel.app
- **Backend API**: https://image-labeler-backend-325931483644.us-central1.run.app
- **Repository**: https://github.com/dataorket/image-labeler
- **CI/CD**: https://github.com/dataorket/image-labeler/actions

---

## Contact & Support

For questions about testing:
1. Check test output logs
2. Review this documentation
3. Examine test files for examples
4. Check GitHub Actions run details

**Last Updated**: November 25, 2025
