#!/bin/bash

# Script kiểm tra code - CHỈ NHỮNG PHẦN QUAN TRỌNG CÓ THỂ LÀM BUILD FAILED
# Chạy: npm run check-code

set -e

echo "🔍 Checking critical build requirements..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✅ SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[❌ ERROR]${NC} $1"
}

# Track results
FAILED=0

run_critical_check() {
    local check_name="$1"
    local command="$2"
    
    print_status "Checking $check_name..."
    
    if eval "$command" > /tmp/check_output 2>&1; then
        print_success "$check_name ✅"
        return 0
    else
        print_error "$check_name ❌"
        echo "Error details:"
        cat /tmp/check_output | head -20
        echo ""
        ((FAILED++))
        return 1
    fi
}

echo ""
echo "🎯 Critical Checks (Build Blockers):"
echo ""

# 1. TypeScript Compilation - CAN BREAK BUILD
run_critical_check "TypeScript compilation" "npx tsc --noEmit"

# 2. ESLint - CAN BREAK BUILD  
run_critical_check "ESLint (errors only)" "npm run lint"

# 3. Production Build - MAIN CHECK
run_critical_check "Production build" "npm run build"

# 4. Check for sensitive files in git staging
print_status "Checking staged files for secrets..."
staged_files=$(git diff --cached --name-only 2>/dev/null || echo "")
if [ -n "$staged_files" ]; then
    sensitive_found=false
    for file in $staged_files; do
        if [[ "$file" == *".env"* ]] || [[ "$file" == *".key"* ]] || [[ "$file" == *"secret"* ]]; then
            print_error "Sensitive file in staging: $file"
            sensitive_found=true
            ((FAILED++))
        fi
    done
    if [ "$sensitive_found" = false ]; then
        print_success "No sensitive files in staging ✅"
    fi
else
    print_status "No staged files to check"
fi

# 5. Check for large files in staging
print_status "Checking for large files..."
if [ -n "$staged_files" ]; then
    large_found=false
    for file in $staged_files; do
        if [ -f "$file" ] && [ $(stat -f%z "$file" 2>/dev/null || echo 0) -gt 10485760 ]; then
            print_error "Large file (>10MB): $file"
            large_found=true
            ((FAILED++))
        fi
    done
    if [ "$large_found" = false ]; then
        print_success "No large files detected ✅"
    fi
fi

echo ""
echo "📊 Results Summary:"
echo "================================"

if [ $FAILED -eq 0 ]; then
    print_success "🎉 ALL CRITICAL CHECKS PASSED!"
    echo ""
    echo "✅ TypeScript: No errors"
    echo "✅ ESLint: No errors"  
    echo "✅ Build: Successful"
    echo "✅ Security: No issues"
    echo ""
    echo "🚀 Ready to commit and push!"
    exit 0
else
    print_error "💥 $FAILED CRITICAL ISSUES FOUND!"
    echo ""
    echo "❌ Must fix before commit/push"
    echo ""
    echo "🔧 Quick fixes:"
    echo "  • Fix TypeScript errors: Check types and imports"
    echo "  • Fix ESLint errors: Run 'npm run lint -- --fix'"
    echo "  • Fix build errors: Check console output above"
    echo "  • Remove sensitive files from staging"
    echo ""
    exit 1
fi