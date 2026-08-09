exports.handler = async function(event) {
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
          reply: "❌ Boss, research topic nahi mila."
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
          reply: "❌ Boss, GEMINI_API_KEY missing hai."
        })
      };
    }

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

    const response = await fetch(url, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },

      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text:
                  "You are RIDER AI research assistant. " +
                  "Call the user Boss. " +
                  "Research the following topic using current web information. " +
                  "Answer in the same language as the user. " +
                  "Give useful facts and mention important sources when available.\n\n" +
                  "TOPIC:\n" +
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
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: {
          "Content-Type": "application/json"
        },
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
        .trim();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        reply:
          reply ||
          "🤖 Boss, research result nahi mila."
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
