from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from app.services.cin_lookup_service import CinLookupService

router = APIRouter(prefix="/api/v1/company", tags=["Company Lookup & Verification"])


class CinLookupRequest(BaseModel):
    cin: str = Field(..., description="21-character Corporate Identification Number (CIN)")
    company_name: Optional[str] = Field(None, description="Optional registered company name hint")
    city: Optional[str] = Field(None, description="Optional city hint")
    state: Optional[str] = Field(None, description="Optional state hint")


@router.get("/cin-lookup")
async def cin_lookup_get(
    cin: str = Query(..., description="21-character Corporate Identification Number"),
    company_name: Optional[str] = Query(None, description="Optional company name hint"),
    city: Optional[str] = Query(None, description="Optional city hint"),
    state: Optional[str] = Query(None, description="Optional state hint")
) -> Dict[str, Any]:
    """Search, verify, and ground corporate entity details via Google Search and MCA registry."""
    if not cin or not cin.strip():
        raise HTTPException(status_code=400, detail="CIN code cannot be empty")

    return CinLookupService.lookup_by_cin(
        cin=cin.strip().upper(),
        company_name=company_name.strip() if company_name else None,
        city=city.strip() if city else None,
        state=state.strip() if state else None
    )


@router.post("/cin-lookup")
async def cin_lookup_post(req: CinLookupRequest) -> Dict[str, Any]:
    """Search, verify, and ground corporate entity details via Google Search and MCA registry."""
    return CinLookupService.lookup_by_cin(
        cin=req.cin.strip().upper(),
        company_name=req.company_name.strip() if req.company_name else None,
        city=req.city.strip() if req.city else None,
        state=req.state.strip() if req.state else None
    )
