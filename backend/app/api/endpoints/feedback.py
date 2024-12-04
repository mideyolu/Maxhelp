from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from sqlalchemy import desc
from db.models import Feedback, User, BusinessUnit
from db.session import get_session
from sqlalchemy.orm import selectinload
from schemas.feedback import FeedbackCreate, FeedbackResponse
from datetime import datetime
from utils.utils import verify_access_token, oauth2_scheme_user

router = APIRouter()

@router.post("/create-feedback", response_model=FeedbackResponse)
async def create_feedback(
    feedback: FeedbackCreate,
    db: AsyncSession = Depends(get_session),
    token: str = Depends(oauth2_scheme_user)
):
    """
    Create feedback: Only customers can provide feedback.
    Customers provide feedback based on business unit name.
    """
    # Verify token and get user info
    payload = verify_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    # Fetch the current user
    statement = select(User).where(User.email == payload["sub"])
    result = await db.execute(statement)
    current_user = result.scalars().first()

    if current_user is None or current_user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can provide feedback",
        )

    # Find the business unit by name
    statement = select(BusinessUnit).where(BusinessUnit.name == feedback.unit_name)
    result = await db.execute(statement)
    business_unit = result.scalars().first()

    if not business_unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business unit not found",
        )

    # Create feedback entry
    new_feedback = Feedback(
        user_id=current_user.id,
        unit_id=business_unit.id,
        comment=feedback.comment,
        rating=feedback.rating,
        created_at=datetime.now(),
    )
    db.add(new_feedback)
    await db.commit()
    await db.refresh(new_feedback)

    return FeedbackResponse(
        id=new_feedback.id,
        user_id=new_feedback.user_id,
        unit_id=new_feedback.unit_id,
        comment=new_feedback.comment,
        rating=new_feedback.rating,
        created_at=new_feedback.created_at,
        unit_name=business_unit.name,
        customer_name=current_user.name
    )


@router.get("/list-feedbacks", response_model=List[FeedbackResponse])
async def get_feedback(
    db: AsyncSession = Depends(get_session),
    token: str = Depends(oauth2_scheme_user)
):
    """
    Get feedback: Admins can see all feedback; Employees can see feedback for their unit only.
    """
    # Verify token and get user info
    payload = verify_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    # Fetch the current user
    statement = select(User).where(User.email == payload["sub"])
    result = await db.execute(statement)
    current_user = result.scalars().first()

    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid user",
        )

    # Define base query
    base_query = (
        select(
            Feedback,
            User.name.label("customer_name"),
            BusinessUnit.name.label("unit_name"),
        )
        .join(User, User.id == Feedback.user_id)
        .join(BusinessUnit, BusinessUnit.id == Feedback.unit_id)
    )

    # Admins can see all feedback
    if current_user.role == "admin":
        statement = base_query
    elif current_user.role == "employee":
        # Employees can see feedback only for their assigned unit
        if not current_user.unit_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Employee is not assigned to a business unit",
            )
        statement = base_query.where(Feedback.unit_id == current_user.unit_id)
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized to view feedback",
        )

    # Execute query
    result = await db.execute(statement)
    feedback_records = result.all()

    # Convert result to response model
    feedback_list = [
        FeedbackResponse(
            id=feedback.id,
            user_id=feedback.user_id,
            unit_id=feedback.unit_id,
            comment=feedback.comment,
            rating=feedback.rating,
            created_at=feedback.created_at,
            customer_name=customer_name,
            unit_name=unit_name,
        )
        for feedback, customer_name, unit_name in feedback_records
    ]

    return feedback_list


@router.get("/customer/list-feedbacks", response_model=List[FeedbackResponse])
async def get_feedbacks(db: AsyncSession = Depends(get_session)):
    """
    Get a list of feedbacks, including customer name and unit name.
    """
    try:
        # Query to fetch feedback along with customer_name and unit_name
        statement = (
            select(
                Feedback,
                User.name.label("customer_name"),
                BusinessUnit.name.label("unit_name"),
            )
            .join(User, User.id == Feedback.user_id)
            .join(BusinessUnit, BusinessUnit.id == Feedback.unit_id)
        )
        results = await db.execute(statement)
        feedback_records = results.all()

        # Convert to FeedbackResponse
        feedbacks = [
            FeedbackResponse(
                id=record.Feedback.id,
                user_id=record.Feedback.user_id,
                unit_id=record.Feedback.unit_id,
                comment=record.Feedback.comment,
                rating=record.Feedback.rating,
                created_at=record.Feedback.created_at,
                customer_name=record.customer_name,
                unit_name=record.unit_name,
            )
            for record in feedback_records
        ]

        return feedbacks

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
