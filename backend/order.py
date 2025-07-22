#Root Directory in System Path
import sys, os
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../'))
if root_path not in sys.path:
    sys.path.append(root_path)

import pymongo
from uuid import uuid4
from dotenv import load_dotenv
from urllib.parse import unquote
from random import randint, choice
from flask import Blueprint, jsonify, request
from datetime import date, timedelta, datetime
from werkzeug.security import check_password_hash
from backend.Encryption import encrypt_dict, decrypt_dict, generate_qr
from backend.user_context_manager import load_user_context

load_dotenv()
mongo_uri = os.getenv("MONGO_URI")
if not mongo_uri: raise ValueError("MONGO_URI not set in environment variables")
mongo_client = pymongo.MongoClient(mongo_uri)
BASE_URL = os.getenv("BASE_URI")
db = mongo_client["Secure-Delivery-Data"]
collection = db["orders"]
collectionA = db["agents"]
collectionU = db["users"]

order_bp = Blueprint('order', __name__)

def populateAgents():
    agent_ids = [agent['agent_id'] for agent in collectionA.find({}, {'agent_id': 1})]
    return agent_ids

def generate_numeric_otp(length=6):
    return ''.join([str(randint(0, 9)) for _ in range(length)])

@order_bp.route('/order', methods=['POST'])
def setOrder():
    print(f"\n🟢 User initiated order request...")
    data = request.get_json()
    try:
        result = {"total_amount": data["total"], "order_date": date.today()}
        result["delivery_date"] = result["order_date"] + timedelta(days=randint(1, 15))
        result["order_date"] = datetime.combine(result["order_date"], datetime.min.time())
        result["delivery_date"] = datetime.combine(result["delivery_date"], datetime.min.time())
        result["order_id"] = str(uuid4())
        order_id = result["order_id"]
        result["user_id"] = load_user_context()["user_id"]
        agent_ids = populateAgents()
        if not agent_ids:
            return jsonify({"message": "No agents available"}), 503
        result["agent_id"] = agent_ids[randint(0, len(agent_ids) - 1)]

        collectionA.update_one({"agent_id": result["agent_id"]},{"$push": {"orders": order_id}})
        collectionU.update_one({"user_id": result["user_id"]},{"$push": {"orders": order_id}})
        result["status"] = choice(["Shipped", "Processing", "Out for Delivery"])
        result["payment_status"] = choice(["Paid", "Cash On Delivery"])

        encrypted_data = {"cart": data["cart"], "special_instructions": data["special_instructions"], "agent_notes": data["agent_notes"], "username": data["name"], "user_email": data["email"], "phone": data["phone"]}
        encrypted_data["OTP"] = generate_numeric_otp()
        encrypted_data["return_policy"] = str(randint(3, 30)) + " days return policy"
        encrypted_data["transaction_id"] = str(uuid4()) if result["payment_status"] == "Paid" else ""

    except Exception as e:
        return jsonify({"message": "Missing Fields", "error": str(e)}), 400
    try:
        print("Starting the encryption process...")
        cipher_payload = encrypt_dict(encrypted_data)
        result["qr-sensitive-data"] = cipher_payload
        collection.insert_one(result)
        print("Pushed data to the MongoDB Database...")
    except Exception as e:
        return jsonify({"message": "AES Implementation Failed", "error": str(e)}), 500
    return jsonify({"total_amount": result["total_amount"], "delivery_date": result["delivery_date"], "items": len(data["cart"]), "order_id": order_id}), 200

@order_bp.route('/getOrderQR', methods=['GET'])
def getOrderQR():
    print(f"\n🟢 User initiated get order request...")
    encoded_content = request.args.get('encodedContent')
    if not encoded_content: return jsonify({"error": "Missing encodedContent parameter"}), 400
    try:
        decoded_content = unquote(encoded_content)
        print(f"🔓 Decoded content: {decoded_content}")
        data = collection.find_one({"order_id": decoded_content}, {"qr-sensitive-data": 0, "_id": 0})
        userType = load_user_context()["userType"]
        if userType == "users": userDetails = collectionU.find_one({"user_id": data["user_id"]},{"password": 0, "_id": 0, "orders": 0})
        else :userDetails = collectionA.find_one({"agent_id": data["agent_id"]},{"password": 0, "_id": 0, "vehicle_number": 0, "orders": 0})
        qr_url = f"{BASE_URL}OrderData?order_id={decoded_content}&password=true"
        qr_image_b64 = generate_qr(qr_url)
        return jsonify({"data": data, "qr_image_b64": qr_image_b64, "userDetails": userDetails}), 200
    except Exception as e:
        print("❌ Error while processing order:", str(e))
        return jsonify({"error": "Server error occurred"}), 500

@order_bp.route('/getOrderData', methods=['POST'])
def get_order_data():
    req_json = request.get_json(silent=True) or {}
    order_id = req_json.get("order_id")
    password = req_json.get("password")
    if not order_id or not password: return jsonify({"error": "order_id and password required"}), 400
    data = collection.find_one({"order_id": order_id},{"_id": 0})
    if not data: return jsonify({"error": "Order not found"}), 404

    user_entry = collectionU.find_one({"user_id": data["user_id"]}, {"password": 1})
    agent_entry = collectionA.find_one({"agent_id": data["agent_id"]}, {"password": 1})

    if user_entry and check_password_hash(user_entry["password"] , password):
        userType = "users"
        userDetails = collectionU.find_one({"user_id": data["user_id"]}, {"password": 0, "_id": 0, "orders": 0})
    elif agent_entry and check_password_hash(agent_entry["password"] , password):
        userType = "agents"
        userDetails = collectionA.find_one({"agent_id": data["agent_id"]},{"password": 0, "_id": 0, "vehicle_number": 0, "orders": 0})
    else: return jsonify({"error": "Invalid password"}), 401
    encryptedData = data["qr-sensitive-data"]
    decryptedData = decrypt_dict(encryptedData)
    del data["qr-sensitive-data"]
    decryptedData["userType"] = userType
    return jsonify({"data": data, "sensitive_data": decryptedData, "userDetails": userDetails}), 200

@order_bp.route('/getOrder', methods=['GET'])
def getOrder():
    print(f"\n🟢 User initiated get order request...")
    try:
        user_context = load_user_context()
        userType = user_context["userType"]
        user_id = user_context["user_id"]
        if userType == "users": userDetails = collection.find({"user_id": user_id}, {"_id": 0, "payment_status": 0, "qr-sensitive-data": 0, "agent_id": 0, "user_id": 0})
        else: userDetails = collection.find({"agent_id": user_id},{"_id": 0, "payment_status": 0, "qr-sensitive-data": 0, "agent_id": 0, "user_id": 0})
        userDetails = list(userDetails)
        userDetails = list(reversed(userDetails))
        return jsonify({"orderDetails": userDetails}), 200
    except Exception as e:
        print("❌ Error while processing order:", str(e))
        return jsonify({"error": "Server error occurred"}), 500