import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

username = os.getenv("MONGO_USERNAME")
password = os.getenv("MONGO_PASSWORD")
in_docker = os.getenv("IN_DOCKER", "false").lower() == "true"

if in_docker:
    uri = f"mongodb://{username}:{password}@mongo:27017/appraisal?authSource=admin"
else:
    uri = os.getenv("MONGO_ATLAS_URI")

client = MongoClient(uri)
print(client)
client.admin.command("ping")
print("MongoDB connected")