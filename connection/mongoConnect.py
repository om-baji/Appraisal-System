from pymongo import MongoClient 
import os 

username = os.environ["MONGO_USERNAME"]
password = os.environ["MONGO_PASSWORD"]

uri = f"mongodb://{username}:{password}@mongo:27017/"
client = MongoClient(uri)