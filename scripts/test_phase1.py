#!/usr/bin/env python3
"""
Phase 1 Test Script - SINOTRUK Customer Requirements
Tests for Bug Fixes: Product Detail Page & Add Product Form
No external dependencies - pure Python code analysis
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

def test_route_order():
    """Test 1.1: Check route order in App.jsx"""
    report = TestReport("Route Order Check")
    
    content = read_file("src/App.jsx")
    if not content:
        report.add_result("Read App.jsx", False, "File not found")
        return report
    
    lines = content.split("\n")
    product_detail_line = -1
    product_category_line = -1
    
    for i, line in enumerate(lines):
        if '/product/:id' in line:
            product_detail_line = i
        if '/products/:category' in line:
            product_category_line = i
    
    # Check route order
    if product_detail_line > -1 and product_category_line > -1:
        route_order_ok = product_detail_line < product_category_line
        report.add_result(
            "Route /product/:id comes before /products/:category",
            route_order_ok,
            f"product/:id at line {product_detail_line+1}, products/:category at line {product_category_line+1}"
        )
        if not route_order_ok:
            report.add_issue("Route order incorrect - /product/:id should come before /products/:category")
    else:
        report.add_result(
            "Both routes defined",
            product_detail_line > -1 and product_category_line > -1,
            f"product/:id: {'Found' if product_detail_line > -1 else 'Missing'}, products/:category: {'Found' if product_category_line > -1 else 'Missing'}"
        )
    
    return report

def test_product_detail_page():
    """Test 1.1: Check ProductDetail.jsx fetches from Supabase correctly"""
    report = TestReport("Product Detail Page Analysis")
    
    content = read_file("src/pages/ProductDetail.jsx")
    if not content:
        report.add_result("Read ProductDetail.jsx", False, "File not found")
        return report
    
    # Check for Supabase integration
    report.add_result(
        "Uses Supabase for data fetching",
        "supabase" in content.lower() and "from('products')" in content,
        "Checking database integration"
    )
    
    # Check for proper ID handling
    report.add_result(
        "Uses useParams to get product ID",
        "useParams" in content and "id" in content,
        "Checking route parameter usage"
    )
    
    # Check for redirect on error
    report.add_result(
        "Handles missing product gracefully",
        "navigate('/products')" in content or "navigate(\"/products\")" in content,
        "Checking error handling"
    )
    
    # Check for loading state
    report.add_result(
        "Has loading state",
        "loading" in content and "setLoading" in content,
        "Checking UX for loading"
    )
    
    return report

def test_product_category_page():
    """Test: Check if ProductCategory uses mock data or real database"""
    report = TestReport("Product Category Page Analysis")
    
    content = read_file("src/pages/ProductCategory.jsx")
    if not content:
        report.add_result("Read ProductCategory.jsx", False, "File not found")
        return report
    
    # Check for mock data
    uses_mock_data = "categoryData = {" in content or "'howo-a7'" in content
    uses_supabase = "supabase" in content.lower()
    
    report.add_result(
        "Uses Supabase instead of mock data",
        uses_supabase and not uses_mock_data,
        "Mock data detected" if uses_mock_data else "Database integration OK"
    )
    
    if uses_mock_data and not uses_supabase:
        report.add_issue("ProductCategory.jsx uses hardcoded mock data - needs to fetch from Supabase")
    
    return report

def test_add_product_modal():
    """Test 1.2: Check AddProductModal has separate dropdowns"""
    report = TestReport("Add Product Modal Analysis")
    
    content = read_file("admin_ui/src/components/AddProductModal.tsx")
    if not content:
        report.add_result("Read AddProductModal.tsx", False, "File not found")
        return report
    
    # Check for vehicle_ids field in state
    has_vehicle_ids = "vehicle_ids" in content
    report.add_result(
        "Has vehicle_ids field in form state",
        has_vehicle_ids,
        "Required for multi-select vehicle types"
    )
    
    # Check for category filtering by is_vehicle_name
    has_category_filter = "is_vehicle_name" in content
    report.add_result(
        "Filters categories by is_vehicle_name",
        has_category_filter,
        "Required for separating part categories from vehicle types"
    )
    
    # Check for separate dropdowns
    has_separate_labels = (
        ('Danh mục phụ tùng' in content or 'Danh mục' in content) and 
        ('Loại xe' in content or 'vehicle' in content.lower())
    )
    
    if not has_category_filter:
        report.add_issue("AddProductModal needs to separate dropdown into 'Danh mục phụ tùng' and 'Loại xe áp dụng'")
    
    if not has_vehicle_ids:
        report.add_issue("AddProductModal needs vehicle_ids array field for multi-select vehicle types")
    
    return report

def test_database_schema():
    """Check database schema has required fields"""
    report = TestReport("Database Schema Analysis")
    
    content = read_file("admin_ui/database_updates.sql")
    if not content:
        report.add_result("Read database_updates.sql", False, "File not found")
        return report
    
    # Check for is_vehicle_name field in categories
    report.add_result(
        "Categories has is_vehicle_name field",
        "is_vehicle_name" in content.lower(),
        "Required for distinguishing part categories from vehicle types"
    )
    
    # Check for vehicle_ids in products (might be in original schema)
    supabase_schema = read_file("admin_ui/supabase_schema.sql") or ""
    has_vehicle_ids = "vehicle_ids" in content or "vehicle_ids" in supabase_schema
    
    report.add_result(
        "Products has vehicle_ids field",
        has_vehicle_ids,
        "Required for multi-vehicle support"
    )
    
    return report

def test_supabase_service():
    """Check Supabase service has proper types"""
    report = TestReport("Supabase Service Analysis")
    
    content = read_file("admin_ui/src/services/supabase.ts")
    if not content:
        report.add_result("Read supabase.ts", False, "File not found")
        return report
    
    # Check Product interface
    report.add_result(
        "Product interface has vehicle_ids",
        "vehicle_ids" in content,
        "Type definition for vehicle array"
    )
    
    # Check Category interface
    report.add_result(
        "Category interface has is_vehicle_name",
        "is_vehicle_name" in content,
        "Type definition for category type flag"
    )
    
    return report

def main():
    print("=" * 70)
    print("  PHASE 1 TEST SCRIPT - SINOTRUK Bug Fixes")
    print(f"  Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    
    all_issues = []
    all_passed = True
    
    # Run tests
    tests = [
        ("1. Route Order", test_route_order),
        ("2. Product Detail Page", test_product_detail_page),
        ("3. Product Category Page", test_product_category_page),
        ("4. Add Product Modal", test_add_product_modal),
        ("5. Database Schema", test_database_schema),
        ("6. Supabase Service Types", test_supabase_service),
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
        print("  ✅ ALL TESTS PASSED - Phase 1 is complete!")
    else:
        print("  ❌ TESTS FAILED - Fix the issues above")
    print("=" * 70)
    
    # Output issues to JSON for parsing
    output = {
        "phase": 1,
        "all_passed": all_passed and not all_issues,
        "issues": all_issues,
        "timestamp": datetime.now().isoformat()
    }
    
    with open(os.path.join(BASE_PATH, "scripts/phase1_results.json"), "w") as f:
        json.dump(output, f, indent=2)
    
    print(f"\n  Results saved to: scripts/phase1_results.json")
    
    return 0 if (all_passed and not all_issues) else 1

if __name__ == "__main__":
    sys.exit(main())
