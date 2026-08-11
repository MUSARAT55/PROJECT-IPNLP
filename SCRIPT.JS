let video = document.getElementById("video");
let canvas = document.getElementById("canvas");

let capturedImage = document.getElementById("capturedImage");
let processedImage = document.getElementById("processedImage");

let captureText = document.getElementById("captureText");
let processedText = document.getElementById("processedText");

let downloadBtn = document.getElementById("downloadBtn");

let stream = null;
let capturedBlob = null;
let processedURL = null;


// =================================
// START CAMERA
// =================================

async function startCamera() {

    try {

        stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        video.srcObject = stream;

        video.style.display = "block";

        document.getElementById("cameraPlaceholder")
            .style.display = "none";

    }

    catch (error) {

        console.error(error);

        alert(
            "Camera access denied or camera not found."
        );

    }
}


// =================================
// STOP CAMERA
// =================================

function stopCamera() {

    if (stream) {

        stream.getTracks().forEach(
            track => track.stop()
        );

        video.srcObject = null;

        stream = null;

        video.style.display = "none";

        document.getElementById("cameraPlaceholder")
            .style.display = "flex";
    }
}


// =================================
// CAPTURE IMAGE
// =================================

function captureImage() {

    if (!stream) {

        alert(
            "Please start the camera first."
        );

        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    let context = canvas.getContext("2d");

    context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );

    canvas.toBlob(
        function(blob) {

            capturedBlob = blob;

            let imageURL =
                URL.createObjectURL(blob);

            capturedImage.src = imageURL;

            capturedImage.style.display = "block";

            captureText.style.display = "none";

            // Clear previous processed image
            processedImage.src = "";

            processedImage.style.display = "none";

            processedText.style.display = "block";

            processedText.innerText =
                "Select an operation to process the image.";

            downloadBtn.disabled = true;

        },
        "image/jpeg"
    );
}


// =================================
// PROCESS IMAGE
// =================================

async function processImage(operation) {

    if (!capturedBlob) {

        alert(
            "Please capture an image first."
        );

        return;
    }

    let status =
        document.getElementById("processingStatus");

    status.innerText = "PROCESSING...";

    let formData = new FormData();

    formData.append(
        "image",
        capturedBlob,
        "webcam.jpg"
    );

    formData.append(
        "operation",
        operation
    );

    try {

        let response = await fetch(
            "/process",
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) {

            throw new Error(
                "Image processing failed."
            );
        }

        let blob =
            await response.blob();

        processedURL =
            URL.createObjectURL(blob);

        processedImage.src =
            processedURL;

        processedImage.style.display =
            "block";

        processedText.style.display =
            "none";

        downloadBtn.disabled = false;

        status.innerText = "COMPLETED";

    }

    catch (error) {

        console.error(error);

        status.innerText = "ERROR";

        processedText.style.display =
            "block";

        processedText.innerText =
            "Unable to process image.";

    }
}


// =================================
// DOWNLOAD IMAGE
// =================================

function downloadImage() {

    if (!processedURL) {

        alert(
            "No processed image available."
        );

        return;
    }

    let link =
        document.createElement("a");

    link.href =
        processedURL;

    link.download =
        "visionlab_processed.jpg";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
}
