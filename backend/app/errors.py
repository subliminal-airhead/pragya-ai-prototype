from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Any, Dict, Optional
import uuid

class AppError(Exception):
    def __init__(
        self,
        message: str,
        code: str,
        http_status: int = 400,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.code = code
        self.http_status = http_status
        self.details = details or {}
        super().__init__(self.message)

class ErrorBody(BaseModel):
    code: str
    message: str
    details: Dict[str, Any] = {}

class ErrorEnvelope(BaseModel):
    error: ErrorBody

async def app_error_handler(request: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.http_status,
        content=ErrorEnvelope(
            error=ErrorBody(
                code=exc.code,
                message=exc.message,
                details=exc.details,
            )
        ).model_dump(),
    )

async def http_exception_handler(request: Request, exc: HTTPException):
    # Map common HTTP exceptions to our error envelope
    code_map = {
        422: "VALIDATION_ERROR",
        413: "FILE_TOO_LARGE",
        415: "FILE_UNSUPPORTED",
        404: "NOT_FOUND",
        429: "RATE_LIMITED",
        503: "LLM_UNAVAILABLE",
        500: "INTERNAL",
    }
    code = code_map.get(exc.status_code, "INTERNAL")
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorEnvelope(
            error=ErrorBody(
                code=code,
                message=str(exc.detail),
                details={},
            )
        ).model_dump(),
    )

async def unhandled_exception_handler(request: Request, exc: Exception):
    request_id = str(uuid.uuid4())
    # In a real app, log the exception with request_id
    return JSONResponse(
        status_code=500,
        content=ErrorEnvelope(
            error=ErrorBody(
                code="INTERNAL",
                message="Internal server error",
                details={"request_id": request_id},
            )
        ).model_dump(),
    )