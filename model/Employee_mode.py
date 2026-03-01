from typing import TypedDict
from pymongo.collection import Collection  
from connection.mongoConnect import database

class Employee(TypedDict): 
    username: str
    password: str
    appraisal: int 
    criteria: list[str] 
    ratings: float 


collection: Collection[Employee] = database["employees"] 
