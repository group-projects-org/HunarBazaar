import os
from flask_cors import CORS
from flask import Flask, jsonify
from backend.user_state import login_bp, logout_bp, register_bp, initializeAPI
from backend.order import order_bp
from backend.OTPs import otp_bp
from backend.product import product_bp
from backend.suggestions import suggestion_bp

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.register_blueprint(login_bp, url_prefix="/api")
app.register_blueprint(logout_bp, url_prefix="/api")
app.register_blueprint(register_bp, url_prefix="/api")
app.register_blueprint(order_bp, url_prefix="/api")
app.register_blueprint(otp_bp, url_prefix="/api")
app.register_blueprint(product_bp, url_prefix="/api")
app.register_blueprint(suggestion_bp, url_prefix="/api")

@app.route('/api/initial', methods=['POST'])
def initial():
    initializeAPI()
    return jsonify({"message": "Initial state user_name = None"}), 201

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host='0.0.0.0', port=port)