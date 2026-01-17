import requests
import sys
import json
from datetime import datetime

class JoboostNewFeaturesTest:
    def __init__(self, base_url="https://career-crm.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
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
            print(f"    Details: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}, Expected: {expected_status}"
            
            if not success:
                try:
                    error_data = response.json()
                    details += f", Response: {error_data}"
                except:
                    details += f", Response: {response.text[:200]}"
            
            self.log_test(name, success, details)
            
            if success:
                try:
                    return response.json()
                except:
                    return {"status": "success"}
            return {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return {}

    def setup_test_user(self):
        """Create and login test user"""
        print("\n🔍 Setting up test user...")
        
        # Generate unique test user
        timestamp = datetime.now().strftime('%H%M%S')
        test_user = {
            "name": f"Test User {timestamp}",
            "email": f"test{timestamp}@example.com",
            "password": "TestPass123!"
        }
        
        response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user
        )
        
        if response and 'token' in response:
            self.token = response['token']
            self.user_id = response.get('user', {}).get('user_id')
            return True
        return False

    def test_timeline_api(self):
        """Test GET /api/stats/timeline returns timeline data"""
        print("\n🔍 Testing Timeline API...")
        
        if not self.token:
            self.log_test("Timeline API", False, "No token available")
            return
        
        response = self.run_test("GET /api/stats/timeline", "GET", "stats/timeline", 200)
        
        if response and 'timeline' in response:
            self.log_test("Timeline Data Structure", True, f"Timeline entries: {len(response['timeline'])}")
        else:
            self.log_test("Timeline Data Structure", False, "No timeline field in response")

    def test_recommendations_api(self):
        """Test GET /api/recommendations returns personalized offers"""
        print("\n🔍 Testing Recommendations API...")
        
        if not self.token:
            self.log_test("Recommendations API", False, "No token available")
            return
        
        response = self.run_test("GET /api/recommendations", "GET", "recommendations", 200)
        
        if response and 'offers' in response:
            offers = response['offers']
            self.log_test("Recommendations Data Structure", True, f"Offers count: {len(offers)}")
            
            # Check if offers have required fields
            if offers and len(offers) > 0:
                first_offer = offers[0]
                required_fields = ['title', 'company', 'match_score']
                has_all_fields = all(field in first_offer for field in required_fields)
                self.log_test("Offer Fields Validation", has_all_fields, f"First offer fields: {list(first_offer.keys())}")
        else:
            self.log_test("Recommendations Data Structure", False, "No offers field in response")

    def test_spontaneous_search_api(self):
        """Test POST /api/spontaneous/search returns companies"""
        print("\n🔍 Testing Spontaneous Search API...")
        
        if not self.token:
            self.log_test("Spontaneous Search API", False, "No token available")
            return
        
        search_data = {
            "location": "Paris",
            "rome": "M1805",
            "radius": 10
        }
        
        response = self.run_test(
            "POST /api/spontaneous/search", 
            "POST", 
            "spontaneous/search", 
            200, 
            data=search_data
        )
        
        if response and 'companies' in response:
            companies = response['companies']
            self.log_test("Companies Data Structure", True, f"Companies count: {len(companies)}")
            
            # Check if companies have required fields
            if companies and len(companies) > 0:
                first_company = companies[0]
                required_fields = ['id', 'name', 'hiring_score']
                has_all_fields = all(field in first_company for field in required_fields)
                self.log_test("Company Fields Validation", has_all_fields, f"First company fields: {list(first_company.keys())}")
        else:
            self.log_test("Companies Data Structure", False, "No companies field in response")

    def test_spontaneous_send_api(self):
        """Test POST /api/spontaneous/send deducts credits"""
        print("\n🔍 Testing Spontaneous Send API...")
        
        if not self.token:
            self.log_test("Spontaneous Send API", False, "No token available")
            return
        
        # First get user credits
        user_response = self.run_test("Get User Credits", "GET", "auth/me", 200)
        initial_credits = 0
        if user_response:
            initial_credits = user_response.get('spontaneous_credits', 0)
            self.log_test("Initial Credits Check", True, f"Initial credits: {initial_credits}")
        
        # Test sending to mock companies
        send_data = {
            "company_ids": ["comp_001", "comp_002"]
        }
        
        response = self.run_test(
            "POST /api/spontaneous/send", 
            "POST", 
            "spontaneous/send", 
            200, 
            data=send_data
        )
        
        if response:
            # Check if credits were deducted
            user_response_after = self.run_test("Get User Credits After", "GET", "auth/me", 200)
            if user_response_after:
                final_credits = user_response_after.get('spontaneous_credits', 0)
                expected_credits = initial_credits - 2
                credits_deducted = (final_credits == expected_credits)
                self.log_test("Credits Deduction", credits_deducted, f"Final credits: {final_credits}, Expected: {expected_credits}")

    def test_user_credits_structure(self):
        """Test user schema has new credit fields"""
        print("\n🔍 Testing User Credits Structure...")
        
        if not self.token:
            self.log_test("User Credits Structure", False, "No token available")
            return
        
        response = self.run_test("Get User Info", "GET", "auth/me", 200)
        
        if response:
            required_credit_fields = ['ai_cv_credits', 'ai_letter_credits', 'spontaneous_credits']
            has_all_credits = all(field in response for field in required_credit_fields)
            
            if has_all_credits:
                credit_values = {field: response[field] for field in required_credit_fields}
                self.log_test("User Credit Fields", True, f"Credit values: {credit_values}")
            else:
                missing_fields = [field for field in required_credit_fields if field not in response]
                self.log_test("User Credit Fields", False, f"Missing fields: {missing_fields}")

    def run_all_new_features_tests(self):
        """Run all new features tests"""
        print("🚀 Starting Joboost New Features Tests...")
        print(f"Testing against: {self.base_url}")
        
        # Setup
        if not self.setup_test_user():
            print("❌ Failed to setup test user, aborting tests")
            return False
        
        # Test new APIs
        self.test_timeline_api()
        self.test_recommendations_api()
        self.test_spontaneous_search_api()
        self.test_spontaneous_send_api()
        self.test_user_credits_structure()
        
        # Print summary
        print(f"\n📊 New Features Test Summary:")
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {self.tests_run - self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = JoboostNewFeaturesTest()
    success = tester.run_all_new_features_tests()
    
    # Save detailed results
    with open('/app/new_features_test_results.json', 'w') as f:
        json.dump({
            "summary": {
                "tests_run": tester.tests_run,
                "tests_passed": tester.tests_passed,
                "success_rate": (tester.tests_passed/tester.tests_run)*100 if tester.tests_run > 0 else 0,
                "timestamp": datetime.now().isoformat()
            },
            "detailed_results": tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())