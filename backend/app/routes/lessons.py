import json
import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import User, Lesson, LessonProgress
from backend.app.schemas import (
    LessonResponse,
    LessonCompleteRequest,
    LessonCompleteResponse,
    LessonProgressSummary,
)
from backend.app.auth import get_current_user

router = APIRouter(prefix="/api/lessons", tags=["Lessons"])

@router.get("", response_model=List[LessonResponse])
def get_lessons(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    lessons = db.query(Lesson).order_by(Lesson.order.asc()).all()
    user_progress = {
        lp.lesson_id: lp
        for lp in db.query(LessonProgress).filter(LessonProgress.user_id == current_user.id).all()
    }

    result = []
    for l in lessons:
        options = json.loads(l.quiz_options) if l.quiz_options else []
        lp = user_progress.get(l.id)
        result.append(
            LessonResponse(
                id=l.id,
                title=l.title,
                slug=l.slug,
                description=l.description,
                content=l.content,
                example=l.example,
                why_matters=l.why_matters,
                key_takeaway=l.key_takeaway,
                quiz_question=l.quiz_question,
                quiz_options=options,
                order=l.order,
                completed=lp.completed if lp else False,
                quiz_correct=lp.quiz_correct if lp else False,
            )
        )
    return result

@router.get("/progress", response_model=LessonProgressSummary)
def get_progress_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total = db.query(Lesson).count()
    completed = (
        db.query(LessonProgress)
        .filter(LessonProgress.user_id == current_user.id, LessonProgress.completed == True)
        .count()
    )
    pct = round((completed / total) * 100.0, 1) if total > 0 else 0.0
    return LessonProgressSummary(
        total_lessons=total,
        completed_lessons=completed,
        completion_percentage=pct,
    )

@router.get("/{lesson_id}", response_model=LessonResponse)
def get_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    l = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not l:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found.")

    lp = (
        db.query(LessonProgress)
        .filter(LessonProgress.user_id == current_user.id, LessonProgress.lesson_id == lesson_id)
        .first()
    )
    options = json.loads(l.quiz_options) if l.quiz_options else []

    return LessonResponse(
        id=l.id,
        title=l.title,
        slug=l.slug,
        description=l.description,
        content=l.content,
        example=l.example,
        why_matters=l.why_matters,
        key_takeaway=l.key_takeaway,
        quiz_question=l.quiz_question,
        quiz_options=options,
        order=l.order,
        completed=lp.completed if lp else False,
        quiz_correct=lp.quiz_correct if lp else False,
    )

@router.post("/{lesson_id}/complete", response_model=LessonCompleteResponse)
def complete_lesson(
    lesson_id: int,
    request: LessonCompleteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found.")

    options = json.loads(lesson.quiz_options) if lesson.quiz_options else []
    if request.selected_option < 0 or request.selected_option >= len(options):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid option selected.")

    is_correct = request.selected_option == lesson.correct_answer

    # Persist progress
    progress = (
        db.query(LessonProgress)
        .filter(LessonProgress.user_id == current_user.id, LessonProgress.lesson_id == lesson_id)
        .first()
    )

    if not progress:
        progress = LessonProgress(
            user_id=current_user.id,
            lesson_id=lesson_id,
            completed=True,
            quiz_correct=is_correct,
            completed_at=datetime.datetime.utcnow(),
        )
        db.add(progress)
    else:
        progress.completed = True
        progress.quiz_correct = is_correct
        progress.completed_at = datetime.datetime.utcnow()

    db.commit()

    explanation = (
        f"Correct! {lesson.key_takeaway}"
        if is_correct
        else f"Not quite. The correct answer is '{options[lesson.correct_answer]}'. Remember: {lesson.key_takeaway}"
    )

    return LessonCompleteResponse(
        completed=True,
        quiz_correct=is_correct,
        correct_answer=lesson.correct_answer,
        explanation=explanation,
    )
