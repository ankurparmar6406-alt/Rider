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
    const query = String(body.query || "").trim();
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
          reply: "❌ GEMINI_API_KEY missing hai."
        })
      };
    }
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" +
      encodeURIComponent(apiKey);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        tools: [
          {
            googleSearch: {}
          }
        ],
        systemInstruction: {
          parts: [
            {
              text:
                "You are RIDER AI Research Assistant. " +
                "Call the user Boss. " +
                "Research the requested topic using Google Search grounding. " +
                "Answer in Hindi, Hinglish, or English according to the user's request. " +
                "Give a concise useful summary and mention important sources when available. " +
                "Do not invent facts."
            }
          ]
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: "Research this topic: " + query
              }
            ]
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
            "❌ Research Error: " +
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
        reply
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
          (error.message || "Unknown error")
      })
    };
  }
};
