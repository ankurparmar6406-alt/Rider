exports.handler = async function (event) {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reply: "❌ POST request required."
        })
      };
    }

    const body = JSON.parse(event.body || "{}");

    const query = String(
      body.query || body.message || ""
    ).trim();

    if (!query) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reply: "🔎 Boss, kis topic par research karni hai?"
        })
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reply: "❌ GEMINI_API_KEY nahi mili."
        })
      };
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=" +
        encodeURIComponent(apiKey),
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text:
                  "You are RIDER AI Research Assistant. " +
                  "Call the user Boss. " +
                  "Answer in Hindi or Hinglish. " +
                  "Give clear, useful and well-organized answers. " +
                  "If the user asks for research, explain the topic " +
                  "with important facts, background, advantages, " +
                  "disadvantages and conclusion when appropriate. " +
                  "Do not claim that you searched the live web."
              }
            ]
          },

          contents: [
            {
              role: "user",
              parts: [
                {
                  text: query
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        data.error?.message ||
        "Unknown Gemini error.";

      return {
        statusCode: response.status,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reply:
            "❌ Gemini Research Error: " +
            errorMessage
        })
      };
    }

    const reply =
      data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim() ||
      "🤖 Boss, research result nahi mila.";

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
          "❌ Research Server Error: " +
          error.message
      })
    };
  }
};
