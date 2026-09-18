import { InferenceClient } from "@huggingface/inference";


const hf =
  new InferenceClient(
    process.env.HF_TOKEN
  );


export default async function handler(
  req,
  res
) {

  // Only allow POST
  if (req.method !== "POST") {

    return res.status(405).json({
      error:
        "Method not allowed."
    });

  }


  try {

    const {
      prompt,
      negativePrompt,
      aspectRatio
    } = req.body || {};


    // Validate prompt
    if (
      !prompt ||
      typeof prompt !== "string"
    ) {

      return res.status(400).json({
        error:
          "Please provide a valid prompt."
      });

    }


    if (
      prompt.length < 2 ||
      prompt.length > 2000
    ) {

      return res.status(400).json({
        error:
          "Prompt must be between 2 and 2000 characters."
      });

    }


    // ======================================
    // IMAGE SIZE
    // ======================================

    let width = 1024;
    let height = 1024;


    if (
      aspectRatio ===
      "portrait"
    ) {

      width = 896;
      height = 1120;

    }


    if (
      aspectRatio ===
      "landscape"
    ) {

      width = 1344;
      height = 768;

    }


    // ======================================
    // NEGATIVE PROMPT
    // ======================================

    const finalNegativePrompt =
      negativePrompt ||
      "blurry, distorted, low quality, deformed";


    // ======================================
    // GENERATE IMAGE
    // ======================================

    const image =
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


    // ======================================
    // CONVERT IMAGE TO BASE64
    // ======================================

    const arrayBuffer =
      await image.arrayBuffer();


    const base64 =
      Buffer
        .from(arrayBuffer)
        .toString("base64");


    const contentType =
      image.type ||
      "image/png";


    const dataUrl =
      `data:${contentType};base64,${base64}`;


    return res.status(200).json({

      success: true,

      image:
        dataUrl

    });


  } catch (error) {

    console.error(
      "Image generation error:",
      error
    );


    return res.status(500).json({

      error:
        error?.message ||
        "Unable to generate image."

    });

  }

}
