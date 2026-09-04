def test_get_all_lessons(client, auth_headers):
    res = client.get("/api/lessons", headers=auth_headers)
    assert res.status_code == 200
    lessons = res.json()
    assert len(lessons) == 6
    # Ensure ordered properly
    assert lessons[0]["order"] == 1
    assert lessons[0]["slug"] == "what-is-a-stock"
    assert len(lessons[0]["quiz_options"]) > 0

def test_get_single_lesson(client, auth_headers):
    res = client.get("/api/lessons/1", headers=auth_headers)
    assert res.status_code == 200
    lesson = res.json()
    assert lesson["id"] == 1
    assert "content" in lesson
    assert "why_matters" in lesson
    assert "key_takeaway" in lesson

def test_quiz_completion_and_persistence(client, auth_headers):
    # Complete lesson 1 with correct answer (index 1)
    res = client.post("/api/lessons/1/complete", json={"selected_option": 1}, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["completed"] is True
    assert data["quiz_correct"] is True
    assert "Correct" in data["explanation"]

    # Verify progress persistence via GET /api/lessons
    res2 = client.get("/api/lessons", headers=auth_headers)
    assert res2.status_code == 200
    lessons = res2.json()
    l1 = next(l for l in lessons if l["id"] == 1)
    assert l1["completed"] is True
    assert l1["quiz_correct"] is True

    # Check progress summary
    res3 = client.get("/api/lessons/progress", headers=auth_headers)
    assert res3.status_code == 200
    summary = res3.json()
    assert summary["total_lessons"] == 6
    assert summary["completed_lessons"] >= 1
    assert summary["completion_percentage"] > 0
