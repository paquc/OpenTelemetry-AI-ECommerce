from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()


class Item(BaseModel):
    name: str
    count: int = 0

items = []

items.append(Item(name="apple", count=1))
items.append(Item(name="orange", count=2))

@app.get("/")
def root():
    return {"Hello": "World"}


@app.post("/additem")
def create_item(itemname: str, nb: int):
    items.append(Item(name=itemname, count=nb))
    return {"name": itemname, "count": nb}


@app.get("/items", response_model=list[Item])
def list_items(limit: int = 10):
    return items[0:limit]


@app.get("/items/{item_id}", response_model=Item)
def get_item(item_id: int) -> Item:
    if item_id < len(items):
        return items[item_id]
    else:
        raise HTTPException(status_code=404, detail=f"Item {item_id} not found")
