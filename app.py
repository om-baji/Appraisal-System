import os

from dotenv import load_dotenv
from flask import Flask, render_template, send_from_directory

from routes.appraisal import appraisal_bp
from routes.employee import employee_bp

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "some-secret")
app.register_blueprint(appraisal_bp)
app.register_blueprint(employee_bp)


@app.get("/")
def index():
    return render_template("index.html")


@app.get("/health")
def health():
    return "Service is up and running"


@app.get("/openapi.yaml")
def openapi_spec():
    return send_from_directory(".", "openapi.yaml", mimetype="text/yaml")


@app.get("/docs")
def docs():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Appraisal System - API Docs</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
        <script>
            SwaggerUIBundle({ url: "/openapi.yaml", dom_id: "#swagger-ui" });
        </script>
    </body>
    </html>
    """


def create_app():
    return app


if __name__ == "__main__":
    app.run(port=5000, host="0.0.0.0", debug=True)
