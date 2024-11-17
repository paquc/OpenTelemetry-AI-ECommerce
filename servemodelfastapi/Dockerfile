# FROM tiangolo/uvicorn-gunicorn:python3.11-slim
FROM python:3.9-slim

ADD requirements.txt .
ADD *.py .
ADD *.csv .

RUN pip3 install -r requirements.txt

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8088"]

# CMD ["python3", "--version"]
