# Contributing to AmaPlayer Events App

Thank you for your interest in contributing to the AmaPlayer Events App! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Git
- Basic knowledge of React, TypeScript, and modern web development

### Development Setup
1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/amaplayer-events-app.git
   cd amaplayer-events-app/events
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open http://localhost:3006 in your browser

## 📋 How to Contribute

### Reporting Bugs
1. Check if the bug has already been reported in [Issues](https://github.com/yourusername/amaplayer-events-app/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (browser, OS, etc.)

### Suggesting Features
1. Check [Issues](https://github.com/yourusername/amaplayer-events-app/issues) for existing feature requests
2. Create a new issue with:
   - Clear title and description
   - Use case and motivation
   - Proposed implementation (if you have ideas)
   - Any relevant mockups or examples

### Code Contributions

#### Branch Naming Convention
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test improvements

#### Pull Request Process
1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes
3. Write or update tests
4. Update documentation if needed
5. Ensure all tests pass:
   ```bash
   npm test
   ```
6. Commit your changes with a clear message
7. Push to your fork
8. Create a Pull Request

## 🧪 Testing Guidelines

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

### Writing Tests
- Write unit tests for new functions and components
- Write integration tests for complex workflows
- Use descriptive test names
- Follow the existing test patterns
- Aim for good test coverage

### Test Structure
```typescript
describe('Component/Service Name', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something specific', () => {
    // Test implementation
  });
});
```

## 💻 Code Style Guidelines

### TypeScript
- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` type when possible
- Use meaningful variable and function names

### React Components
- Use functional components with hooks
- Follow the existing component structure
- Use proper prop types
- Handle loading and error states

### CSS
- Use CSS variables for theming
- Follow BEM naming convention when applicable
- Ensure responsive design
- Test on different screen sizes

### File Organization
```
src/
├── components/
│   ├── common/          # Reusable components
│   └── events/          # Feature-specific components
├── services/            # Business logic
├── hooks/               # Custom React hooks
├── types/               # TypeScript definitions
├── utils/               # Utility functions
└── test/                # Test files
```

## 📝 Commit Message Guidelines

Use conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```
feat(events): add event filtering by sport
fix(badges): resolve achievement notification display issue
docs(readme): update installation instructions
test(participation): add tests for join event flow
```

## 🎯 Development Focus Areas

### High Priority
- Database integration
- User authentication
- Real WebSocket implementation
- File upload improvements
- Performance optimizations

### Medium Priority
- Additional sports support
- Enhanced mobile experience
- Advanced analytics
- Social features expansion

### Low Priority
- UI/UX improvements
- Additional gamification features
- Third-party integrations

## 🔧 Development Tools

### Recommended VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Prettier - Code formatter
- ESLint
- Auto Rename Tag
- Bracket Pair Colorizer

### Browser Dev Tools
- React Developer Tools
- Redux DevTools (if using Redux)
- Lighthouse for performance auditing

## 📚 Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Vitest Documentation](https://vitest.dev/)

### Project-Specific
- [Feature Documentation](./FEATURE_DOCUMENTATION.md)
- [Join Events Guide](./JOIN_EVENTS_GUIDE.md)
- [Testing Guide](./TESTING_GUIDE.md)

## 🤝 Code Review Process

### For Contributors
- Ensure your code follows the style guidelines
- Write clear commit messages
- Include tests for new functionality
- Update documentation as needed
- Be responsive to feedback

### For Reviewers
- Be constructive and respectful
- Focus on code quality and maintainability
- Check for proper testing
- Verify documentation updates
- Test the changes locally

## 🐛 Debugging Tips

### Common Issues
1. **Build Errors**: Check TypeScript types and imports
2. **Test Failures**: Ensure proper mocking and setup
3. **Style Issues**: Check CSS syntax and responsive design
4. **Performance**: Use React DevTools Profiler

### Debug Tools
```javascript
// Use dev tools in browser console
devTools.viewEvents()
devTools.getStats()
devTools.reset()

// Enable debug logging
localStorage.setItem('debug', 'true')
```

## 📞 Getting Help

### Communication Channels
- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Pull Request Comments** - Code-specific discussions

### Response Times
- Issues: We aim to respond within 48 hours
- Pull Requests: We aim to review within 72 hours
- Critical bugs: We aim to respond within 24 hours

## 🎉 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- GitHub contributor graphs

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to the AmaPlayer Events App! Your efforts help make sports more accessible and engaging for everyone. 🏆