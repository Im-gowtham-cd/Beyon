"""
Unit tests for Google ADK Tools and AICTE Institution Lookup Service
"""

import pytest
from google.adk.tools import google_search
from app.services.aicte_lookup_service import (
    validate_aicte_number,
    lookup_aicte_institution
)


def test_validate_aicte_number():
    assert validate_aicte_number("1-4251711") is True
    assert validate_aicte_number("1-44468535196") is True
    assert validate_aicte_number("1-4235231") is True
    assert validate_aicte_number("ABC12345") is True
    assert validate_aicte_number("") is False
    assert validate_aicte_number("   ") is False
    assert validate_aicte_number("12") is False  # too short


def test_google_search_structure():
    results = google_search("Kongu Engineering College AICTE", num_results=3)
    assert isinstance(results, list)
    if results:
        first = results[0]
        assert "title" in first
        assert "url" in first
        assert "snippet" in first
        assert "source_domain" in first


def test_lookup_aicte_institution_known():
    result = lookup_aicte_institution("1-4251711")
    assert result["verified"] is True
    assert result["aicteId"] == "1-4251711"
    assert "Kongu Engineering College" in result["institutionName"]
    assert result["city"] == "Perundurai"
    assert result["state"] == "Tamil Nadu"
    assert result["pincode"] == "638060"
    assert result["officialWebsite"] == "https://www.kongu.ac.in"
    assert result["officialEmail"] == "principal@kongu.ac.in"
    assert result["affiliatedUniversity"] == "Anna University, Chennai"
    assert len(result["sourceUrls"]) > 0
    assert result["confidenceScore"] >= 0.9
    assert isinstance(result["missingFields"], list)


def test_lookup_aicte_institution_invalid():
    result = lookup_aicte_institution("!invalid@#$")
    assert result["verified"] is False
    assert result["confidenceScore"] == 0.0
    assert "missingFields" in result
