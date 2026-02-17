from flask import Flask
from flask_cors import CORS
from models import db
from routes import api_bp
import os

app = Flask(__name__)
CORS(app)

import time
from sqlalchemy.exc import OperationalError

database_url = os.environ.get('DATABASE_URL')

# Validamos estrictamente que la variable exista para evitar fallos silenciosos
if not database_url:
    raise ValueError("¡Error Crítico!: No se ha configurado la variable DATABASE_URL en el entorno.")

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
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
            print("Bse de datos conectada e inicializada.")
            return
        except OperationalError:
            retries -= 1
            print(f"Base de datos no esta activa. Reintentado en 5 segundos... ({retries} intentos restantes)")
            time.sleep(5)
    print("No se pudo realizar conexion a la base de datos.")

if __name__ == '__main__':
    wait_for_db()
    app.run(host='0.0.0.0', port=5000, debug=True)
