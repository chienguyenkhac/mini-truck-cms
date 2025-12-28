#!/usr/bin/env python3
"""
Phase 2 Test Script - SINOTRUK Customer Requirements
Tests for Database Changes: Manufacturer Code & Category Thumbnails
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

def test_manufacturer_code_database():
    """Test 2.1: Check manufacturer_code in database schema"""
    report = TestReport("Manufacturer Code Database")
    
    content = read_file("admin_ui/database_updates.sql")
    if not content:
        report.add_result("Read database_updates.sql", False, "File not found")
        return report
    
    has_manufacturer_code = "manufacturer_code" in content.lower()
    report.add_result(
        "manufacturer_code column in schema",
        has_manufacturer_code,
        "Required for storing manufacturer part number"
    )
    
    if not has_manufacturer_code:
        report.add_issue("Database schema needs manufacturer_code column in products table")
    
    return report

def test_manufacturer_code_types():
    """Test 2.1: Check manufacturer_code in TypeScript types"""
    report = TestReport("Manufacturer Code Types")
    
    content = read_file("admin_ui/src/services/supabase.ts")
    if not content:
        report.add_result("Read supabase.ts", False, "File not found")
        return report
    
    has_manufacturer_code = "manufacturer_code" in content
    report.add_result(
        "Product interface has manufacturer_code",
        has_manufacturer_code,
        "Type definition for manufacturer code"
    )
    
    if not has_manufacturer_code:
        report.add_issue("Product interface needs manufacturer_code field")
    
    return report

def test_manufacturer_code_add_modal():
    """Test 2.1: Check manufacturer_code in AddProductModal"""
    report = TestReport("Manufacturer Code in Add Modal")
    
    content = read_file("admin_ui/src/components/AddProductModal.tsx")
    if not content:
        report.add_result("Read AddProductModal.tsx", False, "File not found")
        return report
    
    has_field = "manufacturer_code" in content
    has_input = "Mã nhà sản xuất" in content or "manufacturer" in content.lower()
    
    report.add_result(
        "AddProductModal has manufacturer_code field",
        has_field,
        "Form field for manufacturer code"
    )
    
    report.add_result(
        "AddProductModal has manufacturer input UI",
        has_input,
        "Input field for manufacturer code"
    )
    
    if not has_field:
        report.add_issue("AddProductModal needs manufacturer_code in form state")
    if not has_input:
        report.add_issue("AddProductModal needs 'Mã nhà sản xuất' input field")
    
    return report

def test_manufacturer_code_edit_modal():
    """Test 2.1: Check manufacturer_code in EditProductModal"""
    report = TestReport("Manufacturer Code in Edit Modal")
    
    content = read_file("admin_ui/src/components/EditProductModal.tsx")
    if not content:
        report.add_result("Read EditProductModal.tsx", False, "File not found")
        return report
    
    has_field = "manufacturer_code" in content
    
    report.add_result(
        "EditProductModal has manufacturer_code field",
        has_field,
        "Form field for manufacturer code"
    )
    
    if not has_field:
        report.add_issue("EditProductModal needs manufacturer_code field")
    
    return report

def test_manufacturer_code_display():
    """Test 2.1: Check manufacturer_code display in ProductDetail"""
    report = TestReport("Manufacturer Code Display")
    
    content = read_file("src/pages/ProductDetail.jsx")
    if not content:
        report.add_result("Read ProductDetail.jsx", False, "File not found")
        return report
    
    has_display = "manufacturer_code" in content or "Mã NSX" in content or "Mã nhà sản xuất" in content
    
    report.add_result(
        "ProductDetail displays manufacturer_code",
        has_display,
        "Show manufacturer code to customers"
    )
    
    if not has_display:
        report.add_issue("ProductDetail.jsx needs to display manufacturer_code")
    
    return report

def test_category_thumbnail_database():
    """Test 2.2: Check category thumbnail in database"""
    report = TestReport("Category Thumbnail Database")
    
    content = read_file("admin_ui/database_updates.sql")
    if not content:
        report.add_result("Read database_updates.sql", False, "File not found")
        return report
    
    # Already has thumbnail from previous schema
    has_thumbnail = "categories" in content and "thumbnail" in content
    
    report.add_result(
        "Categories has thumbnail column",
        has_thumbnail,
        "Required for category images"
    )
    
    return report

def test_category_showcase_home():
    """Test 2.2: Check CategoryShowcase on homepage"""
    report = TestReport("Category Showcase on Homepage")
    
    # Check if component exists
    showcase_content = read_file("src/components/Home/CategoryShowcase.jsx")
    
    if not showcase_content:
        report.add_result(
            "CategoryShowcase component exists",
            False,
            "Component file not found"
        )
        report.add_issue("Need to create CategoryShowcase.jsx component")
        return report
    
    report.add_result(
        "CategoryShowcase component exists",
        True,
        "Component file found"
    )
    
    # Check it fetches from Supabase
    uses_supabase = "supabase" in showcase_content.lower()
    report.add_result(
        "CategoryShowcase fetches from database",
        uses_supabase,
        "Checking Supabase integration"
    )
    
    # Check it displays thumbnails
    shows_thumbnail = "thumbnail" in showcase_content
    report.add_result(
        "CategoryShowcase displays thumbnails",
        shows_thumbnail,
        "Checking image display"
    )
    
    if not uses_supabase:
        report.add_issue("CategoryShowcase needs Supabase integration")
    if not shows_thumbnail:
        report.add_issue("CategoryShowcase needs to display category thumbnails")
    
    return report

def test_homepage_uses_showcase():
    """Test 2.2: Check Home.jsx uses CategoryShowcase"""
    report = TestReport("Homepage Integration")
    
    content = read_file("src/pages/Home.jsx")
    if not content:
        report.add_result("Read Home.jsx", False, "File not found")
        return report
    
    uses_showcase = "CategoryShowcase" in content
    
    report.add_result(
        "Home.jsx imports CategoryShowcase",
        uses_showcase,
        "Homepage uses category showcase"
    )
    
    if not uses_showcase:
        report.add_issue("Home.jsx needs to import and use CategoryShowcase")
    
    return report

def main():
    print("=" * 70)
    print("  PHASE 2 TEST SCRIPT - SINOTRUK Database Changes")
    print(f"  Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    
    all_issues = []
    all_passed = True
    
    # Run tests
    tests = [
        ("1. Manufacturer Code - Database", test_manufacturer_code_database),
        ("2. Manufacturer Code - Types", test_manufacturer_code_types),
        ("3. Manufacturer Code - Add Modal", test_manufacturer_code_add_modal),
        ("4. Manufacturer Code - Edit Modal", test_manufacturer_code_edit_modal),
        ("5. Manufacturer Code - Display", test_manufacturer_code_display),
        ("6. Category Thumbnail - Database", test_category_thumbnail_database),
        ("7. Category Showcase - Component", test_category_showcase_home),
        ("8. Category Showcase - Homepage", test_homepage_uses_showcase),
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
        print("  ✅ ALL TESTS PASSED - Phase 2 is complete!")
    else:
        print("  ❌ TESTS FAILED - Fix the issues above")
    print("=" * 70)
    
    # Output issues to JSON for parsing
    output = {
        "phase": 2,
        "all_passed": all_passed and not all_issues,
        "issues": all_issues,
        "timestamp": datetime.now().isoformat()
    }
    
    with open(os.path.join(BASE_PATH, "scripts/phase2_results.json"), "w") as f:
        json.dump(output, f, indent=2)
    
    print(f"\n  Results saved to: scripts/phase2_results.json")
    
    return 0 if (all_passed and not all_issues) else 1

if __name__ == "__main__":
    sys.exit(main())
