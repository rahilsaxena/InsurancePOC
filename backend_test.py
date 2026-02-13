#!/usr/bin/env python3
"""
Backend API Testing for INSpace Insurance Risk Analytics Platform
Tests all API endpoints with mock data validation
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, List, Any

class INSpaceAPITester:
    def __init__(self, base_url="https://risk-mapper-4.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test_name": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    {details}")

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int = 200, 
                 data: Dict = None, validate_response: callable = None) -> tuple:
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}" if not endpoint.startswith('/') else f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}

        print(f"\n🔍 Testing {name}...")
        print(f"    URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if success:
                try:
                    response_data = response.json()
                    if validate_response:
                        validation_result = validate_response(response_data)
                        if not validation_result[0]:
                            success = False
                            details += f" | Validation failed: {validation_result[1]}"
                        else:
                            details += f" | Response validated successfully"
                    else:
                        details += f" | Response received: {len(str(response_data))} chars"
                except Exception as e:
                    details += f" | JSON parse error: {str(e)}"
                    if expected_status == 200:
                        success = False
            else:
                details += f" | Expected {expected_status}"
                try:
                    error_data = response.json()
                    details += f" | Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f" | Response: {response.text[:100]}"

            self.log_test(name, success, details)
            return success, response.json() if success else {}

        except requests.exceptions.Timeout:
            self.log_test(name, False, "Request timeout (10s)")
            return False, {}
        except requests.exceptions.ConnectionError:
            self.log_test(name, False, "Connection error - server may be down")
            return False, {}
        except Exception as e:
            self.log_test(name, False, f"Error: {str(e)}")
            return False, {}

    def validate_assets_response(self, data: List[Dict]) -> tuple:
        """Validate assets API response"""
        if not isinstance(data, list):
            return False, "Response is not a list"
        
        if len(data) == 0:
            return False, "No assets returned"
        
        # Check first asset structure
        asset = data[0]
        required_fields = ['assetId', 'latitude', 'longitude', 'giv', 'pnl', 'assetType', 'address']
        
        for field in required_fields:
            if field not in asset:
                return False, f"Missing required field: {field}"
        
        return True, f"Valid assets list with {len(data)} items"

    def validate_flood_zones_response(self, data: List[Dict]) -> tuple:
        """Validate flood zones API response"""
        if not isinstance(data, list):
            return False, "Response is not a list"
        
        if len(data) == 0:
            return False, "No flood zones returned"
        
        # Check first zone structure
        zone = data[0]
        required_fields = ['flood_id', 'flood_category', 'flood_depth_m', 'coordinates']
        
        for field in required_fields:
            if field not in zone:
                return False, f"Missing required field: {field}"
        
        return True, f"Valid flood zones list with {len(data)} items"

    def validate_kpi_response(self, data: Dict) -> tuple:
        """Validate KPI response"""
        if not isinstance(data, dict):
            return False, "Response is not a dictionary"
        
        required_fields = ['totalGIV', 'totalPnL', 'assetCount']
        
        for field in required_fields:
            if field not in data:
                return False, f"Missing required field: {field}"
        
        return True, "Valid KPI response"

    def validate_flood_kpi_response(self, data: Dict) -> tuple:
        """Validate flood KPI response"""
        if not isinstance(data, dict):
            return False, "Response is not a dictionary"
        
        required_fields = ['floodedGIV', 'estimatedFloodLoss', 'exposedAssetCount', 'totalAssets']
        
        for field in required_fields:
            if field not in data:
                return False, f"Missing required field: {field}"
        
        return True, "Valid flood KPI response"

    def run_all_tests(self):
        """Run comprehensive API tests"""
        print("=" * 60)
        print("🚀 Starting INSpace API Testing")
        print("=" * 60)

        # Basic health checks
        self.run_test("API Root Endpoint", "GET", "")
        self.run_test("Health Check", "GET", "health")

        # Asset endpoints
        self.run_test("Get All Assets", "GET", "assets", 
                     validate_response=self.validate_assets_response)
        
        # Test specific asset (using first asset from mock data)
        self.run_test("Get Specific Asset", "GET", "assets/COMM-00001")
        
        # Test asset search
        self.run_test("Search Assets", "GET", "assets/search/FACT")

        # Flood zone endpoints
        self.run_test("Get All Flood Zones", "GET", "flood-zones",
                     validate_response=self.validate_flood_zones_response)
        
        # Test specific flood zone
        self.run_test("Get Specific Flood Zone", "GET", "flood-zones/FZ-001")

        # KPI endpoints
        self.run_test("Get Portfolio KPIs", "GET", "kpis/portfolio",
                     validate_response=self.validate_kpi_response)
        
        self.run_test("Get Flood KPIs", "GET", "kpis/flood",
                     validate_response=self.validate_flood_kpi_response)

        # Status check endpoints (existing functionality)
        status_data = {"client_name": "test_client"}
        self.run_test("Create Status Check", "POST", "status", 200, status_data)
        self.run_test("Get Status Checks", "GET", "status")

        # Error handling tests
        self.run_test("Non-existent Asset", "GET", "assets/INVALID-ID", 404)
        self.run_test("Non-existent Flood Zone", "GET", "flood-zones/INVALID-ID", 404)

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed / self.tests_run * 100):.1f}%")
        
        if self.tests_passed < self.tests_run:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test_name']}: {result['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = INSpaceAPITester()
    
    try:
        tester.run_all_tests()
        success = tester.print_summary()
        
        # Save detailed results
        with open('/app/test_reports/backend_api_results.json', 'w') as f:
            json.dump({
                'summary': {
                    'total_tests': tester.tests_run,
                    'passed_tests': tester.tests_passed,
                    'success_rate': tester.tests_passed / tester.tests_run * 100,
                    'timestamp': datetime.now().isoformat()
                },
                'detailed_results': tester.test_results
            }, f, indent=2)
        
        return 0 if success else 1
        
    except Exception as e:
        print(f"\n💥 Test execution failed: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())