"""
Simple error handling for the Chronology backend.
"""

from fastapi import HTTPException, status


def project_not_found(project_id: str) -> HTTPException:
    """Create HTTP exception for project not found."""
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Project with id '{project_id}' not found"
    )


def metric_not_found(metric_id: str) -> HTTPException:
    """Create HTTP exception for metric not found."""
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Metric with id '{metric_id}' not found"
    )


def validation_error(message: str) -> HTTPException:
    """Create HTTP exception for validation error."""
    return HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=message
    )


def bad_request_error(message: str) -> HTTPException:
    """Create HTTP exception for bad request."""
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=message
    ) 