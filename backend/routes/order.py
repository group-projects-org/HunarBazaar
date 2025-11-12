import os, time
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

async def populate_agents(location) -> List[Dict]:
    try:
        agent_cursor = collection_agents.find({'location': location}, {'_id': 0, 'agent_id': 1, 'username': 1})
        agents = [agent async for agent in agent_cursor]
        return agents
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
    address: str
    location: str
    pincode: int

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
        agents = await populate_agents(data.location)
        if not agents: raise HTTPException(status_code=503, detail="No delivery agents available")
        agent = choice(agents)
        result["agent_id"] = agent["agent_id"]
        result["agent_name"] = agent["username"]
        result["payment_status"] = choice(["Paid", "Cash On Delivery"])
        result["images"] = []
        for product in data.cart: result["images"].append(product["image"])

        await collection_agents.update_one({"agent_id": result["agent_id"]}, {"$push": {"orders": result["order_id"]}})
        await collection_users.update_one({"user_id": user_id}, {"$push": {"orders": result["order_id"]}})

        encrypted_data = {
            "cart": data.cart,
            "address": data.address,
            "pincode": data.pincode,
            "location": data.location,
            "special_instructions": data.special_instructions,
            "agent_notes": data.agent_notes,
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
            user_details = await collection_users.find_one({"user_id": data["user_id"]}, {"_id": 0, "email": 1, "phone": 1, "username": 1})
        else:
            user_details = await collection_agents.find_one({"agent_id": data["agent_id"]}, {"_id": 0, "username": 1, "email": 1, "phone": 1, "vehicle_number": 1})
        qr_url = f"{BASE_URL}OrderData?order_id={decoded_order_id}&password=true"
        qr_image_b64 = await run_in_threadpool(generate_qr, qr_url)
        return {"data": data, "qr_image_b64": qr_image_b64, ("userDetails" if user_type == "users" else "agentDetails"): user_details, "user_type": user_type}
    except Exception as e:
        logger.error(f"❌ Error while processing order QR: {e}")
        raise HTTPException(status_code=500, detail="Server error occurred")

@order_router.get("/getOrderData")
async def get_order_data(request: Request):
    order_id = request.query_params.get("order_id")
    password = request.query_params.get("password")
    if not order_id or not password: raise HTTPException(status_code=400, detail="order_id and password required")
    try:
        data = await collection_orders.find_one({"order_id": order_id}, {"_id": 0})
        if not data: raise HTTPException(status_code=404, detail="Order not found")
        user_entry = await collection_users.find_one({"user_id": data["user_id"]}, {"_id": 0, "password": 1, "email": 1, "phone": 1, "username": 1})
        agent_entry = await collection_agents.find_one({"agent_id": data["agent_id"]}, {"_id": 0, "password": 1, "username": 1, "email": 1, "phone": 1, "vehicle_number": 1})

        if user_entry and await run_in_threadpool(check_password_hash, user_entry["password"], password): user_type = "users"
        elif agent_entry and await run_in_threadpool(check_password_hash, agent_entry["password"], password):
            user_type = "agents"
        else: raise HTTPException(status_code=401, detail="Invalid password")

        del user_entry["password"]
        del agent_entry["password"]
        encrypted_data = data["qr_sensitive_data"]
        decrypted_data = await run_in_threadpool(decrypt_dict, encrypted_data)
        del data["qr_sensitive_data"]
        decrypted_data["userType"] = user_type
        return {"data": data, "sensitive_data": decrypted_data, "userDetails": user_entry, "agentDetails": agent_entry, "user_type": user_type}
    except HTTPException: raise
    except Exception as e:
        logger.error(f"❌ Error while decrypting order: {e}")
        raise HTTPException(status_code=500, detail="Server error occurred")

@order_router.get("/getOrder")
async def get_order(request: Request):
    try:
        payload = get_current_user(request)
        user_id = payload.get("user_id")
        user_type = payload.get("userType")
        if not user_id or not user_type: raise HTTPException(status_code=400, detail="Missing user information in token")
        collection = collection_users if user_type == "users" else collection_agents

        user_doc = await collection.find_one({"user_id" if user_type == "users" else "agent_id": user_id}, {"_id": 0, "orders": 1})
        if not user_doc or not user_doc.get("orders"):
            logger.info(f"No orders found for {user_type} {user_id}")
            return {"orderDetails": []}

        order_ids = user_doc["orders"]
        cursor = collection_orders.find({"order_id": {"$in": order_ids}}, {"_id": 0, "order_date": 1, "delivery_date": 1, "images": 1, "total_amount": 1})
        orders = await cursor.to_list(length=None)
        orders.sort(key=lambda x: x.get("order_date", ""), reverse=True)
        return {"orderDetails": orders}

    except HTTPException as e:
        logger.error(f"❌ HTTPException during get_order: {e.detail}")
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching order list: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")