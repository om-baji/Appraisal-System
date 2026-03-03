import os 
from flask import Flask, request, render_template
from routes.appraisal import appraisal_bp
from routes.employee import employee_bp

app = Flask(__name__) 
app.secret_key = os.environ["SECRET_KEY"]
app.register_blueprint(appraisal_bp)
app.register_blueprint(employee_bp)

@app.get('/')
def index(): 
    return render_template('index.html')

@app.get('/health')
def health(): 
    return "Service is up and running" 

if __name__ == "__main__": 
    app.run(port=5000, host="0.0.0.0", debug=True)