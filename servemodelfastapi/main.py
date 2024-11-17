from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import pandas as pd
import subprocess
import time
import Drain3Parse
import GenOccurencesMatricesChrono as gm
import TrainAlarmsChrono as train
import predict


app = FastAPI()

# uvicorn main:app --reload --host:127.0.0.1 --port:8088

# class LogEntry(BaseModel):
#     DateTime: str
#     Severity: str

# logentries = []

def AddHeader():
    file_path = os.path.join("data", "eventslog.csv")
    with open(file_path, "a") as file:
        file.write("DateTime,Severity,EpochTime,ErrorType,Service,EndPoint,DataVal1,DataVal2,Content\n")
    return {"log": "created"}


@app.get("/addlog")
def addlog():
    data_folder = "data"
    if not os.path.exists(data_folder):
        os.makedirs(data_folder)
    file_path = os.path.join(data_folder, "eventslog.csv")
    if os.path.exists(file_path):
        return {"log": "already exists"}
    with open(file_path, "a") as file:
        file.write("DateTime,Severity,EpochTime,ErrorType,Service,EndPoint,DataVal1,DataVal2,Content\n")
        #time.sleep(2)
    return {"log": "created"}


# log_format = '<DateTime>,<Severity>,<EpochTime>,<ErrorType>,<Service>,<EndPoint>,<DataVal1>,<DataVal2>,<Content>'
@app.post("/addentry")
def addlogentry(date: str , sever: str, epoch: str, error_type: str, service: str, endpoint: str, data1: str, data2: str, message: str):
    
    # log_entry = "2024-11-15 07:22:10.883,info,1731698530883,OK,apigateway,/userslist,11,,Users list fetched successfully from user-service in 11 ms"
    log_entry = date + "," + sever + "," + epoch + "," + error_type + "," + service + "," + endpoint + "," + data1 + "," + data2 + "," + message
    data = Drain3Parse.ParseNewEvent(log_entry)
    if data is not None:
        predict.RF_Prediction(data)
         
    return {"Status": "Success"}


@app.get("/Drain3ParseLearn")
def Drain3Learn():
    Drain3Parse.Drain3ParseLearn()
    return {"Drain3": "Done."}


@app.get("/GenMatrix")
def GenMatrix():
    gm.GenMatrices("apigateway", "warns", 500, 500, 10, -500, 10)
    return {"Gen matrices": "Done."}


@app.get("/TrainModels")
def TrainModels():
    train.TrainModels(1, 1, "warns", "apigateway", 500, 500, 10, -500, 0, 1, 70, 30, 0)
    return {"Train models": "Done."}


@app.get("/Predict")
def Predict():
    predict.test_RF_Predictions()
    return {"Predict": "Done."}

# @app.get("/brain")
# def brainparse():
#     data_folder = "data"
#     if not os.path.exists(data_folder):
#         return {"log": "missing"}
#     file_path = os.path.join(data_folder, "eventslog.csv")
#     if not os.path.exists(file_path):
#         return {"log": "missing"}
#     with open(file_path, "a") as file:
#         subprocess.run(["python", "BrainParse.py eventslog.csv"], check=True)
#     return {"log": "created"}


# /////////////////////////////////////////////////////////////////////////

# class Item(BaseModel):
#     name: str
#     count: int = 0

# items = []

# items.append(Item(name="apple", count=1))
# items.append(Item(name="orange", count=2))

# # Usage:
# # curl -X GET 'http://127.0.0.1:8088/'
# @app.get("/")
# def root():
#     return {"Hello": "World"}


# # Usage:
# # curl -X POST "http://127.0.0.1:8088/additem?itemname=pink&nb=20"
# @app.post("/additem")
# def create_item(itemname: str, nb: int):
#     items.append(Item(name=itemname, count=nb))
#     return {"name": itemname, "count": nb}


# # Usage:
# # curl -X GET 'http://127.0.0.1:8088/items'
# @app.get("/items", response_model=list[Item])
# def list_items(limit: int = 10):
#     return items[0:limit]


# # Usage:
# # curl -X GET http://127.0.0.1:8088/items/3
# @app.get("/items/{item_id}", response_model=Item)
# def get_item(item_id: int) -> Item:
#     if item_id < len(items):
#         return items[item_id]
#     else:
#         raise HTTPException(status_code=404, detail=f"Item {item_id} not found")

