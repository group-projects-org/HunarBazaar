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
    new_password_hashed = generate_password_hash("dhruv123")

    # Update the password field for the given agent_id
    result = await agents_collection.update_one(
        {"agent_id": "7c85865a-c825-4f0f-b7b8-8476034g2018e7"},
        {"$set": {"password": new_password_hashed}}
    )

    if result.modified_count > 0:
        print("✅ Password updated successfully.")
    else:
        print("⚠️ No matching agent found or password already same.")

    mongo_client.close()

if __name__ == "__main__":
    asyncio.run(main())