from flask import Blueprint, request, jsonify
from .services.tmdb_service import TMDBService
from .models import db, User
from flask_jwt_extended import create_access_token
import re
import os
import secrets
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

main_bp = Blueprint('main', __name__)
tmdb_service = TMDBService()

# --- Auth Routes ---

@main_bp.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    
    # Basic validation
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    mobile = data.get('mobile')
    
    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password are required"}), 400
    
    # Check if user already exists
    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({"error": "User already exists"}), 400
    
    # Create new user
    new_user = User(username=username, email=email, mobile=mobile)
    new_user.set_password(password)
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User created successfully. Please login.", "redirect": "/login"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500

@main_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    
    if user and user.check_password(password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "user": user.to_dict()
        }), 200
    
    return jsonify({"error": "Invalid username or password"}), 401

@main_bp.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    
    user = User.query.filter_by(email=email).first()
    if not user:
        # For security, don't reveal if user exists, but here we can be more helpful
        return jsonify({"error": "User with this email not found"}), 404
    
    # Generate a simple reset token
    token = secrets.token_urlsafe(16)
    user.reset_token = token
    db.session.commit()
    
    # In a real app, you'd send an email. For local, we'll just return it for now
    # or tell the user it's "sent".
    return jsonify({
        "message": "Password reset initiated successfully.",
        "debug_token": token # Remove in production!
    }), 200

@main_bp.route('/api/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('new_password')
    
    user = User.query.filter_by(reset_token=token).first()
    if not user:
        return jsonify({"error": "Invalid or expired reset token"}), 400
    
    user.set_password(new_password)
    user.reset_token = None
    db.session.commit()
    
    return jsonify({"message": "Password updated successfully"}), 200

@main_bp.route('/api/google-login', methods=['POST'])
def google_login():
    data = request.get_json()
    credential = data.get('credential')
    
    try:
        # Verify the Google ID token
        # Get CLIENT_ID from env
        CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
        if not CLIENT_ID:
            return jsonify({"error": "Google Client ID not configured on server"}), 500
            
        idinfo = id_token.verify_oauth2_token(credential, google_requests.Request(), CLIENT_ID)
        
        # ID token is valid. Get user's Google ID, email, etc.
        google_id = idinfo['sub']
        email = idinfo['email']
        name = idinfo['name']
        
        # Check if user exists
        user = User.query.filter_by(email=email).first()
        
        if not user:
            # Create new user for first-time Google login
            # We generate a random username if name is taken
            username = name.replace(" ", "").lower()
            if User.query.filter_by(username=username).first():
                username = f"{username}{secrets.token_hex(2)}"
                
            user = User(username=username, email=email, google_id=google_id)
            db.session.add(user)
            db.session.commit()
        elif not user.google_id:
            # Link Google ID to existing account if emails match
            user.google_id = google_id
            db.session.commit()
            
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "message": "Google Login successful",
            "access_token": access_token,
            "user": user.to_dict()
        }), 200
        
    except ValueError as e:
        return jsonify({"error": f"Invalid Google token: {str(e)}"}), 401
    except Exception as e:
        return jsonify({"error": f"Auth error: {str(e)}"}), 500

# --- Movie Routes ---

@main_bp.route('/api/trending', methods=['GET'])
def get_trending():
    data, status_code = tmdb_service.fetch("trending/movie/week")
    return jsonify(data), status_code

@main_bp.route('/api/popular', methods=['GET'])
def get_popular():
    data, status_code = tmdb_service.fetch("movie/popular")
    return jsonify(data), status_code

@main_bp.route('/api/search', methods=['GET'])
def search_movies():
    query = request.args.get('q')
    if not query:
        return jsonify({"error": "Query parameter 'q' is required"}), 400
    
    data, status_code = tmdb_service.fetch("search/movie", params={"query": query})
    return jsonify(data), status_code

@main_bp.route('/api/movie/<int:movie_id>', methods=['GET'])
def get_movie_details(movie_id):
    data, status_code = tmdb_service.fetch(f"movie/{movie_id}")
    return jsonify(data), status_code

@main_bp.route('/api/movies/genre/<int:genre_id>', methods=['GET'])
def get_movies_by_genre(genre_id):
    data, status_code = tmdb_service.fetch("discover/movie", params={"with_genres": genre_id, "sort_by": "popularity.desc"})
    return jsonify(data), status_code

@main_bp.route('/api/tv-shows', methods=['GET'])
def get_tv_shows():
    data, status_code = tmdb_service.fetch("tv/popular")
    return jsonify(data), status_code

@main_bp.route('/api/movies', methods=['GET'])
def get_all_movies():
    data, status_code = tmdb_service.fetch("movie/top_rated")
    return jsonify(data), status_code

@main_bp.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy", 
        "tmdb_api": "configured" if tmdb_service.api_key else "missing",
        "database": "connected" # Simplified
    }), 200
