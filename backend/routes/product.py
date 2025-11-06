from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from backend.config import db, logger

collection = db["product_list"]
seller_collection = db["seller_list"]
product_router = APIRouter()

@product_router.get('/product_list')
async def product_list():
    try:
        cursor = collection.find({}, {"_id": 0, "product_id": 1, "name": 1, "category": 1, "price": 1, "images": 1})
        products = await cursor.to_list(length=None)
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
        return JSONResponse(content={"categories": categories}, status_code=200)
    except Exception as e:
        logger.error(f"Error fetching categories: {e}")
        return JSONResponse(content={"message": "Fetching Error", "error": str(e)}, status_code=500)

@product_router.get("/product")
async def get_productDetails(request: Request):
    params = request.query_params
    product_id = params.get("product_id")
    limit = int(params.get("limit", 20))
    if not product_id: return JSONResponse(content={"error": "product_id required"}, status_code=400)
    try:
        product_id = int(product_id)
        product = await collection.find_one({"product_id": product_id}, {"_id": 0, "tags": 0})
        if not product: return JSONResponse(content={"error": "Product not found"}, status_code=404)
        if "rating" in product and product["rating"] is not None:
            try: product["rating"] = float(product["rating"].to_decimal())
            except Exception: product["rating"] = float(product["rating"])

        all_reviews = product.get("reviews", [])
        total_reviews = len(all_reviews)
        product["reviews"] = all_reviews[:limit]
        product["reviewCount"] = total_reviews
        product["reviewsLimitedTo"] = limit
        return JSONResponse(content=product, status_code=200)
    except Exception as e:
        print("Error fetching product details:", e)
        return JSONResponse(content={"error": "Invalid product_id or server error"}, status_code=500)