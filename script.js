// ==========================================
// AI IMAGE GENERATOR
// ==========================================

// IMPORTANT:
// For testing only. Never expose a real API token
// in a public GitHub repository.

const HF_TOKEN = "YOUR_HUGGING_FACE_TOKEN";

// Model used for image generation
const MODEL_ID = "black-forest-labs/FLUX.1-schnell";

const promptInput = document.getElementById("prompt");
const styleInput = document.getElementById("style");
const qualityInput = document.getElementById("quality");

const generateBtn = document.getElementById("generateBtn");
const btnText = document.getElementById("btnText");
const loader = document.getElementById("loader");

const emptyState = document.getElementById("emptyState");
const resultContainer = document.getElementById("resultContainer");
const generatedImage = document.getElementById("generatedImage");

const downloadBtn = document.getElementById("downloadBtn");
const newImageBtn = document.getElementById("newImageBtn");
const errorMessage = document.getElementById("errorMessage");

let currentImageBlob = null;

// Generate image
generateBtn.addEventListener("click", generateImage);

async function generateImage() {
  const prompt = promptInput.value.trim();
  const style = styleInput.value;
  const quality = qualityInput.value;

  if (!prompt) {
    showError("Please enter a description for your image.");
    return;
  }

  if (HF_TOKEN === "YOUR_HUGGING_FACE_TOKEN") {
    showError(
      "Please add your Hugging Face API token in script.js before generating."
    );
    return;
  }

  const finalPrompt = `${prompt}, ${style}, ${quality}`;

  setLoading(true);
  hideError();

  try {
    const response = await fetch(
      `https://router.huggingface.co/hf-inference/models/${MODEL_ID}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: finalPrompt
        })
      }
    );

    if (!response.ok) {
      let errorText = "Image generation failed.";

      try {
        const errorData = await response.json();
        errorText = errorData.error || errorText;
      } catch (e) {
        // Keep default error
      }

      throw new Error(errorText);
    }

    const imageBlob = await response.blob();

    currentImageBlob = imageBlob;

    const imageURL = URL.createObjectURL(imageBlob);

    generatedImage.src = imageURL;
    generatedImage.alt = prompt;

    emptyState.classList.add("hidden");
    resultContainer.classList.remove("hidden");

  } catch (error) {
    console.error(error);
    showError(
      error.message ||
      "Something went wrong. Please try again."
    );
  } finally {
    setLoading(false);
  }
}

// Download generated image
downloadBtn.addEventListener("click", () => {
  if (!currentImageBlob) return;

  const imageURL = URL.createObjectURL(currentImageBlob);
  const link = document.createElement("a");

  link.href = imageURL;
  link.download = "ai-generated-image.png";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(imageURL);
});

// Create another image
newImageBtn.addEventListener("click", () => {
  resultContainer.classList.add("hidden");
  emptyState.classList.remove("hidden");
  promptInput.focus();
});

// Example prompt buttons
document.querySelectorAll(".prompt-card").forEach((card) => {
  card.addEventListener("click", () => {
    const text = card.querySelector("span").textContent;
    promptInput.value = text;
    promptInput.focus();

    window.scrollTo({
      top: document.querySelector(".generator-card").offsetTop - 30,
      behavior: "smooth"
    });
  });
});

// Loading state
function setLoading(isLoading) {
  generateBtn.disabled = isLoading;

  if (isLoading) {
    btnText.classList.add("hidden");
    loader.classList.remove("hidden");
  } else {
    btnText.classList.remove("hidden");
    loader.classList.add("hidden");
  }
}

// Error message
function showError(message) {
  errorMessage.textContent = message;
}

function hideError() {
  errorMessage.textContent = "";
}
