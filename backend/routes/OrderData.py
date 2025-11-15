import os
from urllib.parse import unquote
from backend.JWT import get_current_user
from fastapi import APIRouter, HTTPException, Request
from fastapi.concurrency import run_in_threadpool
from backend.config import db, logger
from backend.Encryption import encrypt_dict, decrypt_dict, generate_qr

BASE_URL = os.getenv("BASE_URI", "http://127.0.0.1:8000/")
collection_orders = db["orders"]
collection_agents = db["agents"]
collection_users = db["users"]

order_data_router = APIRouter()

@order_data_router.get("/getOrderQR")
async def get_order_qr(request: Request):
    order_id = request.query_params.get("order_id")
    payload = get_current_user(request)
    user_type = payload.get("userType")

    if not order_id: raise HTTPException(status_code=400, detail="Missing order_id parameter")
    try:
        decoded_order_id = unquote(order_id)
        data = await collection_orders.find_one({"order_id": decoded_order_id}, {"qr_sensitive_data": 0, "_id": 0})
        if not data: raise HTTPException(status_code=404, detail="Order not found")
        if user_type == "users":
            user_details = await collection_users.find_one({"user_id": data["user_id"]}, {"_id": 0, "email": 1, "phone": 1, "username": 1})
        else:
            user_details = await collection_agents.find_one({"agent_id": data["agent_id"]}, {"_id": 0, "username": 1, "email": 1, "phone": 1, "vehicle_number": 1})
        qr_url = f"{BASE_URL}/OrderData?order_id={decoded_order_id}&password=true"
        qr_image_b64 = await run_in_threadpool(generate_qr, qr_url)
        return {"data": data, "qr_image_b64": qr_image_b64, ("userDetails" if user_type == "users" else "agentDetails"): user_details, "user_type": user_type}
    except Exception as e:
        logger.error(f"❌ Error while processing order QR: {e}")
        raise HTTPException(status_code=500, detail="Server error occurred")

@order_data_router.get("/getOrderData")
async def get_order_data(request: Request):
    order_id = request.query_params.get("order_id")
    payload = get_current_user(request)
    user_id = payload.get("user_id")
    user_type = payload.get("userType")
    if not order_id: raise HTTPException(status_code=400, detail="Order_id required")
    try:
        data = await collection_orders.find_one({"order_id": order_id}, {"_id": 0})
        if not data: raise HTTPException(status_code=404, detail="Order not found")
        user_entry = await collection_users.find_one({"user_id": data["user_id"]}, {"_id": 0, "email": 1, "phone": 1, "username": 1})
        agent_entry = await collection_agents.find_one({"agent_id": data["agent_id"]}, {"_id": 0, "username": 1, "email": 1, "phone": 1, "vehicle_number": 1})

        found = True
        if user_type == "users" and user_id != data["user_id"]: found = False
        if user_type == "agents" and user_id != data["agent_id"]: found = False
        if user_type == "sellers": found = False

        if not found: raise HTTPException(status_code=401, detail="Incorrect User Credentials")
        encrypted_data = data["qr_sensitive_data"]
        decrypted_data = await run_in_threadpool(decrypt_dict, encrypted_data)
        del data["qr_sensitive_data"]
        decrypted_data["userType"] = user_type
        return {"data": data, "sensitive_data": decrypted_data, "userDetails": user_entry, "agentDetails": agent_entry, "user_type": user_type}
    except HTTPException: raise
    except Exception as e:
        logger.error(f"❌ Error while decrypting order: {e}")
        raise HTTPException(status_code=500, detail="Server error occurred")