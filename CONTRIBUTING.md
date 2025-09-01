# Contributing to CommunityOS

Thank you for your interest in contributing to CommunityOS! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Docker & Docker Compose
- Discord Bot Token (for testing)
- Stripe Test Account

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/CommunityOS.git`
3. Install dependencies: `npm install`
4. Copy environment variables: `cp .env.example .env`
5. Start development environment: `npm run dev`

## 🎯 How to Contribute

### Types of Contributions
- **Bug Fixes**: Fix issues and improve stability
- **New Features**: Add functionality that benefits the community
- **Documentation**: Improve docs, tutorials, and guides
- **Performance**: Optimize code and infrastructure
- **Testing**: Add test coverage and improve CI/CD

### Before You Start
1. Check existing [issues](https://github.com/your-org/CommunityOS/issues)
2. Open an issue to discuss major changes
3. Join our [Discord community](https://discord.gg/communityos) for discussion

## 📋 Development Process

### 1. Branch Strategy
- `main` - Production ready code
- `develop` - Integration branch for new features
- `feature/feature-name` - New features
- `bugfix/issue-name` - Bug fixes
- `hotfix/critical-fix` - Critical production fixes

### 2. Making Changes
```bash
# Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# Make your changes
# ... code, test, commit ...

# Push to your fork
git push origin feature/your-feature-name

# Open a Pull Request to develop branch
```

### 3. Commit Guidelines
Use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat(auth): add OAuth2 Discord integration
fix(bot): resolve role assignment bug  
docs(api): update authentication endpoints
test(billing): add Stripe webhook tests
refactor(db): optimize query performance
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## 🧪 Testing

### Running Tests
```bash
# All tests
npm test

# Unit tests
npm run test:unit

# Integration tests  
npm run test:integration

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

### Writing Tests
- Write tests for all new features and bug fixes
- Maintain >80% code coverage
- Use descriptive test names
- Follow the existing test patterns

### Test Structure
```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  it('should perform expected behavior', async () => {
    // Arrange
    // Act
    // Assert
  });
});
```

## 📝 Code Standards

### TypeScript Guidelines
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Use proper error types
- Document complex types

```typescript
interface CommunityMember {
  id: string;
  discordId: string;
  subscriptionTier: SubscriptionTier;
  joinedAt: Date;
}
```

### Code Style
- Use Prettier for formatting
- Follow ESLint rules
- Use meaningful variable names
- Add JSDoc comments for public APIs

```typescript
/**
 * Creates a new subscription for a community member
 * @param memberId - The unique identifier for the member
 * @param tier - The subscription tier to assign
 * @returns Promise<Subscription> The created subscription
 */
async function createSubscription(
  memberId: string,
  tier: SubscriptionTier
): Promise<Subscription> {
  // Implementation
}
```

### Database Guidelines
- Use Prisma for database operations
- Write migrations for schema changes
- Add proper indexes for performance
- Use transactions for multi-step operations

## 🎨 UI/UX Guidelines

### Design System
- Use our component library in `/frontend/components`
- Follow Tailwind CSS utility-first approach
- Ensure responsive design (mobile-first)
- Maintain accessibility standards (WCAG 2.1)

### Component Structure
```typescript
interface ComponentProps {
  // Props definition
}

export const Component: React.FC<ComponentProps> = ({ 
  prop1, 
  prop2 
}) => {
  return (
    <div className="responsive-classes">
      {/* Component JSX */}
    </div>
  );
};
```

## 🔧 API Development

### REST API Standards
- Follow RESTful conventions
- Use proper HTTP status codes
- Implement request validation
- Add comprehensive error handling
- Document all endpoints with OpenAPI

### API Response Format
```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-01-01T00:00:00Z",
    "requestId": "req_123"
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2025-01-01T00:00:00Z",
    "requestId": "req_123"
  }
}
```

## 📚 Documentation

### Required Documentation
- Update README.md for major features
- Add API documentation for new endpoints
- Update deployment guides if needed
- Add inline code documentation

### Documentation Style
- Use clear, concise language
- Include code examples
- Add troubleshooting sections
- Keep documentation up to date

## 🚀 Pull Request Process

### PR Checklist
- [ ] Code follows style guidelines
- [ ] Tests added and passing
- [ ] Documentation updated
- [ ] No breaking changes (or properly documented)
- [ ] Security considerations addressed
- [ ] Performance impact considered

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature  
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)

## Additional Notes
```

### Review Process
1. Automated checks must pass (CI/CD)
2. Code review by maintainers
3. QA testing for significant changes
4. Security review for security-related changes
5. Performance review for performance-critical changes

## 🔒 Security

### Security Guidelines
- Never commit secrets or API keys
- Use environment variables for configuration
- Validate and sanitize all inputs
- Follow OWASP security practices
- Report security vulnerabilities privately

### Vulnerability Reporting
Email: security@communityos.com
- Include steps to reproduce
- Provide impact assessment
- Allow time for fix before disclosure

## 🏷️ Release Process

### Versioning
We use [Semantic Versioning](https://semver.org/):
- `MAJOR.MINOR.PATCH`
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

### Release Checklist
- [ ] Version bumped appropriately
- [ ] Changelog updated
- [ ] Documentation updated
- [ ] All tests passing
- [ ] Security scan completed
- [ ] Performance testing completed

## 🎉 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Invited to contributor Discord channel
- Eligible for contributor swag

## 📞 Getting Help

- **Discord**: Join our [developer community](https://discord.gg/communityos-dev)
- **Discussions**: Use [GitHub Discussions](https://github.com/your-org/CommunityOS/discussions)
- **Issues**: Create [GitHub Issues](https://github.com/your-org/CommunityOS/issues)
- **Email**: dev-support@communityos.com

## 📄 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you agree to uphold this code.

### Our Standards
- Be welcoming and inclusive
- Respect differing viewpoints
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

---

**Thank you for contributing to CommunityOS! Together, we're building the future of community monetization.** 🚀