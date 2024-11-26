from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import pandas as pd
import subprocess
import time
import Drain3Parse
import GenOccurencesMatricesChrono as gm
import TrainAlarms as train
import PreprocessData as gmV2
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
def addlogentry(date: str , sever: str, epoch: str, error_type: str, service: str, endpoint: str, data1: str, data2: str, message: str, uuid: str):
    log_entry = date + "," + sever + "," + epoch + "," + error_type + "," + service + "," + endpoint + "," + data1 + "," + data2 + "," + message + "," + uuid
    alarm_clusters = ['E8']
    data = Drain3Parse.ParseNewEvent(log_entry, alarm_clusters)
    if data is not None:
        prediction = predict.RF_Prediction(data)
        if prediction:
            file_path = os.path.join('data', "alarms.log")
            with open(file_path, "a") as file:
                file.write(f"Alarm: " + log_entry + "\n")
            return {"Alarm": "True"}
         
    return {"Alarm": "False"}


# curl -X GET 'http://127.0.0.1:8088/Drain3ParseLearn'
@app.get("/Drain3Parse")
def Drain3Learn():
    Drain3Parse.Drain3ParseLearn()
    return {"Drain3": "Done."}


# curl -X GET 'http://127.0.0.1:8088/GenMatrix'
@app.get("/GenMatrix")
def GenMatrix():
    alarm_clusters = ['E4']
    gm.GenMatrices("apigateway", "warns", 500, 500, 10, -500, 10, alarm_clusters)
    return {"Gen matrices": "Done."}


# curl -X GET 'http://127.0.0.1:8088/GenMatrix'
@app.get("/GenMatrixV2")
def GenMatrixV2():
    gmV2.GenMatricesV2('4200ms', 2)
    return {"Gen matrices V2": "Done."}


# curl -X GET 'http://127.0.0.1:8088/TrainModels'
@app.get("/TrainModels")
def TrainModels():
    train.TrainModels(0, 1, 0, 1, 80, 20, 0)
    return {"Train models": "Done."}


# curl -X GET 'http://127.0.0.1:8088/Predict'
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

