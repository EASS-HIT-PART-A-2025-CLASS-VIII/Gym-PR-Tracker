import urllib.request
import urllib.error
import urllib.parse
import json
import time

# Configuration
BASE_URL = "http://127.0.0.1:8000"
USERNAME = "demo_user"
PASSWORD = "demo_password123"

def print_step(step_name):
    print(f"\n{'='*50}\n▶ {step_name}\n{'='*50}")

def make_request(method, endpoint, data=None, headers=None):
    url = f"{BASE_URL}{endpoint}"
    if headers is None:
        headers = {}
    
    if data:
        json_data = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    else:
        json_data = None
        
    req = urllib.request.Request(url, data=json_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            body = response.read().decode("utf-8")
            return response.status, json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body)
        except:
            return e.code, body
    except urllib.error.URLError as e:
        return 0, str(e)

def login_request(username, password):
    # Auth uses x-www-form-urlencoded
    url = f"{BASE_URL}/auth/token"
    data = urllib.parse.urlencode({"username": username, "password": password}).encode()
    req = urllib.request.Request(url, data=data, method="POST")
    try:
        with urllib.request.urlopen(req) as response:
            return 200, json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()

def main():
    print("🚀 Starting Gym PR Tracker Live Demo (Zero-Dependency)...")

    # 1. Register User
    print_step("1. Registering Demo User")
    payload = {"username": USERNAME, "password": PASSWORD}
    status, body = make_request("POST", "/auth/register", payload)
    
    if status == 200:
        print(f"✅ User '{USERNAME}' registered successfully.")
    elif status == 400:
        print(f"ℹ️ User '{USERNAME}' already exists. Proceeding to login.")
    elif status == 0:
        print(f"❌ Connection failed: {body}")
        print("   Is the backend running?")
        return
    else:
        print(f"❌ Registration failed: {status} - {body}")
        return

    # 2. Login
    print_step("2. Logging In")
    status, body = login_request(USERNAME, PASSWORD)
    
    if status != 200:
        print(f"❌ Login failed: {status} - {body}")
        return
    
    token = body["access_token"]
    print(f"✅ Login successful! Token received.")
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Create PR
    print_step("3. Creating a new PR (Bench Press)")
    pr_data = {
        "exercise": "Bench Press",
        "weight": 100,
        "reps": 5
    }
    status, pr = make_request("POST", "/prs", pr_data, headers)
    
    if status == 201:
        print(f"✅ PR Created: {pr['exercise']} - {pr['weight']}kg x {pr['reps']} reps (ID: {pr['id']})")
    else:
        print(f"❌ Failed to create PR: {status} - {pr}")

    # 4. List PRs
    print_step("4. Listing all PRs for User")
    status, prs = make_request("GET", "/prs", headers=headers)
    
    if status == 200:
        print(f"📋 Found {len(prs)} PRs:")
        for pr in prs[-3:]:
            date_str = pr.get('performed_at', 'Unknown Date')[:10]
            print(f"   - {date_str}: {pr['exercise']} {pr['weight']}kg x {pr['reps']}")
    else:
        print(f"❌ Failed to list PRs: {status}")

    # 5. AI Coach
    print_step("5. Asking AI Coach for a Routine")
    coach_request = {
        "fitness_level": "Intermediate",
        "goals": ["Strength"],
        "equipment": ["Barbell", "Bench"],
        "duration_minutes": 45,
        "days_per_week": 3,
        "focus_area": "Upper Body"
    }
    print("🤖 Analyzing user stats and generating plan (this may take a few seconds)...")
    start_time = time.time()
    status, plan = make_request("POST", "/ai/generate_routine", coach_request, headers)
    duration = time.time() - start_time
    
    print(f"DEBUG: Status Code: {status}")
    print(f"DEBUG: Response Body: {plan}")

    if status == 200:
        if not plan:
            print("❌ AI Coach returned empty response.")
            return

        print(f"✅ Plan Generated in {duration:.2f}s!")
        print(f"   Plan Name: {plan.get('plan_name', 'Custom Plan')}")
        print(f"   Coach Note: {plan.get('coach_note', 'No note provided')[:100]}...")
    else:
        print(f"❌ AI Coach failed: {status} - {plan}")

    print("\n✨ Demo Completed Successfully! ✨")

if __name__ == "__main__":
    main()
