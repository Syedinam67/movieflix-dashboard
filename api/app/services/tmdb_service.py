import os
import requests

class TMDBService:
    def __init__(self):
        self.api_key = os.getenv("TMDB_API_KEY")
        self.base_url = os.getenv("TMDB_BASE_URL", "https://api.themoviedb.org/3/").rstrip('/')

    def fetch(self, endpoint, params=None):
        if params is None:
            params = {}
        
        params['api_key'] = self.api_key
        
        try:
            url = f"{self.base_url}/{endpoint}"
            response = requests.get(url, params=params)
            response.raise_for_status()
            return response.json(), response.status_code
        except requests.exceptions.HTTPError as http_err:
            try:
                # Try to get error message from TMDB response
                error_data = response.json()
                return {"error": error_data.get("status_message", str(http_err))}, response.status_code
            except:
                return {"error": f"TMDB API Error: {str(http_err)}"}, response.status_code
        except Exception as err:
            print(f"DEBUG: TMDB Fetch Error: {str(err)}")
            return {"error": f"An unexpected error occurred: {str(err)}"}, 500
