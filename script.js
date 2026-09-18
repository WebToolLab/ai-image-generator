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


let currentImageBlob = null;


// ==========================================
// CHARACTER COUNTER
// ==========================================

promptInput.addEventListener(
  "input",
  () => {

    characterCount.textContent =
      promptInput.value.length;

  }
);


// ==========================================
// GENERATE IMAGE
// ==========================================

generateBtn.addEventListener(
  "click",
  generateImage
);


async function generateImage() {

  const prompt =
    promptInput.value.trim();

  if (!prompt) {

    showError(
      "Please enter a prompt first."
    );

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

            prompt:
              finalPrompt,

            negativePrompt:
              negativePrompt,

            aspectRatio:
              aspectRatio

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
        "The server did not return an image."
      );

    }


    const imageResponse =
      await fetch(data.image);


    if (!imageResponse.ok) {

      throw new Error(
        "Unable to load generated image."
      );

    }


    currentImageBlob =
      await imageResponse.blob();


    const imageURL =
      URL.createObjectURL(
        currentImageBlob
      );


    generatedImage.src =
      imageURL;


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


// ==========================================
// DOWNLOAD
// ==========================================

downloadBtn.addEventListener(
  "click",
  () => {

    if (!currentImageBlob) {
      return;
    }


    const url =
      URL.createObjectURL(
        currentImageBlob
      );


    const link =
      document.createElement(
        "a"
      );


    link.href = url;

    link.download =
      "ai-generated-image.png";


    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );


    setTimeout(
      () => {
        URL.revokeObjectURL(url);
      },
      1000
    );

  }
);


// ==========================================
// NEW IMAGE
// ==========================================

newImageBtn.addEventListener(
  "click",
  () => {

    resultState.classList.add(
      "hidden"
    );

    emptyState.classList.remove(
      "hidden"
    );

    promptInput.focus();

  }
);


// ==========================================
// EXAMPLE PROMPTS
// ==========================================

document
  .querySelectorAll(".example")
  .forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          promptInput.value =
            button.dataset.prompt;

          characterCount.textContent =
            promptInput.value.length;

          promptInput.focus();

          window.scrollTo({
            top:
              document
                .querySelector(
                  ".generator"
                )
                .offsetTop - 30,

            behavior:
              "smooth"
          });

        }
      );

    }
  );


// ==========================================
// LOADING STATE
// ==========================================

function setLoading(
  loading
) {

  generateBtn.disabled =
    loading;


  if (loading) {

    buttonText.classList.add(
      "hidden"
    );

    loadingSpinner.classList.remove(
      "hidden"
    );

    emptyState.classList.add(
      "hidden"
    );

    resultState.classList.add(
      "hidden"
    );

    loadingState.classList.remove(
      "hidden"
    );

  } else {

    buttonText.classList.remove(
      "hidden"
    );

    loadingSpinner.classList.add(
      "hidden"
    );

  }

}


// ==========================================
// ERROR
// ==========================================

function showError(
  message
) {

  errorMessage.textContent =
    message;

}


function hideError() {

  errorMessage.textContent =
    "";

}
