from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from backend.config import db, logger

collection = db["product_list"]
product_router = APIRouter()

@product_router.get('/product_list')
async def product_list():
    try:
        products = await collection.find({}, {"_id": 0}).to_list(length=None)
        for product in products:
            if "product_id" in product:
                product["id"] = product.pop("product_id")
            if "images" in product and isinstance(product["images"], list) and product["images"]:
                product["image"] = str(product["images"][0])
                del product["images"]
        return JSONResponse(content={"products": products}, status_code=200)
    except Exception as e:
        logger.error(f"Error fetching products: {e}")
        return JSONResponse(content={"message": "Fetching Error", "error": str(e)}, status_code=500)


@product_router.get('/get_categories')
async def get_categories():
    try:
        categories = await collection.distinct("category")
        categories.sort()
        logger.info(f"Categories fetched: {categories}")
        return JSONResponse(content={"categories": categories}, status_code=200)
    except Exception as e:
        logger.error(f"Error fetching categories: {e}")
        return JSONResponse(content={"message": "Fetching Error", "error": str(e)}, status_code=500)

@product_router.get('/seller_products_list')
async def seller_products_list(request: Request):
    try:
        seller_id = request.query_params.get('seller_id')
        if not seller_id: return JSONResponse(content={"message": "seller_id required"}, status_code=400)
        products = await collection.find({"seller_id": seller_id}, {"_id": 0}).to_list(length=None)
        for product in products:
            if "product_id" in product: product["id"] = product.pop("product_id")
            if "images" in product and isinstance(product["images"], list) and product["images"]:
                product["image"] = str(product["images"][0])
                del product["images"]
        return JSONResponse(content={"products": products}, status_code=200)
    except Exception as e:
        logger.error(f"Error fetching seller products: {e}")
        return JSONResponse(content={"message": "Fetching Error", "error": str(e)}, status_code=500)