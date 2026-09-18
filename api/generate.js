import { InferenceClient } from "@huggingface/inference";


const hf = new InferenceClient(
    process.env.HF_TOKEN
);


export default async function handler(
    req,
    res
) {

    /*
    |--------------------------------------------------------------------------
    | CORS
    |--------------------------------------------------------------------------
    */

    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );

    res.setHeader(
        "Access-Control-Allow-Methods",
        "POST, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );


    /*
    |--------------------------------------------------------------------------
    | OPTIONS
    |--------------------------------------------------------------------------
    */

    if (req.method === "OPTIONS") {

        return res
            .status(200)
            .end();

    }


    /*
    |--------------------------------------------------------------------------
    | Only POST Allowed
    |--------------------------------------------------------------------------
    */

    if (req.method !== "POST") {

        return res
            .status(405)
            .json({
                error:
                    "Method not allowed. Use POST."
            });

    }


    /*
    |--------------------------------------------------------------------------
    | Check Hugging Face Token
    |--------------------------------------------------------------------------
    */

    if (!process.env.HF_TOKEN) {

        return res
            .status(500)
            .json({
                error:
                    "HF_TOKEN is not configured on the server."
            });

    }


    try {

        /*
        |--------------------------------------------------------------------------
        | Get Request Data
        |--------------------------------------------------------------------------
        */

        const body =
            req.body || {};


        const prompt =
            typeof body.prompt === "string"
                ? body.prompt.trim()
                : "";


        const negativePrompt =
            typeof body.negativePrompt === "string"
                ? body.negativePrompt.trim()
                : "";


        const aspectRatio =
            typeof body.aspectRatio === "string"
                ? body.aspectRatio
                : "square";


        /*
        |--------------------------------------------------------------------------
        | Validate Prompt
        |--------------------------------------------------------------------------
        */

        if (!prompt) {

            return res
                .status(400)
                .json({
                    error:
                        "Please provide a prompt."
                });

        }


        if (prompt.length < 3) {

            return res
                .status(400)
                .json({
                    error:
                        "Prompt is too short."
                });

        }


        if (prompt.length > 2000) {

            return res
                .status(400)
                .json({
                    error:
                        "Prompt is too long. Maximum 2000 characters."
                });

        }


        /*
        |--------------------------------------------------------------------------
        | Image Dimensions
        |--------------------------------------------------------------------------
        */

        let width = 1024;

        let height = 1024;


        if (aspectRatio === "portrait") {

            width = 896;

            height = 1120;

        }


        if (aspectRatio === "landscape") {

            width = 1344;

            height = 768;

        }


        /*
        |--------------------------------------------------------------------------
        | Negative Prompt
        |--------------------------------------------------------------------------
        */

        const finalNegativePrompt =
            negativePrompt ||
            "blurry, distorted, low quality, deformed, bad anatomy, duplicate";


        /*
        |--------------------------------------------------------------------------
        | Generate Image
        |--------------------------------------------------------------------------
        */

        const imageBlob =
            await hf.textToImage({

                model:
                    "black-forest-labs/FLUX.1-schnell",

                inputs:
                    prompt,

                parameters: {

                    negative_prompt:
                        finalNegativePrompt,

                    width:
                        width,

                    height:
                        height

                }

            });


        /*
        |--------------------------------------------------------------------------
        | Convert Image To Base64
        |--------------------------------------------------------------------------
        */

        const arrayBuffer =
            await imageBlob.arrayBuffer();


        const base64 =
            Buffer
                .from(arrayBuffer)
                .toString("base64");


        const contentType =
            imageBlob.type ||
            "image/png";


        const imageData =
            `data:${contentType};base64,${base64}`;


        /*
        |--------------------------------------------------------------------------
        | Return Image
        |--------------------------------------------------------------------------
        */

        return res
            .status(200)
            .json({

                success: true,

                image:
                    imageData

            });


    } catch (error) {

        console.error(
            "Hugging Face error:",
            error
        );


        let message =
            "Unable to generate image.";


        if (error?.message) {

            message =
                error.message;

        }


        return res
            .status(500)
            .json({

                success: false,

                error:
                    message

            });

    }

}
