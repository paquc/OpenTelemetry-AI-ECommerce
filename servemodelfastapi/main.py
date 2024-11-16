from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os

app = FastAPI()

# uvicorn main:app --reload --host:127.0.0.1 --port:8088

class Item(BaseModel):
    name: str
    count: int = 0

class LogEntry(BaseModel):
    DateTime: str
    Severity: str

logentries = []

@app.get("/addlog")
def addlog():
    data_folder = "data"
    if not os.path.exists(data_folder):
        os.makedirs(data_folder)

    file_path = os.path.join(data_folder, "eventslog.csv")
    open(file_path, "a")
    return {"log": "created"}


# log_format = '<DateTime>,<Severity>,<EpochTime>,<ErrorType>,<Service>,<EndPoint>,<DataVal1>,<DataVal2>,<Content>'
@app.post("/addentry")
def addlogentry(date: str , sever: str, epoch: str, error_type: str, service: str, endpoint: str, data1: str, data2: str, message: str):
    logentries.append(LogEntry(DateTime=date, Severity=sever))
    file_path = os.path.join("data", "eventslog.csv")
    with open(file_path, "a") as file:
        file.write(f"{date},{sever},{epoch},{error_type},{service},{endpoint},{data1},{data2},{message}\n")
    return {"DateTime": date, "Severity": sever}


items = []

items.append(Item(name="apple", count=1))
items.append(Item(name="orange", count=2))

# Usage:
# curl -X GET 'http://127.0.0.1:8088/'
@app.get("/")
def root():
    return {"Hello": "World"}


# Usage:
# curl -X POST "http://127.0.0.1:8088/additem?itemname=pink&nb=20"
@app.post("/additem")
def create_item(itemname: str, nb: int):
    items.append(Item(name=itemname, count=nb))
    return {"name": itemname, "count": nb}


# Usage:
# curl -X GET 'http://127.0.0.1:8088/items'
@app.get("/items", response_model=list[Item])
def list_items(limit: int = 10):
    return items[0:limit]


# Usage:
# curl -X GET http://127.0.0.1:8088/items/3
@app.get("/items/{item_id}", response_model=Item)
def get_item(item_id: int) -> Item:
    if item_id < len(items):
        return items[item_id]
    else:
        raise HTTPException(status_code=404, detail=f"Item {item_id} not found")

