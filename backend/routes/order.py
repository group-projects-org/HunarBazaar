import os
from uuid import uuid4
from random import randint, choice, random
from datetime import date, timedelta, datetime
from typing import Optional, List, Dict, Any
from backend.JWT import get_current_user

from fastapi import APIRouter, HTTPException, Request
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel

from backend.config import db, logger
from backend.Encryption import encrypt_dict

BASE_URL = os.getenv("BASE_URI", "http://127.0.0.1:8000/")
collection_orders = db["orders"]
collection_agents = db["agents"]
collection_users = db["users"]
collection_sold_products = db["sold_products"]
collection_products = db["product_list"]

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

    if not data.cart or not isinstance(data.cart, list):
        raise HTTPException(status_code=400, detail="Cart is required and must be a list.")
    for idx, p in enumerate(data.cart):
        p["quantity"] = p.get("quantity") or p.get("orderQty")
        p["size"] = p.get("size") or p.get("orderSize")
        p["color"] = p.get("color") or p.get("orderColor")
        product_id = p.get("product_id") or p.get("id")
        if not product_id: raise HTTPException(status_code=400, detail=f"Cart item at index {idx} missing product_id.")
        if not p.get("quantity") or not isinstance(p.get("quantity"), int):
            raise HTTPException(status_code=400, detail=f"Cart item {product_id} missing integer quantity.")
        if p.get("price") is None: raise HTTPException(status_code=400, detail=f"Cart item {product_id} missing price.")

    try:
        order_date = datetime.combine(date.today(), datetime.min.time())
        delivery_date = datetime.combine(date.today() + timedelta(days=randint(1, 15)), datetime.min.time())
        order_id = str(uuid4())
        base_order = {
            "total_amount": data.total,
            "order_date": order_date,
            "delivery_date": delivery_date,
            "order_id": order_id,
            "user_id": user_id,
            "images": [p.get("image") for p in data.cart],
            "HunarPoints": int((random() ** 2) * 500) + 1,
        }

        agents = await populate_agents(data.location)
        if not agents:
            raise HTTPException(status_code=503, detail="No delivery agents available")
        agent = choice(agents)
        base_order.update({
            "agent_id": agent["agent_id"],
            "agent_name": agent.get("username", ""),
            "payment_status": choice(["Paid", "Cash On Delivery"]),
        })

        # sensitive payload
        encrypted_plain = {
            "cart": data.cart,
            "address": data.address,
            "pincode": data.pincode,
            "location": data.location,
            "special_instructions": data.special_instructions,
            "agent_notes": data.agent_notes,
            "OTP": generate_numeric_otp(),
            "return_policy": f"{randint(3, 30)} days return policy",
            "transaction_id": str(uuid4()) if base_order["payment_status"] == "Paid" else "",
            "userType": payload.get("userType")
        }
        cipher_payload = await run_in_threadpool(encrypt_dict, encrypted_plain)
        base_order["qr_sensitive_data"] = cipher_payload

        client = collection_orders.database.client
        async with await client.start_session() as session:
            async with session.start_transaction():
                await collection_orders.insert_one(base_order, session=session)
                year_str = str(order_date.year)

                a_upd = await collection_agents.update_one({"agent_id": base_order["agent_id"]},{"$push": {f"orders.{year_str}": order_id}}, session=session)
                u_upd = await collection_users.update_one({"user_id": user_id}, {"$push": {f"orders.{year_str}": order_id}, "$inc": {"HunarPoints": base_order["HunarPoints"]}}, session=session)
                if a_upd.matched_count == 0: raise HTTPException(status_code=500, detail="Assigned agent not found during update.")
                if u_upd.matched_count == 0: raise HTTPException(status_code=500, detail="User not found during update.")

                for p in data.cart:
                    product_id = p.get("product_id") or p.get("id")
                    size = p.get("size")
                    color = p.get("color")
                    qty = int(p.get("quantity", 0))
                    price = float(p.get("price", 0))

                    array_filters = [{"s.size": size}] if size else None
                    inc_path = f"variants.$[s].options.{color}" if color else None
                    if inc_path:
                        update_kwargs = {"session": session}
                        if array_filters:
                            await collection_products.update_one({"product_id": product_id}, {"$inc": {inc_path: -qty}}, array_filters=array_filters, session=session)
                        else:
                            await collection_products.update_one({"product_id": product_id}, {"$inc": {inc_path: -qty}}, session=session)

                    revenue_add = price * qty
                    await collection_sold_products.update_one({"product_id": product_id},{
                        "$inc": {
                            f"quantity_sold.{year_str}": qty,
                            f"no_of_orders.{year_str}": qty,
                            f"revenue.{year_str}": revenue_add,
                            f"district.{year_str}.{data.location}": qty
                        }, "$setOnInsert": {"product_id": product_id}},
                    upsert=True, session=session)

                    sold = await collection_sold_products.find_one({"product_id": product_id}, session=session)
                    old_qty = int(sold.get("no_of_orders", {}).get(year_str, 0))
                    old_avg = float(sold.get("average_selling_price", {}).get(year_str, price))
                    if old_qty == 0: new_avg = price
                    else: new_avg = ((old_avg * old_qty) + (price * qty)) / (old_qty + qty)
                    await collection_sold_products.update_one({"product_id": product_id}, {"$set": {f"average_selling_price.{year_str}": new_avg}}, session=session)

        return {
            "total_amount": base_order["total_amount"],
            "delivery_date": base_order["delivery_date"],
            "items": len(data.cart),
            "images": base_order["images"],
            "order_id": order_id,
            "HunarPoints": base_order["HunarPoints"]
        }

    except HTTPException: raise
    except Exception as e:
        logger.error(f"❌ Error while creating order: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@order_router.get("/getOrder")
async def get_order(request: Request):
    try:
        payload = get_current_user(request)
        user_id = payload.get("user_id")
        user_type = payload.get("userType")
        if not user_id or not user_type: raise HTTPException(status_code=400, detail="Missing user information in token")
        collection = collection_users if user_type == "users" else collection_agents

        year_str = str(datetime.combine(date.today(), datetime.min.time()).year)
        user_doc = await collection.find_one({"user_id" if user_type == "users" else "agent_id": user_id}, {"_id": 0, f"orders.{year_str}": 1})
        if not user_doc or "orders" not in user_doc or year_str not in user_doc["orders"]: return {"orderDetails": []}

        order_ids = user_doc["orders"][year_str]
        if not order_ids: return {"orderDetails": []}
        cursor = collection_orders.find({"order_id": {"$in": order_ids}}, {"_id": 0, "order_id": 1, "order_date": 1, "delivery_date": 1, "images": 1, "total_amount": 1})
        orders = await cursor.to_list(length=None)
        orders.sort(key=lambda x: x.get("order_date", ""), reverse=True)
        return {"orderDetails": orders}

    except HTTPException as e:
        logger.error(f"❌ HTTPException during get_order: {e.detail}")
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching order list: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")