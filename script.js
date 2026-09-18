const promptInput =
  document.getElementById("prompt");

const styleInput =
  document.getElementById("style");

const qualityInput =
  document.getElementById("quality");

const aspectRatioInput =
  document.getElementById("aspectRatio");

const negativePromptInput =
  document.getElementById("negativePrompt");

const generateBtn =
  document.getElementById("generateBtn");

const buttonText =
  document.getElementById("buttonText");

const loadingSpinner =
  document.getElementById("loadingSpinner");

const characterCount =
  document.getElementById("characterCount");

const errorMessage =
  document.getElementById("errorMessage");

const emptyState =
  document.getElementById("emptyState");

const loadingState =
  document.getElementById("loadingState");

const resultState =
  document.getElementById("resultState");

const generatedImage =
  document.getElementById("generatedImage");

const downloadBtn =
  document.getElementById("downloadBtn");

const newImageBtn =
  document.getElementById("newImageBtn");


// Generate image
generateBtn.addEventListener(
  "click",
  generateImage
);


async function generateImage() {

  const prompt =
    promptInput.value.trim();

  if (!prompt) {
    showError("Please enter a prompt first.");
    return;
  }

  hideError();
  setLoading(true);

  const style =
    styleInput.value;

  const quality =
    qualityInput.value;

  const negativePrompt =
    negativePromptInput.value.trim();

  const aspectRatio =
    aspectRatioInput.value;

  const finalPrompt =
    `${prompt}, ${style}, ${quality}`;

  try {

    const response =
      await fetch(
        "/api/generate",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            prompt: finalPrompt,
            negativePrompt: negativePrompt,
            aspectRatio: aspectRatio
          })
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
        "Image generation failed."
      );
    }

    if (!data.image) {
      throw new Error(
        "No image was returned."
      );
    }

    generatedImage.src =
      data.image;

    generatedImage.alt =
      prompt;

    emptyState.classList.add(
      "hidden"
    );

    loadingState.classList.add(
      "hidden"
    );

    resultState.classList.remove(
      "hidden"
    );

  } catch (error) {

    console.error(error);

    showError(
      error.message ||
      "Something went wrong."
    );

    loadingState.classList.add(
      "hidden"
    );

    emptyState.classList.remove(
      "hidden"
    );

  } finally {

    setLoading(false);

  }
}
