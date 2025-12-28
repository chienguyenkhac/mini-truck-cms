#!/usr/bin/env python3
"""
Phase 3 Test Script - SINOTRUK Customer Requirements
Tests for New Features: Watermark & Admin Settings
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

def test_watermark_api():
    """Test 3.1: Check watermark API endpoint exists"""
    report = TestReport("Watermark API")
    
    # Check for upload API with watermark support
    api_content = read_file("admin_ui/api/upload.js") or ""
    
    has_watermark = "watermark" in api_content.lower() or "overlay" in api_content.lower()
    
    report.add_result(
        "Upload API has watermark support",
        has_watermark,
        "Cloudinary transformation or custom watermark"
    )
    
    if not has_watermark:
        report.add_issue("Upload API needs watermark support (Cloudinary overlay recommended)")
    
    return report

def test_watermark_config():
    """Test 3.1: Check watermark configuration"""
    report = TestReport("Watermark Configuration")
    
    # Check for watermark config in database schema or upload API
    db_content = read_file("admin_ui/database_updates.sql") or ""
    api_content = read_file("admin_ui/api/upload.js") or ""
    
    has_config = (
        "watermark" in db_content.lower() or 
        "watermark" in api_content.lower()
    )
    
    report.add_result(
        "Watermark configuration exists",
        has_config,
        "Checking for watermark settings"
    )
    
    if not has_config:
        report.add_issue("Need watermark configuration (logo URL or Cloudinary overlay)")
    
    return report

def test_settings_database():
    """Test 3.2: Check settings table in database"""
    report = TestReport("Settings Database")
    
    content = read_file("admin_ui/database_updates.sql")
    if not content:
        report.add_result("Read database_updates.sql", False, "File not found")
        return report
    
    has_settings = "settings" in content.lower() or "site_config" in content.lower()
    
    report.add_result(
        "Settings table in database schema",
        has_settings,
        "Required for storing site configuration"
    )
    
    if not has_settings:
        report.add_issue("Database needs settings or site_config table")
    
    return report

def test_settings_page():
    """Test 3.2: Check Settings page exists in admin"""
    report = TestReport("Admin Settings Page")
    
    # Check for settings page
    settings_page = read_file("admin_ui/src/pages/Settings.tsx")
    if not settings_page:
        settings_page = read_file("admin_ui/src/pages/SettingsPage.tsx")
    
    report.add_result(
        "Settings page component exists",
        settings_page is not None,
        "Admin UI settings page"
    )
    
    if not settings_page:
        report.add_issue("Need to create Settings.tsx page in admin_ui")
        return report
    
    # Check for required fields
    has_logo = "logo" in settings_page.lower()
    has_company = "company" in settings_page.lower() or "công ty" in settings_page.lower()
    has_hotline = "hotline" in settings_page.lower() or "phone" in settings_page.lower()
    has_address = "address" in settings_page.lower() or "địa chỉ" in settings_page.lower()
    
    report.add_result(
        "Settings page has logo field",
        has_logo,
        "Logo upload/configuration"
    )
    
    report.add_result(
        "Settings page has company name field",
        has_company,
        "Company name configuration"
    )
    
    report.add_result(
        "Settings page has hotline field",
        has_hotline,
        "Hotline/phone configuration"
    )
    
    report.add_result(
        "Settings page has address field",
        has_address,
        "Address configuration"
    )
    
    if not has_logo:
        report.add_issue("Settings page needs logo field")
    if not has_company:
        report.add_issue("Settings page needs company name field")
    if not has_hotline:
        report.add_issue("Settings page needs hotline field")
    if not has_address:
        report.add_issue("Settings page needs address field")
    
    return report

def test_settings_navigation():
    """Test 3.2: Check Settings in admin navigation"""
    report = TestReport("Settings Navigation")
    
    # Check sidebar or navigation
    sidebar_content = read_file("admin_ui/src/components/Layout/Sidebar.tsx") or ""
    app_content = read_file("admin_ui/src/App.tsx") or ""
    
    has_nav = "settings" in sidebar_content.lower() or "cài đặt" in sidebar_content.lower()
    has_route = "settings" in app_content.lower()
    
    report.add_result(
        "Settings in navigation menu",
        has_nav,
        "Checking sidebar/menu"
    )
    
    report.add_result(
        "Settings route defined",
        has_route,
        "Checking App.tsx routes"
    )
    
    if not has_nav:
        report.add_issue("Need to add Settings to sidebar navigation")
    if not has_route:
        report.add_issue("Need to add /settings route in App.tsx")
    
    return report

def main():
    print("=" * 70)
    print("  PHASE 3 TEST SCRIPT - SINOTRUK New Features")
    print(f"  Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    
    all_issues = []
    all_passed = True
    
    # Run tests
    tests = [
        ("1. Watermark - API", test_watermark_api),
        ("2. Watermark - Config", test_watermark_config),
        ("3. Settings - Database", test_settings_database),
        ("4. Settings - Page", test_settings_page),
        ("5. Settings - Navigation", test_settings_navigation),
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
        print("  ✅ ALL TESTS PASSED - Phase 3 is complete!")
    else:
        print("  ❌ TESTS FAILED - Fix the issues above")
    print("=" * 70)
    
    # Output issues to JSON for parsing
    output = {
        "phase": 3,
        "all_passed": all_passed and not all_issues,
        "issues": all_issues,
        "timestamp": datetime.now().isoformat()
    }
    
    with open(os.path.join(BASE_PATH, "scripts/phase3_results.json"), "w") as f:
        json.dump(output, f, indent=2)
    
    print(f"\n  Results saved to: scripts/phase3_results.json")
    
    return 0 if (all_passed and not all_issues) else 1

if __name__ == "__main__":
    sys.exit(main())
