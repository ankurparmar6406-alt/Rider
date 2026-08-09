const { GoogleGenAI } = require("@google/genai");

exports.handler = async function (event) {
  try {
    // Sirf POST request allow
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "POST request required"
        })
      };
    }

    // Request body
    const body = JSON.parse(event.body || "{}");

    const prompt = String(
      body.prompt ||
      body.message ||
      ""
    ).trim();

    if (!prompt) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "Image banane ke liye prompt likho."
        })
      };
    }

    // Gemini API key
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "GEMINI_API_KEY Netlify me set nahi hai."
        })
      };
    }

    // Gemini
    const ai = new GoogleGenAI({
      apiKey: apiKey
    });

    // AI image generate
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image",
      contents: prompt,
      config: {
        responseModalities: ["IMAGE"]
      }
    });

    // Image dhundo
    let imageData = null;
    let mimeType = "image/png";

    if (response.candidates) {
      for (const candidate of response.candidates) {
        if (!candidate.content || !candidate.content.parts) {
          continue;
        }

        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            imageData = part.inlineData.data;
            mimeType =
              part.inlineData.mimeType || "image/png";
            break;
          }
        }

        if (imageData) break;
      }
    }

    if (!imageData) {
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "AI image generate nahi kar paya."
        })
      };
    }

    // Base64 image frontend ko bhejo
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      },
      body: JSON.stringify({
        success: true,
        mimeType: mimeType,
        image: imageData
      })
    };

  } catch (error) {

    console.error("IMAGE ERROR:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error:
          "❌ Image generate karte waqt error aaya.",
        details: error.message
      })
    };
  }
};
