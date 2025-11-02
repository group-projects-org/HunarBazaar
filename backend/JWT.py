from jose import jwt, JWTError
from fastapi import Request, HTTPException
from backend.config import SECRET_KEY, ALGORITHM
from backend.config import logger

def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        logger.info("No JWT Token in frontend")
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")