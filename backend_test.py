#!/usr/bin/env python3
"""
Digital Twin Car Backend API Testing Script
Tests all API endpoints with realistic car simulation data
"""

import requests
import json
import uuid
import time
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:3000/api"
TIMEOUT = 30

def print_test_result(test_name, success, details=""):
    """Print formatted test results"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} {test_name}")
    if details:
        print(f"   Details: {details}")
    print()

def test_api_root():
    """Test GET /api/ - API information endpoint"""
    print("🔍 Testing API Root Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/", timeout=TIMEOUT)
        
        if response.status_code == 200:
            data = response.json()
            expected_fields = ["message", "version", "endpoints"]
            
            if all(field in data for field in expected_fields):
                print_test_result("API Root Endpoint", True, f"Status: {response.status_code}, Message: {data.get('message')}")
                return True
            else:
                print_test_result("API Root Endpoint", False, f"Missing expected fields. Got: {list(data.keys())}")
                return False
        else:
            print_test_result("API Root Endpoint", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("API Root Endpoint", False, f"Exception: {str(e)}")
        return False

def test_car_state_creation():
    """Test POST /api/car-state - Create car simulation states"""
    print("🔍 Testing Car State Creation...")
    
    # Test data with realistic car simulation values
    test_cases = [
        {
            "name": "Engine Running - Drive Gear",
            "data": {
                "engineRunning": True,
                "currentGear": "D",
                "speed": 45,
                "rpm": 2500,
                "carColor": "#ff6b6b",
                "sessionId": str(uuid.uuid4())
            }
        },
        {
            "name": "Engine Off - Park Gear",
            "data": {
                "engineRunning": False,
                "currentGear": "P",
                "speed": 0,
                "rpm": 0,
                "carColor": "#4ecdc4",
                "sessionId": str(uuid.uuid4())
            }
        },
        {
            "name": "High Speed - 5th Gear",
            "data": {
                "engineRunning": True,
                "currentGear": "5",
                "speed": 85,
                "rpm": 4200,
                "carColor": "#45b7d1",
                "sessionId": str(uuid.uuid4())
            }
        },
        {
            "name": "Reverse Gear",
            "data": {
                "engineRunning": True,
                "currentGear": "R",
                "speed": 5,
                "rpm": 1200,
                "carColor": "#f39c12",
                "sessionId": str(uuid.uuid4())
            }
        }
    ]
    
    created_states = []
    all_passed = True
    
    for test_case in test_cases:
        try:
            response = requests.post(
                f"{BASE_URL}/car-state",
                json=test_case["data"],
                headers={"Content-Type": "application/json"},
                timeout=TIMEOUT
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify response structure
                expected_fields = ["id", "engineRunning", "currentGear", "speed", "rpm", "carColor", "timestamp", "sessionId"]
                if all(field in data for field in expected_fields):
                    # Verify data integrity
                    if (data["engineRunning"] == test_case["data"]["engineRunning"] and
                        data["currentGear"] == test_case["data"]["currentGear"] and
                        data["speed"] == test_case["data"]["speed"] and
                        data["rpm"] == test_case["data"]["rpm"] and
                        data["carColor"] == test_case["data"]["carColor"]):
                        
                        created_states.append(data)
                        print_test_result(f"Car State Creation - {test_case['name']}", True, 
                                        f"ID: {data['id']}, Gear: {data['currentGear']}, Speed: {data['speed']} mph")
                    else:
                        print_test_result(f"Car State Creation - {test_case['name']}", False, "Data mismatch in response")
                        all_passed = False
                else:
                    print_test_result(f"Car State Creation - {test_case['name']}", False, 
                                    f"Missing fields. Got: {list(data.keys())}")
                    all_passed = False
            else:
                print_test_result(f"Car State Creation - {test_case['name']}", False, 
                                f"Status: {response.status_code}, Response: {response.text}")
                all_passed = False
                
        except Exception as e:
            print_test_result(f"Car State Creation - {test_case['name']}", False, f"Exception: {str(e)}")
            all_passed = False
    
    return all_passed, created_states

def test_car_state_retrieval(created_states):
    """Test GET /api/car-state - Retrieve all car states"""
    print("🔍 Testing Car State Retrieval...")
    
    try:
        response = requests.get(f"{BASE_URL}/car-state", timeout=TIMEOUT)
        
        if response.status_code == 200:
            data = response.json()
            
            if isinstance(data, list):
                if len(data) >= len(created_states):
                    # Verify structure of returned states
                    if data and all(field in data[0] for field in ["id", "engineRunning", "currentGear", "speed", "rpm"]):
                        print_test_result("Car State Retrieval", True, 
                                        f"Retrieved {len(data)} states, Expected at least {len(created_states)}")
                        return True, data
                    else:
                        print_test_result("Car State Retrieval", False, "Invalid state structure in response")
                        return False, []
                else:
                    print_test_result("Car State Retrieval", False, 
                                    f"Expected at least {len(created_states)} states, got {len(data)}")
                    return False, []
            else:
                print_test_result("Car State Retrieval", False, f"Expected array, got: {type(data)}")
                return False, []
        else:
            print_test_result("Car State Retrieval", False, f"Status: {response.status_code}, Response: {response.text}")
            return False, []
            
    except Exception as e:
        print_test_result("Car State Retrieval", False, f"Exception: {str(e)}")
        return False, []

def test_car_state_by_id(created_states):
    """Test GET /api/car-state/:id - Get specific car state"""
    print("🔍 Testing Car State by ID...")
    
    if not created_states:
        print_test_result("Car State by ID", False, "No created states to test with")
        return False
    
    all_passed = True
    
    # Test with valid IDs
    for i, state in enumerate(created_states[:2]):  # Test first 2 states
        try:
            response = requests.get(f"{BASE_URL}/car-state/{state['id']}", timeout=TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                
                if data["id"] == state["id"] and data["currentGear"] == state["currentGear"]:
                    print_test_result(f"Car State by ID - State {i+1}", True, 
                                    f"ID: {data['id']}, Gear: {data['currentGear']}")
                else:
                    print_test_result(f"Car State by ID - State {i+1}", False, "Data mismatch")
                    all_passed = False
            else:
                print_test_result(f"Car State by ID - State {i+1}", False, 
                                f"Status: {response.status_code}, Response: {response.text}")
                all_passed = False
                
        except Exception as e:
            print_test_result(f"Car State by ID - State {i+1}", False, f"Exception: {str(e)}")
            all_passed = False
    
    # Test with invalid ID
    try:
        invalid_id = str(uuid.uuid4())
        response = requests.get(f"{BASE_URL}/car-state/{invalid_id}", timeout=TIMEOUT)
        
        if response.status_code == 404:
            print_test_result("Car State by ID - Invalid ID", True, "Correctly returned 404 for invalid ID")
        else:
            print_test_result("Car State by ID - Invalid ID", False, 
                            f"Expected 404, got {response.status_code}")
            all_passed = False
            
    except Exception as e:
        print_test_result("Car State by ID - Invalid ID", False, f"Exception: {str(e)}")
        all_passed = False
    
    return all_passed

def test_car_state_session_filter(created_states):
    """Test GET /api/car-state?sessionId=<session_id> - Filter by session"""
    print("🔍 Testing Car State Session Filter...")
    
    if not created_states:
        print_test_result("Car State Session Filter", False, "No created states to test with")
        return False
    
    # Test with a valid session ID
    test_session_id = created_states[0]["sessionId"]
    
    try:
        response = requests.get(f"{BASE_URL}/car-state?sessionId={test_session_id}", timeout=TIMEOUT)
        
        if response.status_code == 200:
            data = response.json()
            
            if isinstance(data, list):
                # All returned states should have the same session ID
                if all(state["sessionId"] == test_session_id for state in data):
                    print_test_result("Car State Session Filter", True, 
                                    f"Found {len(data)} states for session {test_session_id[:8]}...")
                    return True
                else:
                    print_test_result("Car State Session Filter", False, "Session ID mismatch in results")
                    return False
            else:
                print_test_result("Car State Session Filter", False, f"Expected array, got: {type(data)}")
                return False
        else:
            print_test_result("Car State Session Filter", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("Car State Session Filter", False, f"Exception: {str(e)}")
        return False

def test_metrics_endpoint():
    """Test GET /api/metrics - Get simulation statistics"""
    print("🔍 Testing Metrics Endpoint...")
    
    try:
        response = requests.get(f"{BASE_URL}/metrics", timeout=TIMEOUT)
        
        if response.status_code == 200:
            data = response.json()
            
            expected_fields = ["totalSimulations", "uniqueSessions", "averageSpeed", "averageRPM", "lastUpdated"]
            if all(field in data for field in expected_fields):
                # Verify data types
                if (isinstance(data["totalSimulations"], int) and
                    isinstance(data["uniqueSessions"], int) and
                    isinstance(data["averageSpeed"], (int, float)) and
                    isinstance(data["averageRPM"], (int, float))):
                    
                    print_test_result("Metrics Endpoint", True, 
                                    f"Total: {data['totalSimulations']}, Sessions: {data['uniqueSessions']}, "
                                    f"Avg Speed: {data['averageSpeed']} mph, Avg RPM: {data['averageRPM']}")
                    return True
                else:
                    print_test_result("Metrics Endpoint", False, "Invalid data types in metrics")
                    return False
            else:
                print_test_result("Metrics Endpoint", False, f"Missing fields. Got: {list(data.keys())}")
                return False
        else:
            print_test_result("Metrics Endpoint", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("Metrics Endpoint", False, f"Exception: {str(e)}")
        return False

def test_error_cases():
    """Test error handling for invalid routes and data"""
    print("🔍 Testing Error Cases...")
    
    all_passed = True
    
    # Test invalid route
    try:
        response = requests.get(f"{BASE_URL}/invalid-route", timeout=TIMEOUT)
        if response.status_code == 404:
            print_test_result("Error Case - Invalid Route", True, "Correctly returned 404")
        else:
            print_test_result("Error Case - Invalid Route", False, f"Expected 404, got {response.status_code}")
            all_passed = False
    except Exception as e:
        print_test_result("Error Case - Invalid Route", False, f"Exception: {str(e)}")
        all_passed = False
    
    # Test POST with invalid JSON
    try:
        response = requests.post(
            f"{BASE_URL}/car-state",
            data="invalid json",
            headers={"Content-Type": "application/json"},
            timeout=TIMEOUT
        )
        if response.status_code in [400, 500]:
            print_test_result("Error Case - Invalid JSON", True, f"Correctly handled invalid JSON with status {response.status_code}")
        else:
            print_test_result("Error Case - Invalid JSON", False, f"Unexpected status: {response.status_code}")
            all_passed = False
    except Exception as e:
        print_test_result("Error Case - Invalid JSON", False, f"Exception: {str(e)}")
        all_passed = False
    
    return all_passed

def test_cors_headers():
    """Test CORS headers are properly set"""
    print("🔍 Testing CORS Headers...")
    
    try:
        # Test OPTIONS request
        response = requests.options(f"{BASE_URL}/", timeout=TIMEOUT)
        
        cors_headers = [
            'Access-Control-Allow-Origin',
            'Access-Control-Allow-Methods',
            'Access-Control-Allow-Headers'
        ]
        
        if all(header in response.headers for header in cors_headers):
            print_test_result("CORS Headers", True, "All required CORS headers present")
            return True
        else:
            missing_headers = [h for h in cors_headers if h not in response.headers]
            print_test_result("CORS Headers", False, f"Missing headers: {missing_headers}")
            return False
            
    except Exception as e:
        print_test_result("CORS Headers", False, f"Exception: {str(e)}")
        return False

def main():
    """Run all backend API tests"""
    print("=" * 60)
    print("🚗 DIGITAL TWIN CAR BACKEND API TESTING")
    print("=" * 60)
    print(f"Base URL: {BASE_URL}")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    print()
    
    # Track test results
    test_results = []
    
    # Run all tests
    test_results.append(("API Root Endpoint", test_api_root()))
    
    creation_success, created_states = test_car_state_creation()
    test_results.append(("Car State Creation", creation_success))
    
    retrieval_success, retrieved_states = test_car_state_retrieval(created_states)
    test_results.append(("Car State Retrieval", retrieval_success))
    
    test_results.append(("Car State by ID", test_car_state_by_id(created_states)))
    test_results.append(("Car State Session Filter", test_car_state_session_filter(created_states)))
    test_results.append(("Metrics Endpoint", test_metrics_endpoint()))
    test_results.append(("Error Cases", test_error_cases()))
    test_results.append(("CORS Headers", test_cors_headers()))
    
    # Summary
    print("=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in test_results if result)
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
    
    print()
    print(f"Overall Result: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All backend API tests PASSED!")
        return True
    else:
        print(f"⚠️  {total - passed} test(s) FAILED!")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)