from flask import Flask, render_template, request, send_file
import cv2
import numpy as np
import os
import uuid

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/process", methods=["POST"])
def process_image():

    file = request.files.get("image")
    operation = request.form.get("operation")

    if not file:
        return "No image received", 400

    # Read image from uploaded webcam frame
    image_bytes = file.read()

    image_array = np.frombuffer(
        image_bytes,
        np.uint8
    )

    image = cv2.imdecode(
        image_array,
        cv2.IMREAD_COLOR
    )

    if image is None:
        return "Invalid image", 400

    # -------------------------
    # ORIGINAL
    # -------------------------

    if operation == "original":

        result = image

    # -------------------------
    # GRAYSCALE
    # -------------------------

    elif operation == "gray":

        result = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2GRAY
        )

    # -------------------------
    # BINARY
    # -------------------------

    elif operation == "binary":

        gray = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2GRAY
        )

        _, result = cv2.threshold(
            gray,
            127,
            255,
            cv2.THRESH_BINARY
        )

    # -------------------------
    # GRAY TO RGB
    # -------------------------

    elif operation == "rgb":

        gray = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2GRAY
        )

        result = cv2.cvtColor(
            gray,
            cv2.COLOR_GRAY2RGB
        )

    # -------------------------
    # HSV
    # -------------------------

    elif operation == "hsv":

        hsv = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2HSV
        )

        result = cv2.cvtColor(
            hsv,
            cv2.COLOR_HSV2BGR
        )

    # -------------------------
    # HISTOGRAM EQUALIZATION
    # -------------------------

    elif operation == "equalize":

        gray = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2GRAY
        )

        result = cv2.equalizeHist(gray)

    # -------------------------
    # CONTRAST
    # -------------------------

    elif operation == "contrast":

        alpha = 2.0
        beta = 10

        result = cv2.convertScaleAbs(
            image,
            alpha=alpha,
            beta=beta
        )

    else:

        result = image

    # Unique filename
    filename = str(uuid.uuid4()) + ".jpg"

    output_path = os.path.join(
        UPLOAD_FOLDER,
        filename
    )

    cv2.imwrite(
        output_path,
        result
    )

    return send_file(
        output_path,
        mimetype="image/jpeg"
    )


if __name__ == "__main__":
    app.run(debug=True)