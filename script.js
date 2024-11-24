const fileInput = document.getElementById("fileInput");
const fileNameDisplay = document.getElementById("fileName"); // New span for file name display
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const output = document.getElementById("output");
const highlightBtn = document.getElementById("highlightBtn");

// Track whether the transparent areas are currently highlighted
let isHighlighted = false;

// Store original image data for toggling
let originalImageData = null;

fileInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    // Display the file name next to the choose image button
    fileNameDisplay.textContent = file.name;

    const img = new Image();

    img.onload = function () {
        // Reset highlight flag
        isHighlighted = false;
        highlightBtn.textContent = "Highlight Transparent Areas";
        output.innerHTML = ""; // Clear previous output

        // Store original image dimensions for accurate pixel count
        const originalWidth = img.width;
        const originalHeight = img.height;

        // Draw the image to the canvas using its original dimensions
        canvas.width = originalWidth;
        canvas.height = originalHeight;

        // Disable image smoothing for sharp pixels
        ctx.imageSmoothingEnabled = false;

        // Draw image to canvas using the original image size
        ctx.drawImage(img, 0, 0, originalWidth, originalHeight);

        // Store original image data (not scaled)
        originalImageData = ctx.getImageData(0, 0, originalWidth, originalHeight);

        // Analyze pixels based on the original image data (unscaled)
        const pixels = originalImageData.data;
        let nonTransparentPixelCount = 0;

        // Iterate through the original pixel data
        for (let i = 3; i < pixels.length; i += 4) {
            const alpha = pixels[i]; // Alpha channel
            if (alpha > 0) { // Check for non-transparent pixels
                nonTransparentPixelCount++;
            }
        }

        const pixelCountText = `The total number of non-transparent pixels is: ${nonTransparentPixelCount}`;
        output.textContent = pixelCountText;
        highlightBtn.disabled = false; // Enable highlight button
    };

    img.onerror = function () {
        output.textContent = "Invalid image file. Please upload a valid image.";
    };

    const reader = new FileReader();
    reader.onload = function (e) {
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

// Highlight or unhighlight transparent areas
highlightBtn.addEventListener("click", function () {
    if (!originalImageData) return;

    const transparentMessage = document.getElementById("transparentMessage");

    if (isHighlighted) {
        // Revert to original image
        ctx.putImageData(originalImageData, 0, 0);
        highlightBtn.textContent = "Highlight Transparent Areas";

        // Remove transparent message
        if (transparentMessage) {
            transparentMessage.remove();
        }
    } else {
        // Highlight transparent areas
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        for (let i = 0; i < pixels.length; i += 4) {
            const alpha = pixels[i + 3]; // Alpha channel
            if (alpha === 0) {
                // Set transparent pixels to semi-transparent red
                pixels[i] = 255; // Red
                pixels[i + 1] = 0; // Green
                pixels[i + 2] = 0; // Blue
                pixels[i + 3] = 128; // Semi-transparent
            }
        }

        ctx.putImageData(imageData, 0, 0);
        highlightBtn.textContent = "Remove Highlight";

        // Add transparent message if not already present
        if (!transparentMessage) {
            const span = document.createElement("span");
            span.id = "transparentMessage";
            span.textContent = "Transparent areas highlighted in red.";
            span.style.display = "block";
            span.style.marginTop = "10px";
            output.appendChild(span);
        }
    }

    // Toggle the highlight state
    isHighlighted = !isHighlighted;
});