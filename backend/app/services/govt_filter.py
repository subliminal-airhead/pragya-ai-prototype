from typing import List, Dict, Any, Optional
import os
import json

def load_json_file(filename: str) -> list:
    """Load JSON file from data directory"""
    # Get the directory where this file is located
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # Go up two levels to reach backend/, then into data/
    data_dir = os.path.join(current_dir, "..", "..", "data")
    filepath = os.path.join(data_dir, filename)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def check_eligibility(scheme: dict, profile_eligibility: dict) -> tuple[bool, List[str]]:
    """
    Check if a profile is eligible for a government scheme based on hard rules.
    Returns (is_eligible, list_of_reasons)
    """
    eligibility_rules = scheme.get("eligibility", {})
    reasons = []

    # Check age limits
    min_age = eligibility_rules.get("min_age")
    max_age = eligibility_rules.get("max_age")
    age = profile_eligibility.get("age")

    if min_age is not None and age is not None:
        if age < min_age:
            reasons.append(f"Age {age} is below minimum required age of {min_age}")
            return False, reasons
    elif min_age is not None and age is None:
        reasons.append("Age information is required to determine eligibility")
        return False, reasons

    if max_age is not None and age is not None:
        if age > max_age:
            reasons.append(f"Age {age} is above maximum allowed age of {max_age}")
            return False, reasons
    elif max_age is not None and age is None:
        reasons.append("Age information is required to determine eligibility")
        return False, reasons

    # Check qualification
    min_qualification = eligibility_rules.get("min_qualification")
    highest_qualification = profile_eligibility.get("highest_qualification")

    if min_qualification is not None:
        if highest_qualification is None:
            reasons.append("Highest qualification information is required to determine eligibility")
            return False, reasons
        else:
            # Simple string comparison - in production might need more sophisticated matching
            qual_levels = {
                "none": 0,
                "high school": 1,
                "diploma": 2,
                "associate's": 3,
                "bachelor's": 4,
                "master's": 5,
                "phd": 6
            }

            min_level = qual_levels.get(min_qualification.lower(), 0)
            actual_level = qual_levels.get(highest_qualification.lower(), 0)

            if actual_level < min_level:
                reasons.append(f"Qualification '{highest_qualification}' does not meet minimum requirement of '{min_qualification}'")
                return False, reasons

    # Check domicile state
    domicile_states = eligibility_rules.get("domicile_states", [])
    profile_state = profile_eligibility.get("domicile_state")

    if domicile_states:
        if profile_state is None:
            reasons.append("Domicile state information is required to determine eligibility")
            return False, reasons
        elif profile_state not in domicile_states:
            reasons.append(f"State '{profile_state}' is not eligible for this scheme (eligible states: {', '.join(domicile_states)})")
            return False, reasons

    # Check category (caste/community)
    categories = eligibility_rules.get("categories", [])
    profile_category = profile_eligibility.get("category")

    if categories:
        if profile_category is None:
            # Category is optional for some schemes, so we don't disqualify for missing category
            pass
        elif profile_category not in categories:
            reasons.append(f"Category '{profile_category}' is not eligible for this scheme")
            return False, reasons

    # If we passed all checks, the person is eligible
    return True, reasons

def filter_eligible_schemes(profile_eligibility: dict) -> List[Dict[str, Any]]:
    """
    Filter government schemes based on profile eligibility.
    Returns list of schemes with eligibility status and reasons.
    """
    schemes_data = load_json_file("govt_schemes.json")
    eligible_schemes = []

    for scheme in schemes_data:
        is_eligible, reasons = check_eligibility(scheme, profile_eligibility)

        scheme_copy = scheme.copy()
        scheme_copy["eligible"] = "yes" if is_eligible else "no" if reasons else "unknown"
        scheme_copy["reasons"] = reasons

        # Only include schemes where we can make a determination (yes or no)
        # For unknown eligibility due to missing data, we still include them but mark as unknown
        if scheme_copy["eligible"] in ["yes", "no", "unknown"]:
            eligible_schemes.append(scheme_copy)

    return eligible_schemes

def get_scheme_details(scheme_id: str) -> Optional[Dict[str, Any]]:
    """
    Get details for a specific government scheme by ID.
    """
    schemes_data = load_json_file("govt_schemes.json")
    for scheme in schemes_data:
        if scheme.get("id") == scheme_id:
            return scheme
    return None