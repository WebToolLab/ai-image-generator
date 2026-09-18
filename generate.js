downloadBtn.addEventListener(
  "click",
  () => {

    if (!generatedImage.src) {
      return;
    }

    const link =
      document.createElement("a");

    link.href =
      generatedImage.src;

    link.download =
      "ai-generated-image.png";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

  }
);
