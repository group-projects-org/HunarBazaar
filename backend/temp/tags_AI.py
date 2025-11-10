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

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from werkzeug.security import generate_password_hash

MONGO_URI = "mongodb+srv://khajan_bhatt:Tanuj%4024042005@khajan38.9iqi4n1.mongodb.net/"
MONGO_DB_NAME = "Secure-Delivery-Data"

async def main():
    mongo_client = AsyncIOMotorClient(MONGO_URI)
    db = mongo_client[MONGO_DB_NAME]
    agents_collection = db["agents"]

    # Hash the password before saving
    new_password_hashed = generate_password_hash("sanjana123")

    # Update the password field for the given agent_id
    result = await agents_collection.update_one(
        {"agent_id": "65dddef6-e552-49d6-a004-f951eb17b029"},
        {"$set": {"password": new_password_hashed}}
    )

    if result.modified_count > 0:
        print("✅ Password updated successfully.")
    else:
        print("⚠️ No matching agent found or password already same.")

    mongo_client.close()

if __name__ == "__main__":
    asyncio.run(main())