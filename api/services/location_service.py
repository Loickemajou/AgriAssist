"""
Location service for converting coordinates to regions
and adding location context to AI responses
"""

def get_region_from_coordinates(lat: float, lng: float) -> dict:
    """
    Convert latitude and longitude to a region description
    This helps provide location-specific diagnoses
    
    Args:
        lat: Latitude coordinate
        lng: Longitude coordinate
    
    Returns:
        Dictionary with region info and climate info
    """
    
    # Define major agricultural regions with their coordinates
    regions = {
        # Africa
        "West Africa": {
            "coords": [(-5, 20), (-5, 0), (0, -20), (10, 0)],  # Rough bounds
            "countries": ["Nigeria", "Ghana", "Senegal", "Mali", "Burkina Faso", "Ivory Coast", "Cameroon"],
            "climate": "Tropical to Sahel",
            "crops": ["Millet", "Sorghum", "Maize", "Groundnut", "Cassava", "Yam"],
            "diseases": ["Fall armyworm", "Cassava brown streak", "Maize streak virus", "Blast"],
            "soil": "Laterite, sandy loam"
        },
        "East Africa": {
            "coords": [(0, 35), (12, 35), (12, 25), (0, 25)],  # Kenya, Tanzania, Uganda
            "countries": ["Kenya", "Tanzania", "Uganda", "Rwanda", "Burundi"],
            "climate": "Tropical highlands to savanna",
            "crops": ["Maize", "Coffee", "Tea", "Beans", "Wheat"],
            "diseases": ["Maize lethal necrosis", "Coffee leaf rust", "Bacterial wilt"],
            "soil": "Volcanic, red loam"
        },
        "Southern Africa": {
            "coords": [(-5, 25), (-35, 25), (-35, 15), (-5, 15)],  # South Africa, Zimbabwe, Zambia
            "countries": ["South Africa", "Zimbabwe", "Zambia", "Mozambique", "Malawi"],
            "climate": "Subtropical to temperate",
            "crops": ["Maize", "Soybeans", "Sunflower", "Tobacco", "Cotton"],
            "diseases": ["Maize rust", "Bacterial leaf scorch"],
            "soil": "Red soil, loamy"
        },
        "North Africa": {
            "coords": [(30, 0), (36, 0), (36, -20), (30, -20)],  # Egypt, Morocco, Tunisia
            "countries": ["Egypt", "Morocco", "Tunisia", "Algeria", "Sudan"],
            "climate": "Arid to Mediterranean",
            "crops": ["Wheat", "Barley", "Dates", "Citrus", "Olives"],
            "diseases": ["Dry rot", "Fusarium wilt"],
            "soil": "Desert, sandy clay"
        },
        # Asia
        "South Asia": {
            "coords": [(8, 68), (35, 68), (35, 92), (8, 92)],  # India, Pakistan, Bangladesh
            "countries": ["India", "Pakistan", "Bangladesh", "Sri Lanka"],
            "climate": "Tropical to subtropical monsoon",
            "crops": ["Rice", "Wheat", "Cotton", "Sugarcane", "Tea"],
            "diseases": ["Blast", "Sheath blight", "Rust", "Blight"],
            "soil": "Black, alluvial"
        },
        "Southeast Asia": {
            "coords": [(-10, 95), (20, 95), (20, 140), (-10, 140)],  # Thailand, Vietnam, Indonesia
            "countries": ["Thailand", "Vietnam", "Indonesia", "Philippines", "Myanmar"],
            "climate": "Tropical monsoon",
            "crops": ["Rice", "Coconut", "Rubber", "Spices", "Tropical fruits"],
            "diseases": ["Brown planthopper", "Rice blast", "Leaf scald"],
            "soil": "Laterite, volcanic"
        },
        # Americas
        "Central America": {
            "coords": [(8, -80), (16, -80), (16, -92), (8, -92)],
            "countries": ["Honduras", "Guatemala", "El Salvador", "Nicaragua", "Costa Rica"],
            "climate": "Tropical to subtropical",
            "crops": ["Maize", "Coffee", "Bananas", "Cacao", "Beans"],
            "diseases": ["Coffee leaf rust", "Banana Panama disease"],
            "soil": "Volcanic, red loam"
        },
        "South America": {
            "coords": [(-35, -70), (10, -70), (10, -35), (-35, -35)],  # Brazil, Argentina, Peru
            "countries": ["Brazil", "Argentina", "Peru", "Colombia", "Paraguay"],
            "climate": "Tropical to temperate",
            "crops": ["Soybeans", "Maize", "Coffee", "Sugarcane", "Wheat"],
            "diseases": ["Asian soybean rust", "Cercospora leaf spot"],
            "soil": "Red latosol, dark earth"
        },
    }
    
    # Find which region the coordinates fall into
    for region_name, region_data in regions.items():
        # Simple point-in-region check (can be improved with proper geopolygon)
        # For now, use major country coordinates
        if "East Africa" in region_name and -5 <= lat <= 12 and 25 <= lng <= 40:
            return {
                "region": region_name,
                "countries": region_data["countries"],
                "climate": region_data["climate"],
                "crops": region_data["crops"],
                "common_diseases": region_data["diseases"],
                "soil_type": region_data["soil"],
                "coordinates": {"lat": lat, "lng": lng}
            }
        elif "West Africa" in region_name and -5 <= lat <= 15 and -20 <= lng <= 20:
            return {
                "region": region_name,
                "countries": region_data["countries"],
                "climate": region_data["climate"],
                "crops": region_data["crops"],
                "common_diseases": region_data["diseases"],
                "soil_type": region_data["soil"],
                "coordinates": {"lat": lat, "lng": lng}
            }
        elif "Southern Africa" in region_name and -35 <= lat <= -5 and 15 <= lng <= 35:
            return {
                "region": region_name,
                "countries": region_data["countries"],
                "climate": region_data["climate"],
                "crops": region_data["crops"],
                "common_diseases": region_data["diseases"],
                "soil_type": region_data["soil"],
                "coordinates": {"lat": lat, "lng": lng}
            }
        elif "North Africa" in region_name and 20 <= lat <= 37 and -20 <= lng <= 40:
            return {
                "region": region_name,
                "countries": region_data["countries"],
                "climate": region_data["climate"],
                "crops": region_data["crops"],
                "common_diseases": region_data["diseases"],
                "soil_type": region_data["soil"],
                "coordinates": {"lat": lat, "lng": lng}
            }
        elif "South Asia" in region_name and 8 <= lat <= 35 and 68 <= lng <= 92:
            return {
                "region": region_name,
                "countries": region_data["countries"],
                "climate": region_data["climate"],
                "crops": region_data["crops"],
                "common_diseases": region_data["diseases"],
                "soil_type": region_data["soil"],
                "coordinates": {"lat": lat, "lng": lng}
            }
        elif "Southeast Asia" in region_name and -10 <= lat <= 20 and 95 <= lng <= 140:
            return {
                "region": region_name,
                "countries": region_data["countries"],
                "climate": region_data["climate"],
                "crops": region_data["crops"],
                "common_diseases": region_data["diseases"],
                "soil_type": region_data["soil"],
                "coordinates": {"lat": lat, "lng": lng}
            }
        elif "Central America" in region_name and 8 <= lat <= 16 and -92 <= lng <= -80:
            return {
                "region": region_name,
                "countries": region_data["countries"],
                "climate": region_data["climate"],
                "crops": region_data["crops"],
                "common_diseases": region_data["diseases"],
                "soil_type": region_data["soil"],
                "coordinates": {"lat": lat, "lng": lng}
            }
        elif "South America" in region_name and -35 <= lat <= 10 and -70 <= lng <= -35:
            return {
                "region": region_name,
                "countries": region_data["countries"],
                "climate": region_data["climate"],
                "crops": region_data["crops"],
                "common_diseases": region_data["diseases"],
                "soil_type": region_data["soil"],
                "coordinates": {"lat": lat, "lng": lng}
            }
    
    # Default response if region not found
    return {
        "region": "Global",
        "countries": ["Multiple countries"],
        "climate": "Unknown",
        "crops": ["Various crops"],
        "common_diseases": ["Various diseases"],
        "soil_type": "Unknown",
        "coordinates": {"lat": lat, "lng": lng}
    }


def create_location_context_prompt(region_info: dict) -> str:
    """
    Create a prompt context based on location information
    This will be added to the Gemini diagnosis prompt
    
    Args:
        region_info: Dictionary with region information from get_region_from_coordinates
    
    Returns:
        Formatted string to include in diagnosis prompt
    """
    
    context = f"""
LOCATION-BASED CONTEXT:
Region: {region_info['region']}
Coordinates: {region_info['coordinates']['lat']:.4f}, {region_info['coordinates']['lng']:.4f}
Countries: {', '.join(region_info['countries'])}
Climate: {region_info['climate']}
Soil Type: {region_info['soil_type']}
Common Crops in Region: {', '.join(region_info['crops'])}
Common Diseases in Region: {', '.join(region_info['common_diseases'])}

PLEASE CONSIDER:
1. The regional climate and weather patterns when diagnosing
2. Soil conditions typical to this region
3. Diseases that commonly affect crops in this geographic area
4. Treatments and recommendations suitable for {region_info['region']}
5. Crops commonly grown in this region
"""
    
    return context
