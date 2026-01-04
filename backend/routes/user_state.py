import os, json, base64, urllib.parse
import uuid, requests
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse, RedirectResponse
from pydantic import BaseModel, EmailStr

from backend.JWT import get_current_user
from backend.config import db, logger
from werkzeug.security import generate_password_hash, check_password_hash

from jose import jwt
from datetime import datetime, timedelta, UTC
from backend.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.now(UTC) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

user_route = APIRouter()
GOOGLE_CLIENT_ID=os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET=os.getenv("GOOGLE_CLIENT_SECRET")
MY_URL=os.getenv("MY_URI")
BASE_URL=os.getenv("BASE_URI")

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

async def generate_unique_username(collection, base_username):
    username = base_username
    suffix = 1
    while await collection.find_one({"username": username}):
        username = f"{base_username}_{suffix}"
        suffix += 1
    return username

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

@user_route.post('/check_login')
async def check_login(request: Request):
    data = await request.json()
    username = data.get("username")
    userType = data.get("userType")
    password = data.get("password")
    if not username or not password or not userType:
        return JSONResponse(content={'error': 'Missing required fields'}, status_code=400)
    collection = db[userType]
    document = await collection.find_one({"username": username, "password": {"$ne": None}})
    if not document:
        return JSONResponse(content={"error": "User Not Found"}, status_code=401)
    if document["password"] is None:
        raise HTTPException(status_code=400, detail="This account uses Google Login")
    if not check_password_hash(document.get("password"), password):
        return JSONResponse(content={"error": "Password is Incorrect"}, status_code=401)
    id_key = "user_id" if userType in ["users", "sellers"] else "agent_id"
    user_id = document.get(id_key)
    TFA = document.get("TFA", False)
    if not TFA: return JSONResponse(content={"user_id": user_id, "TFA": TFA}, status_code=200)
    return JSONResponse(content={"user_id": user_id, "TFA": TFA, "email": document.get("email")}, status_code=200)

@user_route.post('/login')
async def login(request: Request):
    data = await request.json()
    user_id = data.get("user_id")
    userType = data.get("userType")
    collection = db[userType]
    id_key = "user_id" if userType in ["users", "sellers"] else "agent_id"
    document = await collection.find_one({id_key: user_id})

    user_id = document.get(id_key)
    token_data = {"user_id": user_id, "username": document["username"], "email": document["email"], "phone": document["phone"], "userType": userType}
    access_token = create_access_token(data=token_data)
    response = JSONResponse(content={"message": "Login successful", "username": document["username"], "cart": document.get("cart", [])})
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, samesite="None")
    return response

class UserDetails(BaseModel):
    username: str
    email: EmailStr
    password: str
    userType: str

@user_route.post("/register")
async def register(user: UserDetails):
    email = user.email
    userType = user.userType

    if userType not in ["users", "sellers"]: raise HTTPException(status_code=400, detail="Invalid userType")
    collection = db[userType]
    existing_user = await collection.find_one({"$or": [{"email": email}]})

    if existing_user:
        logger.error("❌ User already exists with the same email, or phone")
        raise HTTPException(status_code=409, detail="User already exists")

    user_data = user.dict()
    user_data["user_id"] = str(uuid.uuid4())
    user_data["password"] = generate_password_hash(user_data["password"])
    user_data["picture"] = "https://github.com/group-projects-org/HunarBazaar/blob/master/frontend/public/assets/User.jpg"
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

@user_route.get("/auth/google/callback")
async def google_callback(request: Request):
    state = request.query_params.get("state")
    if not state: raise HTTPException(400, "Missing state")
    state_json = urllib.parse.unquote(base64.b64decode(state).decode())
    state_data = json.loads(state_json)
    code = request.query_params.get("code")
    user_type = state_data["userType"]
    if not code: raise HTTPException(status_code=400, detail="Authorization code missing")

    collection = db[user_type]
    token_res = requests.post("https://oauth2.googleapis.com/token", data={"client_id": GOOGLE_CLIENT_ID, "client_secret": GOOGLE_CLIENT_SECRET, "code": code, "grant_type": "authorization_code", "redirect_uri": f"{MY_URL}/api/auth/google/callback"} ).json()
    access_token = token_res.get("access_token")
    if not access_token:raise HTTPException(status_code=400, detail="Failed to obtain access token")

    user_info = requests.get("https://www.googleapis.com/oauth2/v2/userinfo", headers={"Authorization": f"Bearer {access_token}"}
    ).json()
    email = user_info.get("email")
    google_id = user_info.get("id")
    picture = user_info.get("picture")
    if not email or not google_id: raise HTTPException(status_code=400, detail="Invalid Google user data")
    raw_username = user_info.get("name") or "user"
    username = await generate_unique_username(collection, raw_username)
    user = await collection.find_one({"email": email})

    if not user:
        user = {"user_id": str(uuid.uuid4()), "username": username, "email": email, "google_id": google_id, "password": None, "picture": picture}
        await collection.insert_one(user)
    elif user.get("password") is not None and not user.get("google_id"):
        update_fields = {"google_id": google_id}
        if not user.get("picture"): update_fields["picture"] = picture
        await collection.update_one({"email": email}, {"$set": update_fields})

    token_data = {"user_id": user["user_id"], "username": user["username"], "email": user["email"], "phone": user.get("phone"), "userType": user_type}

    access_token = create_access_token(data=token_data)
    response = RedirectResponse(url=f"{BASE_URL}/Login")
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, samesite="None")
    return response