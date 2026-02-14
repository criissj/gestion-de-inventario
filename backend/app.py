from flask import Flask
from flask_cors import CORS
from models import db
from routes import api_bp
import os

app = Flask(__name__)
CORS(app)

import time
from sqlalchemy.exc import OperationalError

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://admin:password@localhost:5432/inventory_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Register Blueprints
app.register_blueprint(api_bp, url_prefix='/api')

def wait_for_db():
    retries = 5
    while retries > 0:
        try:
            with app.app_context():
                db.create_all()
            print("Database connected and initialized.")
            return
        except OperationalError:
            retries -= 1
            print(f"Database not ready. Retrying in 5 seconds... ({retries} retries left)")
            time.sleep(5)
    print("Could not connect to database after retries.")

if __name__ == '__main__':
    wait_for_db()
    app.run(host='0.0.0.0', port=5000, debug=True)
