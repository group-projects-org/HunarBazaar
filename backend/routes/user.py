from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from backend.config import db, logger
from backend.JWT import get_current_user
from werkzeug.security import generate_password_hash

user_data_route = APIRouter()

@user_data_route.post("/get_email")
async def getUserData(request: Request):
    data = await request.json()
    username = data.get("username")
    user_type = data.get("userType")
    if not username or not user_type:
        raise HTTPException(status_code=401, detail="Invalid or missing JWT payload")
    if user_type not in ("users", "sellers", "agents"):
        raise HTTPException(status_code=400, detail="Invalid userType")
    user_data = await db[user_type].find_one({"username": username}, {"_id": 0, "email": 1})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    return {"email": user_data["email"]}

@user_data_route.get("/userData")
async def getUserData(request: Request):
    try:
        payload = get_current_user(request)
        user_id = payload.get("user_id")
        user_type = payload.get("userType")
        if not user_id or not user_type:
            raise HTTPException(status_code=401, detail="Invalid or missing JWT payload")
        if user_type == "users" or user_type == "sellers":
            user_data = await db[user_type].find_one({"user_id": user_id}, {"_id": 0, "password": 0})
        elif user_type == "agents":
            user_data = await db["agents"].find_one({"agent_id": user_id}, {"_id": 0, "password": 0})
        else:
            raise HTTPException(status_code=400, detail="Invalid userType")
        if not user_data: raise HTTPException(status_code=404, detail="User not found")
        return JSONResponse(content={"success": True, "data": user_data})
    except Exception as e:
        logger.error(f"❌ Error fetching user data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@user_data_route.post("/subscribe")
async def subscriptionChanges(request: Request):
    try:
        payload = get_current_user(request)
        user_id = payload.get("user_id")
        user_type = payload.get("userType")
        data = await request.json()
        subscribed = data.get("subscribed", False)
        if user_type == "users" or user_type == "sellers":
            result = await db[user_type].update_one({"user_id": user_id},{"$set": {"subscribed": not subscribed}})
        elif user_type == "agents":
            result = await db["agents"].update_one({"agent_id": user_id},{"$set": {"subscribed": not subscribed}})
        else: raise HTTPException(status_code=400, detail="Invalid userType")
        if result.modified_count: return JSONResponse(content={"success": True, "message": "Subscription updated"})
        return JSONResponse(content={"success": False, "message": "No changes made"})
    except Exception as e:
        logger.error(f"❌ Subscription update error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@user_data_route.post("/reset_password")
async def reset_password(request: Request):
    data = await request.json()
    username = data.get("username")
    user_type = data.get("userType")
    new_password = data.get("newPassword")
    if not all([username, user_type, new_password]):
        raise HTTPException(status_code=400, detail="Missing required fields")
    hashed_password = generate_password_hash(new_password)
    result = await db[user_type].update_one({"username": username}, {"$set": {"password": hashed_password}})
    if result.matched_count == 0: raise HTTPException(status_code=404, detail="User not found")
    return JSONResponse(content={"message": "Password reset successful"}, status_code=200)