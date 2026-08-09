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

    const query =
      String(
        body.query ||
        body.message ||
        ""
      ).trim();

    if (!query) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reply: "❌ Research topic nahi mila."
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
          reply: "❌ GEMINI_API_KEY Netlify me set nahi hai."
        })
      };
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
      {
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
                    "Research this topic carefully: " +
                    query +
                    "\n\n" +
                    "Give the answer in the same language as the user. " +
                    "Call the user Boss. " +
                    "Use current web information when needed. " +
                    "Clearly separate facts from uncertain information."
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

    const data =
      await response.json();

    if (!response.ok) {

      return {
        statusCode: response.status,

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          reply:
            "❌ Gemini Research Error: " +
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
        .trim();

    if (!reply) {

      return {
        statusCode: 200,

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          reply:
            "🤖 Boss, research ka result nahi mila."
        })
      };
    }

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
