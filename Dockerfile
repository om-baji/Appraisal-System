FROM python:3.14-alpine 
WORKDIR /app 
COPY requirements.txt . 
RUN pip install -r requirements.txt
EXPOSE 5000 
COPY . . 
CMD ["flask", "run", "--debug", "--host=0.0.0.0"]
