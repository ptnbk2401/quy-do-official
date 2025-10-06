#!/bin/bash

# Setup Git Hooks - One-time setup
echo "🔧 Setting up Git Hooks..."

# Make hooks executable
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/pre-push
chmod +x scripts/check-code.sh

echo "✅ Git hooks setup complete!"
echo ""
echo "📋 Available commands:"
echo "  npm run check-code    - Manual check"
echo "  git commit           - Auto runs pre-commit hook"
echo "  git push             - Auto runs pre-push hook"
echo ""
echo "🚀 Ready to use!"