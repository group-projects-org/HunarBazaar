import os
from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from backend.config import mongo_client
from backend.routes.user_state import user_route
from backend.routes.order import order_router
from backend.routes.OTPs import otp_router
from backend.routes.product import product_router
BASE_URI = os.getenv("BASE_URI")

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🛑 Application starting up")
    yield # Runs app here
    print("🛑 Application shutting down")
    mongo_client.close()

app = FastAPI(title="HunarBazar: E-Commerce", lifespan=lifespan)
app.include_router(order_router, prefix="/api", tags=["Order Management"])
app.include_router(otp_router, prefix="/api", tags=["OTP Management"])
app.include_router(product_router, prefix="/api", tags=["Product Management"])
app.include_router(user_route, prefix="/api", tags=["User State Management"])

app.add_middleware(CORSMiddleware, allow_origins=[BASE_URI], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.get("/api")
async def root():
    return {
        "message": "HunarBazar Backend API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "prefix": '/api',
            "orders": ['/order', '/getOrderData', '/getOrder', '/getOrderQR'],
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)