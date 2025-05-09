import os
import requests

def get_geolocation():
    """
    Get geolocation based on IP address using Google Geolocation API.
    Returns a dictionary with latitude and longitude if successful, otherwise None.
    """
    GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
    url = f"https://www.googleapis.com/geolocation/v1/geolocate?key={GOOGLE_API_KEY}"

    try:
        response = requests.post(url, json={})  # Sending an empty request for approximate location
        response.raise_for_status()
        data = response.json()
        return {
            "latitude": data['location']['lat'],
            "longitude": data['location']['lng']
        }
    except requests.exceptions.RequestException as e:
        print(f"Error fetching geolocation: {e}")
        return None
