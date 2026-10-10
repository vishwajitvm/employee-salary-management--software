import requests
res = requests.post("http://localhost:8000/api/v1/salaries/bulk-update", json={"department": "Engineering", "country": "USA", "city": "", "percentage_increase": 10})
print("POST Res:", res.json())
task_id = res.json().get("task_id")
if task_id:
    status_res = requests.get(f"http://localhost:8000/api/v1/tasks/{task_id}")
    print("GET Status:", status_res.json())
