"""
Institution Lookup API Router
Provides AICTE-based institution lookup with Google Search grounding.
"""

from fastapi import APIRouter, Query, Body, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from app.services.aicte_lookup_service import lookup_aicte_institution, validate_aicte_number


router = APIRouter(prefix="/api/v1/institution", tags=["Institution Lookup"])


class AicteLookupRequest(BaseModel):
    aicte_id: str = Field(..., description="AICTE Permanent Institute ID or Number (e.g. 1-4251711)")
    institution_name: Optional[str] = Field(None, description="Known institution name if available from local database")
    city: Optional[str] = Field(None, description="Institution city")
    state: Optional[str] = Field(None, description="Institution state")


class AicteLookupResponse(BaseModel):
    verified: bool
    aicteId: str
    institutionName: Optional[str] = None
    institutionType: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    officialWebsite: Optional[str] = None
    officialEmail: Optional[str] = None
    contactPhone: Optional[str] = None
    affiliatedUniversity: Optional[str] = None
    representativeName: Optional[str] = None
    coursesOffered: List[str] = []
    sourceUrls: List[str] = []
    missingFields: List[str] = []
    confidenceScore: float = 0.0
    message: Optional[str] = None


@router.post("/aicte-lookup", response_model=AicteLookupResponse)
async def aicte_lookup_post(req: AicteLookupRequest):
    """
    Look up and auto-extract institution details based on AICTE Permanent Institute ID
    using google_search from google.adk.tools.
    """
    if not req.aicte_id or not req.aicte_id.strip():
        raise HTTPException(status_code=400, detail="AICTE ID cannot be empty")
    
    result = lookup_aicte_institution(
        aicte_id=req.aicte_id,
        institution_name=req.institution_name,
        city=req.city,
        state=req.state
    )
    return result


@router.get("/aicte-lookup", response_model=AicteLookupResponse)
async def aicte_lookup_get(
    code: Optional[str] = Query(None, description="AICTE Permanent Institute ID"),
    aicte_id: Optional[str] = Query(None, description="AICTE Permanent Institute ID"),
    institution_name: Optional[str] = Query(None, description="Known institution name"),
    city: Optional[str] = Query(None, description="City"),
    state: Optional[str] = Query(None, description="State")
):
    """
    GET endpoint for AICTE Institution search and verification.
    """
    target_code = code or aicte_id or ""
    if not target_code.strip():
        raise HTTPException(status_code=400, detail="Please provide a valid 'code' or 'aicte_id' query parameter")
    
    result = lookup_aicte_institution(
        aicte_id=target_code,
        institution_name=institution_name,
        city=city,
        state=state
    )
    return result
