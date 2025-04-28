# Contributing to Memorix

Thank you for your interest in contributing to Memorix! This guide will walk you through the contribution workflow and help you get started with developing features, fixing bugs, and improving the project.

## Getting Started

### Prerequisites

Before contributing to Memorix, make sure you have the following installed:

- Node.js (v16 or later)
- npm or yarn
- Git

### Setting Up the Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/memorix.git
   cd memorix
   ```

3. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your local configuration.

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Development Workflow

### Branching Strategy

We follow a feature branch workflow:

1. Create a new branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-you-are-fixing
   ```

   Branch naming convention:
   - `feature/descriptive-name` for new features
   - `fix/issue-description` for bug fixes
   - `docs/what-you-documented` for documentation changes
   - `refactor/what-you-refactored` for code improvements

2. Make your changes, following our [coding standards](./coding-standards.md)

3. Commit your changes with meaningful commit messages:
   ```bash
   git commit -m "Add feature: brief description of what you did"
   ```

4. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

5. Open a Pull Request (PR) against the main repository's `main` branch

### Pull Request Process

1. Fill in the PR template with all relevant information
2. Link any related issues
3. Wait for the CI checks to pass
4. Request a review from at least one team member
5. Address any feedback from reviewers
6. Once approved, a maintainer will merge your PR

## Development Guidelines

### Code Style

Follow the guidelines in our [coding standards](./coding-standards.md) document. We use ESLint and Prettier to enforce code style, so make sure to run:

```bash
npm run lint
# or
yarn lint
```

Before submitting your PR.

### Testing

Write tests for your code when applicable. We use Jest and React Testing Library for testing.

```bash
npm run test
# or
yarn test
```

Make sure all tests pass before submitting your PR.

### Documentation

- Update documentation when changing functionality
- Document new features thoroughly
- Use JSDoc comments for functions and components
- Update the README if necessary

## Issue Tracking

### Creating Issues

When creating a new issue:

1. Check for existing issues to avoid duplicates
2. Use a clear, descriptive title
3. Provide detailed steps to reproduce bugs
4. Include screenshots or error messages if applicable
5. Use issue templates when available

### Issue Labels

We use labels to categorize issues:

- `bug`: Something isn't working as expected
- `feature`: New feature requests
- `enhancement`: Improvements to existing features
- `documentation`: Documentation updates
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed
- `question`: Further information is requested

## Code Review Process

All code changes require a review before being merged. During code review, reviewers will look for:

1. Adherence to our coding standards
2. Correctness of the implementation
3. Test coverage
4. Documentation
5. Potential edge cases or bugs
6. Performance implications

## Communication

- For quick questions: Use GitHub Discussions
- For bug reports and features: Use GitHub Issues
- For detailed discussions: Use pull request comments

## Learning Resources

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)

## Getting Help

If you're stuck or have questions:

1. Check the documentation
2. Look for similar issues on GitHub
3. Ask in GitHub Discussions
4. Reach out to the maintainers

Thank you for contributing to Memorix! 