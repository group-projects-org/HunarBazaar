#Root Directory in System Path
import sys, os
from logging import exception

root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../'))
if root_path not in sys.path:
    sys.path.append(root_path)

import pymongo
from collections import defaultdict
from flask import Blueprint, jsonify, request
from backend.Encryption import decrypt_dict

mongo_uri = os.getenv("MONGO_URI")
if not mongo_uri: raise ValueError("MONGO_URI not set in environment variables")
mongo_client = pymongo.MongoClient(mongo_uri)
db = mongo_client["Secure-Delivery-Data"]

suggestion_bp = Blueprint('suggestion_bp', __name__)

@suggestion_bp.route('/suggestions', methods=['GET'])
def get_suggestions():
    try:
        user_id = request.args.get('user_id')
        cart = request.args.get('cart')
        orders_cursor = db["orders"].find( {"user_id": user_id},{"qr-sensitive-data": 1, "_id": 0})
        orders = [items for order in orders_cursor for items in decrypt_dict(order["qr-sensitive-data"])["cart"]]
        orders.append(cart)
        if not orders: return jsonify({"suggestions": []}), 200

        purchased_products = set()
        tag_counts = defaultdict(int)
        for item in orders:
            product_id = item.get("product").get("id")
            if product_id:
                purchased_products.add(str(product_id))
                product = db["product_list"].find_one({"product_id": product_id}, {"_id": 0, "tags": 1})
                for tag in product["tags"]: tag_counts[tag] += 1
        if not purchased_products: return jsonify({"suggestions": []}), 200
        print(tag_counts)
        return jsonify({"suggestions": tag_counts}), 200

        # Step 4: Get top 5 most common tags
        top_tags = [tag for tag, count in sorted(
            tag_counts.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:5]]

        if not top_tags: return jsonify({"suggestions": []}), 200

        # Step 5: Find suggestions with matching tags (excluding purchased products)
        suggestions = list(db["products"].aggregate([
            {
                "$match": {
                    "product_id": {"$nin": list(purchased_products)},
                    "tags": {"$in": top_tags}
                }
            },
            {
                "$addFields": {
                    "matchCount": {
                        "$size": {
                            "$setIntersection": ["$tags", top_tags]
                        }
                    }
                }
            },
            {"$sort": {"matchCount": -1, "price": 1}},
            {"$limit": 10}
        ]))

        # Format response
        result = [{
            "product_id": str(p["product_id"]),
            "name": p["name"],
            "price": p["price"],
            "images": p.get("images", []),
            "matchDetails": {
                "matchingTags": list(set(p.get("tags", [])) & set(top_tags)),
                "matchCount": p["matchCount"]
            }
        } for p in suggestions]

        return jsonify({"suggestions": result}), 200

    except Exception as e:
        print(f"Suggestion error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500