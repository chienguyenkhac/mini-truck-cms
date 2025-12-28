#!/usr/bin/env python3
"""
Phase 4 Test Script - SINOTRUK Customer Requirements
Tests for UX Improvements: Product links open in new tab
"""

import os
import sys
import json
from datetime import datetime

class TestReport:
    def __init__(self, phase_name):
        self.phase_name = phase_name
        self.tests = []
        self.passed = 0
        self.failed = 0
        self.issues = []
        
    def add_result(self, name, passed, details=""):
        status = "✅ PASS" if passed else "❌ FAIL"
        self.tests.append({"name": name, "passed": passed, "details": details})
        if passed:
            self.passed += 1
        else:
            self.failed += 1
        print(f"  {status}: {name}")
        if details:
            print(f"      └─ {details}")
            
    def add_issue(self, issue):
        self.issues.append(issue)
            
    def summary(self):
        print(f"\n  Summary: {self.passed}/{self.passed + self.failed} tests passed")
        return self.failed == 0

BASE_PATH = "/Users/mymac/u.i-truck"

def read_file(path):
    """Read file content safely"""
    full_path = os.path.join(BASE_PATH, path) if not path.startswith("/") else path
    try:
        with open(full_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        return None

def test_product_grid_new_tab():
    """Test 4.1: Check ProductGrid opens links in new tab"""
    report = TestReport("Product Grid New Tab")
    
    content = read_file("src/components/Home/ProductGrid.jsx")
    if not content:
        report.add_result("Read ProductGrid.jsx", False, "File not found")
        return report
    
    # Check for target="_blank"
    has_new_tab = 'target="_blank"' in content or "target='_blank'" in content
    
    report.add_result(
        "ProductGrid links open in new tab",
        has_new_tab,
        "Checking for target='_blank'"
    )
    
    if not has_new_tab:
        report.add_issue("ProductGrid needs target='_blank' on product links")
    
    return report

def test_category_showcase_new_tab():
    """Test 4.1: Check CategoryShowcase opens links in new tab"""
    report = TestReport("Category Showcase New Tab")
    
    content = read_file("src/components/Home/CategoryShowcase.jsx")
    if not content:
        report.add_result("Read CategoryShowcase.jsx", False, "File not found")
        return report
    
    # Check for target="_blank"
    has_new_tab = 'target="_blank"' in content or "target='_blank'" in content
    
    report.add_result(
        "CategoryShowcase links open in new tab",
        has_new_tab,
        "Checking for target='_blank'"
    )
    
    if not has_new_tab:
        report.add_issue("CategoryShowcase needs target='_blank' on links")
    
    return report

def test_product_category_new_tab():
    """Test 4.1: Check ProductCategory page opens links in new tab"""
    report = TestReport("Product Category New Tab")
    
    content = read_file("src/pages/ProductCategory.jsx")
    if not content:
        report.add_result("Read ProductCategory.jsx", False, "File not found")
        return report
    
    # Check for target="_blank"
    has_new_tab = 'target="_blank"' in content or "target='_blank'" in content
    
    report.add_result(
        "ProductCategory links open in new tab",
        has_new_tab,
        "Checking for target='_blank'"
    )
    
    if not has_new_tab:
        report.add_issue("ProductCategory needs target='_blank' on product links")
    
    return report

def main():
    print("=" * 70)
    print("  PHASE 4 TEST SCRIPT - SINOTRUK UX Improvements")
    print(f"  Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    
    all_issues = []
    all_passed = True
    
    # Run tests
    tests = [
        ("1. ProductGrid New Tab", test_product_grid_new_tab),
        ("2. CategoryShowcase New Tab", test_category_showcase_new_tab),
        ("3. ProductCategory New Tab", test_product_category_new_tab),
    ]
    
    for test_name, test_func in tests:
        print(f"\n{'─' * 70}")
        print(f"  {test_name}")
        print(f"{'─' * 70}")
        report = test_func()
        passed = report.summary()
        all_passed = all_passed and passed
        all_issues.extend(report.issues)
    
    # Summary
    print("\n" + "=" * 70)
    if all_issues:
        print("  ❌ ISSUES DETECTED - NEED TO FIX:")
        print("=" * 70)
        for i, issue in enumerate(all_issues, 1):
            print(f"  {i}. {issue}")
        print("\n" + "=" * 70)
    
    if all_passed and not all_issues:
        print("  ✅ ALL TESTS PASSED - Phase 4 is complete!")
    else:
        print("  ❌ TESTS FAILED - Fix the issues above")
    print("=" * 70)
    
    # Output issues to JSON for parsing
    output = {
        "phase": 4,
        "all_passed": all_passed and not all_issues,
        "issues": all_issues,
        "timestamp": datetime.now().isoformat()
    }
    
    with open(os.path.join(BASE_PATH, "scripts/phase4_results.json"), "w") as f:
        json.dump(output, f, indent=2)
    
    print(f"\n  Results saved to: scripts/phase4_results.json")
    
    return 0 if (all_passed and not all_issues) else 1

if __name__ == "__main__":
    sys.exit(main())
