exports.handler = async function(event) {
  try {
    // Only POST allowed
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reply: "❌ Boss, POST request required."
        })
      };
    }
    // Read request
    const body = JSON.parse(event.body || "{}");
    const message = String(body.message || "").trim();
    if (!message) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reply: "🤖 Boss, kuch bolo."
        })
      };
    }
    // API key from Netlify Environment Variables
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reply: "❌ Boss, GEMINI_API_KEY Netlify me set nahi hai."
        })
      };
    }
    // Current Gemini model
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" +
      encodeURIComponent(apiKey);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text:
                "You are RIDER AI, a friendly personal AI assistant. " +
                "Call the user Boss. " +
                "Understand Hindi, Hinglish and English. " +
                "Reply in the same language as the user. " +
                "Be natural, helpful and concise. " +
                "Do not claim that you performed an action unless the website actually performed it."
            }
          ]
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: message
              }
            ]
          }
        ]
      })
    });
    const data = await response.json();
    // Gemini error
    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reply:
            "❌ Gemini Error: " +
            (data.error?.message || "Unknown Gemini error")
        })
      };
    }
    // Extract answer
    const reply =
      data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim() ||
      "🤖 Boss, mujhe reply nahi mila.";
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        reply: reply
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        reply:
          "❌ Server Error: " +
          (error.message || "Unknown error")
      })
    };
  }
};
