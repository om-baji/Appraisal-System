FROM python:3.14-alpine 
WORKDIR /app 
COPY requirements.txt . 
RUN pip install -r requirements.txt
EXPOSE 5000 
COPY . . 
CMD ["python3", "app.py", "--DEBUG=True"]
