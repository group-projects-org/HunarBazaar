#Root Directory in System Path
import sys, os
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../'))
if root_path not in sys.path:
    sys.path.append(root_path)

import pymongo
from flask import Blueprint, jsonify, request

mongo_uri = os.getenv("MONGO_URI")
if not mongo_uri: raise ValueError("MONGO_URI not set in environment variables")
mongo_client = pymongo.MongoClient(mongo_uri)
db = mongo_client["Secure-Delivery-Data"]
collection = db["product_list"]

product_bp = Blueprint('product', __name__)

@product_bp.route('/product_list', methods=['GET'])
def product_list():
    try:
        products = list(collection.find({}, {"_id": 0}))
        for product in products:
            if "product_id" in product:
                product["id"] = product["product_id"]
                del product["product_id"]
            if "images" in product and isinstance(product["images"], list) and len(product["images"]) > 0:
                product["image"] = str(product["images"][0])
                del product["images"]
        return jsonify({"products": products}), 200
    except Exception as e:
        return jsonify({"message": "Fetching Error", "error": str(e)}), 404

@product_bp.route('/get_categories', methods=['GET'])
def get_categories():
    try:
        categories = collection.distinct("category")
        categories.sort()
        return jsonify({"categories": categories}), 200
    except Exception as e:
        return jsonify({"message": "Fetching Error", "error": str(e)}), 500

@product_bp.route('/seller_products_list', methods=['GET'])
def seller_products_list():
    try:
        seller_id = request.args.get('seller_id')
        products = list(collection.find({"seller_id": seller_id}, {"_id": 0}))
        for product in products:
            if "product_id" in product:
                product["id"] = product["product_id"]
                del product["product_id"]
            if "images" in product and isinstance(product["images"], list) and len(product["images"]) > 0:
                product["image"] = str(product["images"][0])
                del product["images"]
        return jsonify({"products": products}), 200
    except Exception as e:
        return jsonify({"message": "Fetching Error", "error": str(e)}), 404