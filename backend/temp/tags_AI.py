# import random
#
# tag_categories = {
#     "festivals": [
#         "Diwali", "Holi", "Christmas", "Eid", "Navratri", "Pongal", "Raksha Bandhan", "Baisakhi"
#     ],
#     "seasonal": [
#         "Summer", "Winter", "Monsoon", "Spring", "Autumn"
#     ],
#     "events": [
#         "Wedding Season", "New Year", "Valentine’s Day", "Halloween", "Sunday Special", "Friday Sale"
#     ],
#     "style_based": [
#         "Ethnic", "Casual", "Formal", "Partywear", "Loungewear", "Fitness", "Beachwear"
#     ],
#     "target_based": [
#         "Men", "Women", "Unisex", "Kids"
#     ]
# }
#
# def generate_tags(product_name):
#     tags = []
#     name_lower = product_name.lower()
#     if any(word in name_lower for word in ["kurta", "sherwani", "lehenga", "anarkali", "dhoti", "dupatt", "angrakha"]):
#         tags.append("Diwali")
#         tags.append("Wedding Season")
#         tags.append("Ethnic")
#     if "halloween" in name_lower:
#         tags.append("Halloween")
#         tags.append("Partywear")
#     if "christmas" in name_lower:
#         tags.append("Christmas")
#         tags.append("Winter")
#     if "valentine" in name_lower:
#         tags.append("Valentine’s Day")
#     if "tee" in name_lower or "shirt" in name_lower:
#         tags.append("Casual")
#     if "dress" in name_lower:
#         tags.append("Partywear")
#     if "bikini" in name_lower or "swim" in name_lower:
#         tags.append("Beachwear")
#         tags.append("Summer")
#     if "jacket" in name_lower or "coat" in name_lower or "fleece" in name_lower:
#         tags.append("Winter")
#     if "night" in name_lower or "pajama" in name_lower or "robe" in name_lower:
#         tags.append("Loungewear")
#     if "sports" in name_lower or "gym" in name_lower or "leggings" in name_lower:
#         tags.append("Fitness")
#     if "new year" in name_lower:
#         tags.append("New Year")
#     if "summer" in name_lower:
#         tags.append("Summer")
#     if "women" in name_lower:
#         tags.append("Women")
#     elif "men" in name_lower:
#         tags.append("Men")
#     else:
#         tags.append("Unisex")
#     while len(tags) < 4:
#         tags.append(random.choice(random.choice(list(tag_categories.values()))))
#     return list(set(tags))
import asyncio, random
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = "mongodb+srv://khajan_bhatt:Tanuj%4024042005@khajan38.9iqi4n1.mongodb.net/"
MONGO_DB_NAME = "Secure-Delivery-Data"

async def main():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[MONGO_DB_NAME]
    collection_products = db["product_list"]
    cursor = collection_products.find({})

    async for product in cursor:
        product_id = product["product_id"]

        for variant in product.get("variants", []):
            size = variant["size"]
            inc_update = {}

            for color in variant["options"].keys():
                add_qty = random.randint(700, 5000)
                inc_update[f"variants.$[v].options.{color}"] = add_qty

            if inc_update:
                await collection_products.update_one(
                    {"product_id": product_id},
                    {"$inc": inc_update},
                    array_filters=[{"v.size": size}]
                )

        print(f"Updated product {product_id}")

    print("✔ All product quantities increased successfully!")

if __name__ == "__main__":
    asyncio.run(main())