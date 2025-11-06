from fastapi import APIRouter, Request, UploadFile, Form, File
from fastapi.responses import JSONResponse
from typing import List, Optional
from backend.config import db, logger
from backend.JWT import get_current_user
import cloudinary.uploader, cloudinary.api
import json

collection = db["product_list"]
seller_collection = db["sellers"]
seller_product_router = APIRouter()

@seller_product_router.get('/seller_products_list')
async def seller_products_list(request: Request):
    payload = get_current_user(request)
    seller_id = payload.get("user_id")
    try:
        if not seller_id: return JSONResponse(content={"message": "seller_id required"}, status_code=400)
        seller = await seller_collection.find_one({"user_id": seller_id}, {"products": 1, "_id": 0})
        product_ids = seller.get("products", [])
        cursor = collection.find({"product_id": {"$in": product_ids}}, {"_id": 0, "product_id": 1, "name": 1, "category": 1, "price": 1, "images": 1})
        products = await cursor.to_list(length=None)
        for product in products:
            product["id"] = product.pop("product_id", None)
            if "images" in product and isinstance(product["images"], list) and product["images"]:
                product["image"] = str(product["images"][0])
                del product["images"]
        return JSONResponse(content={"products": products}, status_code=200)
    except Exception as e:
        logger.error(f"❌ Error fetching seller products: {e}")
        return JSONResponse(content={"message": "Fetching Error", "error": str(e)}, status_code=500)

@seller_product_router.post("/add_product")
async def add_product(request: Request, name: str = Form(...), price: float = Form(...), category: str = Form(...), description: str = Form(...), variants: str = Form(...), tags: Optional[str] = Form(None), images: Optional[List[UploadFile]] = File(None), image_links = Form(...)):
    try:
        payload = get_current_user(request)
        seller_id = payload.get("user_id")
        if not seller_id: return JSONResponse(content={"message": "Unauthorized"}, status_code=401)
        variants_data = json.loads(variants)
        tags_data = json.loads(tags) if tags else []
        image_urls = []
        if images:
            for img in images:
                upload_result = cloudinary.uploader.upload(img.file, folder="HunarBaazar_Products", resource_type="image")
                image_urls.append(upload_result["secure_url"])
        for urls in image_urls: image_urls.append(urls)
        last_product = await collection.find_one(sort=[("product_id", -1)])
        new_product_id = (last_product["product_id"] + 1) if last_product else 1
        new_product = {"product_id": new_product_id, "name": name, "price": price, "category": category, "description": description, "variants": variants_data, "tags": tags_data, "images": image_urls, "seller_id": seller_id }

        await collection.insert_one(new_product)
        update_result = await seller_collection.update_one({"user_id": seller_id}, {"$addToSet": {"products": new_product_id}})

        return JSONResponse(content={"message": "Product added successfully", "product_id": new_product_id, "updated_seller": update_result.modified_count}, status_code=201)

    except Exception as e:
        logger.exception("Error adding new product")
        return JSONResponse(content={"message": "Add Product Error", "error": str(e)}, status_code=500)