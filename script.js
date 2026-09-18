const promptInput =
    document.getElementById("prompt");

const negativePromptInput =
    document.getElementById("negativePrompt");

const styleSelect =
    document.getElementById("style");

const qualitySelect =
    document.getElementById("quality");

const aspectRatioSelect =
    document.getElementById("aspectRatio");

const generateBtn =
    document.getElementById("generateBtn");

const buttonText =
    document.getElementById("buttonText");

const loader =
    document.getElementById("loader");

const generatedImage =
    document.getElementById("generatedImage");

const placeholder =
    document.getElementById("placeholder");

const resultActions =
    document.getElementById("resultActions");

const downloadBtn =
    document.getElementById("downloadBtn");

const newImageBtn =
    document.getElementById("newImageBtn");

const errorMessage =
    document.getElementById("errorMessage");

const statusText =
    document.getElementById("statusText");

const charCount =
    document.getElementById("charCount");


let currentImage = null;


/*
|--------------------------------------------------------------------------
| Character Counter
|--------------------------------------------------------------------------
*/

promptInput.addEventListener("input", () => {

    charCount.textContent =
        promptInput.value.length;

});


/*
|--------------------------------------------------------------------------
| Show Error
|--------------------------------------------------------------------------
*/

function showError(message) {

    errorMessage.textContent = message;

    errorMessage.classList.remove("hidden");

}


/*
|--------------------------------------------------------------------------
| Hide Error
|--------------------------------------------------------------------------
*/

function hideError() {

    errorMessage.textContent = "";

    errorMessage.classList.add("hidden");

}


/*
|--------------------------------------------------------------------------
| Loading State
|--------------------------------------------------------------------------
*/

function setLoading(isLoading) {

    generateBtn.disabled = isLoading;

    if (isLoading) {

        buttonText.textContent =
            "Generating...";

        loader.classList.remove("hidden");

        statusText.textContent =
            "Generating";

    } else {

        buttonText.textContent =
            "✨ Generate Image";

        loader.classList.add("hidden");

    }

}


/*
|--------------------------------------------------------------------------
| Generate Image
|--------------------------------------------------------------------------
*/

async function generateImage() {

    hideError();

    const prompt =
        promptInput.value.trim();

    const negativePrompt =
        negativePromptInput.value.trim();

    const style =
        styleSelect.value;

    const quality =
        qualitySelect.value;

    const aspectRatio =
        aspectRatioSelect.value;


    /*
    |--------------------------------------------------------------------------
    | Validate Prompt
    |--------------------------------------------------------------------------
    */

    if (!prompt) {

        showError(
            "Please enter a description for your image."
        );

        promptInput.focus();

        return;
    }


    if (prompt.length < 3) {

        showError(
            "Please enter a more detailed prompt."
        );

        promptInput.focus();

        return;
    }


    /*
    |--------------------------------------------------------------------------
    | Build AI Prompt
    |--------------------------------------------------------------------------
    */

    const finalPrompt = `
${prompt}

Style: ${style}.
Quality: ${quality}.
Highly detailed.
Professional image generation.
Good composition.
Sharp details.
High quality lighting.
`.trim();


    setLoading(true);


    /*
    |--------------------------------------------------------------------------
    | Call Vercel API
    |--------------------------------------------------------------------------
    */

    try {

        const response = await fetch(
            "/api/generate",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    prompt: finalPrompt,

                    negativePrompt:
                        negativePrompt,

                    aspectRatio:
                        aspectRatio

                })
            }
        );


        /*
        |--------------------------------------------------------------------------
        | Check Response Type
        |--------------------------------------------------------------------------
        |
        | This prevents the:
        |
        | Unexpected token '<'
        |
        | error when a server returns HTML.
        |
        */

        const contentType =
            response.headers.get(
                "content-type"
            ) || "";


        if (!contentType.includes("application/json")) {

            const htmlResponse =
                await response.text();

            console.error(
                "Server returned non-JSON:",
                htmlResponse
            );

            throw new Error(
                `API returned ${response.status} instead of JSON. Make sure this project is deployed on Vercel and you are using the Vercel URL.`
            );
        }


        const data =
            await response.json();


        /*
        |--------------------------------------------------------------------------
        | Handle API Error
        |--------------------------------------------------------------------------
        */

        if (!response.ok) {

            throw new Error(
                data.error ||
                "Image generation failed."
            );

        }


        /*
        |--------------------------------------------------------------------------
        | Validate Image
        |--------------------------------------------------------------------------
        */

        if (!data.image) {

            throw new Error(
                "The server did not return an image."
            );

        }


        /*
        |--------------------------------------------------------------------------
        | Display Image
        |--------------------------------------------------------------------------
        */

        currentImage =
            data.image;

        generatedImage.src =
            data.image;

        generatedImage.alt =
            prompt;


        placeholder.classList.add(
            "hidden"
        );

        generatedImage.classList.remove(
            "hidden"
        );

        resultActions.classList.remove(
            "hidden"
        );


        statusText.textContent =
            "Generated";


        /*
        |--------------------------------------------------------------------------
        | Scroll to Result on Mobile
        |--------------------------------------------------------------------------
        */

        if (window.innerWidth < 850) {

            document
                .querySelector(".result-panel")
                .scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

        }

    } catch (error) {

        console.error(
            "Generation error:",
            error
        );


        showError(
            error.message ||
            "Something went wrong while generating the image."
        );


        statusText.textContent =
            "Error";

    } finally {

        setLoading(false);

    }

}


/*
|--------------------------------------------------------------------------
| Generate Button
|--------------------------------------------------------------------------
*/

generateBtn.addEventListener(
    "click",
    generateImage
);


/*
|--------------------------------------------------------------------------
| Enter Key Shortcut
|--------------------------------------------------------------------------
*/

promptInput.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter" &&
            (event.ctrlKey || event.metaKey)
        ) {

            generateImage();

        }

    }
);


/*
|--------------------------------------------------------------------------
| Download Image
|--------------------------------------------------------------------------
*/

downloadBtn.addEventListener(
    "click",
    () => {

        if (!currentImage) {

            showError(
                "There is no image to download."
            );

            return;
        }


        const link =
            document.createElement("a");

        link.href =
            currentImage;

        link.download =
            "ai-generated-image.png";

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

    }
);


/*
|--------------------------------------------------------------------------
| New Image
|--------------------------------------------------------------------------
*/

newImageBtn.addEventListener(
    "click",
    () => {

        promptInput.value = "";

        negativePromptInput.value = "";

        charCount.textContent = "0";

        currentImage = null;


        generatedImage.src = "";

        generatedImage.classList.add(
            "hidden"
        );

        placeholder.classList.remove(
            "hidden"
        );

        resultActions.classList.add(
            "hidden"
        );

        statusText.textContent =
            "Ready";

        hideError();


        promptInput.focus();

    }
);
