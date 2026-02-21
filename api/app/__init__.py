from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from .models import db, bcrypt
from flask_jwt_extended import JWTManager

def create_app():
    # Load environment variables
    load_dotenv()
    
    frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
    app = Flask(__name__, static_folder=frontend_dir, static_url_path='/')
    CORS(app)
    
    @app.before_request
    def log_request_info():
        print(f"DEBUG: Request: {request.method} {request.path}")
    
    # Configuration
    username = os.getenv("DB_USERNAME")
    password = os.getenv("DB_PASSWORD")
    host = os.getenv("DB_HOST")
    port = os.getenv("DB_PORT")
    dbname = os.getenv("DB_NAME")
    
    # Configuration - Using local SQLite for local-only mode
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///movies.db'
    print("Running in local-only mode. Using SQLite database (movies.db).")
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY", "pro-secret-key")
    
    # Initialize Extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt = JWTManager(app)
    
    # Register blueprints
    with app.app_context():
        from . import routes
        app.register_blueprint(routes.main_bp)
        
        # Create tables if they don't exist
        # Note: In production, use migrations (Flask-Migrate)
        try:
            db.create_all()
        except Exception as e:
            print(f"Error creating database tables: {e}")
        
    
    # Catch-all route for React - defined LAST to avoid intercepting API
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        elif path.startswith('api/'):
            return {"error": "API route not found"}, 404
        else:
            return send_from_directory(app.static_folder, 'index.html')

    return app
