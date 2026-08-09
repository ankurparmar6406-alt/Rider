exports.handler = async function(event) {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
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
        body: JSON.stringify({
          reply: "🔎 Boss, kis topic par research karni hai?"
        })
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          reply: "❌ GEMINI_API_KEY nahi mili."
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
          contents: [
            {
              role: "user",
              parts: [
                {
                  text:
                    "Research this topic and explain the important information clearly in Hindi/Hinglish:\n\n" +
                    query
                }
              ]
            }
          ],

          tools: [
            {
              google_search: {}
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          reply:
            "❌ Gemini Research Error: " +
            (data.error?.message || "Unknown error")
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
