import uuid
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr

from backend.JWT import get_current_user
from backend.config import db, logger
from werkzeug.security import generate_password_hash, check_password_hash

from jose import jwt
from datetime import datetime, timedelta
from backend.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

user_route = APIRouter()

@user_route.post("/check-username")
async def check_username(request: Request):
    try:
        data = await request.json()
        username = data.get("username")
        userType = data.get("userType")
        if not username or not userType: return JSONResponse({"error": "Missing username or userType"}, status_code=400)
        collection = db[userType]
        existing_user = await collection.find_one({"username": username})
        if existing_user: return {"available": False}
        else: return {"available": True}
    except Exception as e:
        print("Error checking username:", e)
        return JSONResponse({"error": "Server error"}, status_code=500)

@user_route.get("/verify-token")
def verify_token(request: Request):
    token = request.cookies.get("access_token")
    if not token: return JSONResponse(status_code=401, content={"message": "Token missing"})
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        username = payload["username"]
        user_type = payload["userType"]
        return JSONResponse(content={"valid": True, "username": username, "userType": user_type})
    except jwt.ExpiredSignatureError:
        return JSONResponse(status_code=401, content={"message": "Token expired"})
    except:
        return JSONResponse(status_code=401, content={"message": "Invalid token"})

@user_route.post('/login')
async def login(request: Request):
    data = await request.json()
    username = data.get("username")
    userType = data.get("userType")
    password = data.get("password")

    if not username or not password or not userType:
        return JSONResponse(content={'error': 'Missing required fields'}, status_code=400)

    collection = db[userType]
    document = await collection.find_one({"username": username})
    if not document:
        return JSONResponse(content={"error": "User Not Found"}, status_code=401)
    if not check_password_hash(document.get("password"), password):
        return JSONResponse(content={"error": "Password is Incorrect"}, status_code=401)

    id_key = "user_id" if userType in ["users", "sellers"] else "agent_id"
    user_id = document.get(id_key)

    token_data = {"user_id": user_id, "username": document["username"], "email": document["email"], "phone": document["phone"], "userType": userType, }
    access_token = create_access_token(data=token_data)
    response = JSONResponse(content={"message": "Login successful", "username": document["username"], "cart": document.get("cart", [])})
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, samesite="None")
    return response

class UserDetails(BaseModel):
    username: str
    email: EmailStr
    phone: str
    password: str
    userType: str

@user_route.post("/register")
async def register(user: UserDetails):
    username = user.username
    email = user.email
    phone = user.phone
    userType = user.userType

    if userType not in ["users", "sellers"]: raise HTTPException(status_code=400, detail="Invalid userType")
    collection = db[userType]
    existing_user = await collection.find_one({"$or": [{"username": username}, {"email": email}, {"phone": phone}]})

    if existing_user:
        logger.error("❌ User already exists with the same username, email, or phone")
        raise HTTPException(status_code=409, detail="User already exists")

    user_data = user.dict()
    user_data["user_id"] = str(uuid.uuid4())
    user_data["password"] = generate_password_hash(user_data["password"])
    user_data.pop("userType", None)

    await collection.insert_one(user_data)
    return JSONResponse(content={"message": "Registration Successful"}, status_code=200)

@user_route.post("/logout")
async def logout(request: Request):
    try:
        data = await request.json()
        payload = get_current_user(request)
        user_id = payload.get("user_id")
        user_type = payload.get("userType")
        cart = data.get("cart", [])
        collection = db[user_type]
        if user_type == "users": await collection.update_one({"user_id": user_id}, {"$set": {"cart": cart}})
        else: await collection.update_one({"agent_id": user_id}, {"$set": {"cart": cart}})

        response = JSONResponse(content={"message": "Logout successful"})
        response.delete_cookie(key="access_token", httponly=True, secure=True, samesite="None", path="/")
        return response
    except Exception as e:
        print("Logout error:", e)
        return JSONResponse(status_code=500, content={"error": str(e)})