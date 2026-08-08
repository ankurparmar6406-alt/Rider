exports.handler = async function(event) {

  try {

    if (event.httpMethod !== "POST") {

      return {
        statusCode: 405,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reply: "❌ Method not allowed."
        })
      };
    }

    const body =
      JSON.parse(event.body || "{}");

    const message =
      body.message || "";

    if (!message.trim()) {

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

    const apiKey =
      process.env.GEMINI_API_KEY;

    if (!apiKey) {

      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reply:
            "❌ Gemini API key configured nahi hai."
        })
      };
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" +
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
                  "You are RIDER AI, a friendly personal assistant. " +
                  "Call the user Boss. Reply naturally and clearly. " +
                  "The user may speak Hindi, Hinglish, or English. " +
                  "Answer in the language the user uses. " +
                  "Keep normal answers concise and useful."
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
      }
    );

    const data =
      await response.json();

    if(!response.ok){

      return {
        statusCode: response.status,

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          reply:
            "❌ Gemini Error: " +
            (
              data.error?.message ||
              "Unknown error"
            )
        })
      };
    }

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

  } catch(error) {

    return {

      statusCode: 500,

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        reply:
          "❌ Server Error: " +
          error.message
      })
    };
  }
};
