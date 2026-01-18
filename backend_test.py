import requests
import sys
import json
from datetime import datetime

class JoboostAPITester:
    def __init__(self, base_url="https://employ-manage.preview.emergentagent.com"):
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

    def test_health_check(self):
        """Test API health endpoints"""
        print("\n🔍 Testing Health Endpoints...")
        self.run_test("API Root", "GET", "", 200)
        self.run_test("Health Check", "GET", "health", 200)

    def test_user_registration(self):
        """Test user registration"""
        print("\n🔍 Testing User Registration...")
        
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
            self.log_test("Token Extraction", True, f"User ID: {self.user_id}")
            return test_user
        else:
            self.log_test("Token Extraction", False, "No token in response")
            return None

    def test_user_login(self, user_data):
        """Test user login"""
        print("\n🔍 Testing User Login...")
        
        if not user_data:
            self.log_test("Login Test", False, "No user data available")
            return
        
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        
        response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if response and 'token' in response:
            self.token = response['token']
            self.log_test("Login Token Update", True)
        else:
            self.log_test("Login Token Update", False)

    def test_auth_me(self):
        """Test get current user"""
        print("\n🔍 Testing Auth Me...")
        
        if not self.token:
            self.log_test("Auth Me", False, "No token available")
            return
        
        self.run_test("Get Current User", "GET", "auth/me", 200)

    def test_applications_crud(self):
        """Test applications CRUD operations"""
        print("\n🔍 Testing Applications CRUD...")
        
        if not self.token:
            self.log_test("Applications CRUD", False, "No token available")
            return
        
        # Test GET applications (empty list initially)
        self.run_test("Get Applications (Empty)", "GET", "applications", 200)
        
        # Test CREATE application
        new_app = {
            "company_name": "Test Company",
            "job_title": "Développeur Full Stack",
            "job_description": "Poste de développeur full stack avec React et Python",
            "location": "Paris, France",
            "status": "todo",
            "notes": "Candidature de test"
        }
        
        create_response = self.run_test(
            "Create Application",
            "POST",
            "applications",
            200,
            data=new_app
        )
        
        app_id = None
        if create_response and 'application' in create_response:
            app_id = create_response['application'].get('application_id')
            self.log_test("Application ID Extraction", True, f"App ID: {app_id}")
        else:
            self.log_test("Application ID Extraction", False)
            return
        
        # Test GET applications (should have 1 now)
        self.run_test("Get Applications (With Data)", "GET", "applications", 200)
        
        # Test GET single application
        if app_id:
            self.run_test(
                "Get Single Application",
                "GET",
                f"applications/{app_id}",
                200
            )
            
            # Test UPDATE application
            update_data = {
                "status": "applied",
                "notes": "Candidature envoyée"
            }
            self.run_test(
                "Update Application",
                "PUT",
                f"applications/{app_id}",
                200,
                data=update_data
            )
            
            # Test UPDATE status only
            self.run_test(
                "Update Application Status",
                "PATCH",
                f"applications/{app_id}/status?status=interview",
                200
            )
            
            # Test DELETE application
            self.run_test(
                "Delete Application",
                "DELETE",
                f"applications/{app_id}",
                200
            )

    def test_profile_operations(self):
        """Test profile operations"""
        print("\n🔍 Testing Profile Operations...")
        
        if not self.token:
            self.log_test("Profile Operations", False, "No token available")
            return
        
        # Test GET profile (should be empty initially)
        self.run_test("Get Profile (Empty)", "GET", "profile", 200)
        
        # Test CREATE/UPDATE profile
        profile_data = {
            "user_id": self.user_id,
            "title": "Développeur Full Stack",
            "summary": "Développeur passionné avec 5 ans d'expérience",
            "experiences": [
                {
                    "title": "Développeur Senior",
                    "company": "Tech Corp",
                    "start_date": "2020-01-01",
                    "end_date": "2024-12-31",
                    "current": False,
                    "description": "Développement d'applications web"
                }
            ],
            "education": [
                {
                    "degree": "Master Informatique",
                    "institution": "Université Paris",
                    "start_date": "2015-09-01",
                    "end_date": "2017-06-30"
                }
            ],
            "skills": ["React", "Python", "FastAPI", "MongoDB"],
            "languages": [{"language": "Français", "level": "Natif"}],
            "phone": "+33123456789",
            "location": "Paris, France"
        }
        
        self.run_test(
            "Create/Update Profile",
            "POST",
            "profile",
            200,
            data=profile_data
        )
        
        # Test GET profile (should have data now)
        self.run_test("Get Profile (With Data)", "GET", "profile", 200)

    def test_stats(self):
        """Test stats endpoint"""
        print("\n🔍 Testing Stats...")
        
        if not self.token:
            self.log_test("Stats", False, "No token available")
            return
        
        self.run_test("Get Stats", "GET", "stats", 200)

    def test_error_cases(self):
        """Test error cases"""
        print("\n🔍 Testing Error Cases...")
        
        # Test unauthorized access
        old_token = self.token
        self.token = None
        self.run_test("Unauthorized Access", "GET", "applications", 401)
        self.token = old_token
        
        # Test invalid application ID
        if self.token:
            self.run_test(
                "Invalid Application ID",
                "GET",
                "applications/invalid_id",
                404
            )

    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting Joboost API Tests...")
        print(f"Testing against: {self.base_url}")
        
        # Test health
        self.test_health_check()
        
        # Test authentication flow
        user_data = self.test_user_registration()
        self.test_user_login(user_data)
        self.test_auth_me()
        
        # Test main functionality
        self.test_applications_crud()
        self.test_profile_operations()
        self.test_stats()
        
        # Test error cases
        self.test_error_cases()
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {self.tests_run - self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = JoboostAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
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