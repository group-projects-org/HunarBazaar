import os
from uuid import uuid4
from random import randint, choice
from datetime import date, timedelta, datetime
from urllib.parse import unquote
from typing import Optional, List, Dict, Any
from backend.JWT import get_current_user

from fastapi import APIRouter, HTTPException, Request, Body
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel
from werkzeug.security import check_password_hash

from backend.config import db, logger
from backend.Encryption import encrypt_dict, decrypt_dict, generate_qr

BASE_URL = os.getenv("BASE_URI", "http://127.0.0.1:8000/")
collection_orders = db["orders"]
collection_agents = db["agents"]
collection_users = db["users"]

order_router = APIRouter()

async def populate_agents() -> List[str]:
    try:
        agent_ids = [agent['agent_id'] async for agent in collection_agents.find({}, {'agent_id': 1})]
        return agent_ids
    except Exception as e:
        logger.error(f"Error fetching agents: {e}")
        return []

def generate_numeric_otp(length: int = 6) -> str:
    return ''.join(str(randint(0, 9)) for _ in range(length))


class OrderRequest(BaseModel):
    total: float
    cart: List[Dict[str, Any]]
    special_instructions: Optional[str] = None
    agent_notes: Optional[str] = None
    name: str
    email: str
    phone: str

@order_router.post("/order")
async def set_order(request: Request, data: OrderRequest):
    payload = get_current_user(request)
    user_id = payload.get("user_id")

    try:
        result = {
            "total_amount": data.total,
            "order_date": datetime.combine(date.today(), datetime.min.time()),
            "delivery_date": datetime.combine(date.today() + timedelta(days=randint(1, 15)), datetime.min.time()),
            "order_id": str(uuid4()),
            "user_id": user_id,
        }
        agent_ids = await populate_agents()
        if not agent_ids: raise HTTPException(status_code=503, detail="No delivery agents available")
        result["agent_id"] = choice(agent_ids)
        result["status"] = choice(["Shipped", "Processing", "Out for Delivery"])
        result["payment_status"] = choice(["Paid", "Cash On Delivery"])

        await collection_agents.update_one({"agent_id": result["agent_id"]}, {"$push": {"orders": result["order_id"]}})
        await collection_users.update_one({"user_id": user_id}, {"$push": {"orders": result["order_id"]}})

        encrypted_data = {
            "cart": data.cart,
            "special_instructions": data.special_instructions,
            "agent_notes": data.agent_notes,
            "username": data.name,
            "user_email": data.email,
            "phone": data.phone,
            "OTP": generate_numeric_otp(),
            "return_policy": f"{randint(3, 30)} days return policy",
            "transaction_id": str(uuid4()) if result["payment_status"] == "Paid" else "",
        }
        cipher_payload = await run_in_threadpool(encrypt_dict, encrypted_data)
        result["qr_sensitive_data"] = cipher_payload
        await collection_orders.insert_one(result)
        return {
            "total_amount": result["total_amount"],
            "delivery_date": result["delivery_date"],
            "items": len(data.cart),
            "order_id": result["order_id"],
        }
    except HTTPException: raise
    except Exception as e:
        logger.error(f"❌ Error while creating order: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@order_router.get("/getOrderQR")
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
            user_details = await collection_users.find_one({"user_id": data["user_id"]}, {"password": 0, "_id": 0, "orders": 0})
        else:
            user_details = await collection_agents.find_one({"agent_id": data["agent_id"]}, {"password": 0, "_id": 0, "vehicle_number": 0, "orders": 0})
        qr_url = f"{BASE_URL}OrderData?order_id={decoded_order_id}&password=true"
        qr_image_b64 = await run_in_threadpool(generate_qr, qr_url)
        return {"data": data, "qr_image_b64": qr_image_b64, "userDetails": user_details}
    except Exception as e:
        logger.error(f"❌ Error while processing order QR: {e}")
        raise HTTPException(status_code=500, detail="Server error occurred")

@order_router.post("/getOrderData")
async def get_order_data(req_json: dict = Body(...)):
    order_id = req_json.get("order_id")
    password = req_json.get("password")
    if not order_id or not password: raise HTTPException(status_code=400, detail="order_id and password required")
    try:
        data = await collection_orders.find_one({"order_id": order_id}, {"_id": 0})
        if not data: raise HTTPException(status_code=404, detail="Order not found")
        user_entry = await collection_users.find_one({"user_id": data["user_id"]}, {"password": 1})
        agent_entry = await collection_agents.find_one({"agent_id": data["agent_id"]}, {"password": 1})

        if user_entry and await run_in_threadpool(check_password_hash, user_entry["password"], password):
            user_type = "users"
            user_details = await collection_users.find_one({"user_id": data["user_id"]}, {"password": 0, "_id": 0, "orders": 0})
        elif agent_entry and await run_in_threadpool(check_password_hash, agent_entry["password"], password):
            user_type = "agents"
            user_details = await collection_agents.find_one({"agent_id": data["agent_id"]}, {"password": 0, "_id": 0, "vehicle_number": 0, "orders": 0})
        else: raise HTTPException(status_code=401, detail="Invalid password")

        encrypted_data = data["qr_sensitive_data"]
        decrypted_data = await run_in_threadpool(decrypt_dict, encrypted_data)
        del data["qr_sensitive_data"]
        decrypted_data["userType"] = user_type
        return {"data": data, "sensitive_data": decrypted_data, "userDetails": user_details}
    except HTTPException: raise
    except Exception as e:
        logger.error(f"❌ Error while decrypting order: {e}")
        raise HTTPException(status_code=500, detail="Server error occurred")

@order_router.get("/getOrder")
async def get_order(request: Request):
    logger.info("🟢 User initiated get order list request...")
    payload = get_current_user(request)
    user_id = payload.get("user_id")
    user_type = payload.get("userType")

    query_field = "user_id" if user_type == "users" else "agent_id"
    cursor = collection_orders.find({query_field: user_id}, {"_id": 0, "payment_status": 0, "qr_sensitive_data": 0, "agent_id": 0, "user_id": 0})
    orders = await cursor.to_list(length=None)
    orders.reverse()
    return {"orderDetails": orders}