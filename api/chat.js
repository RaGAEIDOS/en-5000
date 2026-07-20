module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY not configured. Please add it in Vercel → Project Settings → Environment Variables. Get one free at: https://aistudio.google.com/app/apikey" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const userMessage = body.messages?.[0]?.content || "";
    if (!userMessage) return res.status(400).json({ error: "No message content provided" });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMessage }] }],
          generationConfig: {
            maxOutputTokens: 8000,
            temperature: 0.7,
          }
        })
      }
    );

    const data = await response.json();
    if (data.error) {
      const msg = data.error.message || "Unknown Gemini API error";
      if (msg.includes("API key")) {
        return res.status(401).json({ error: "Invalid API key. Please check your GEMINI_API_KEY in Vercel settings. Get a new key at: https://aistudio.google.com/app/apikey" });
      }
      return res.status(400).json({ error: `Gemini API error: ${msg}` });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!text) return res.status(500).json({ error: "Gemini returned empty response. Try again." });

    return res.status(200).json({
      content: [{ type: "text", text }]
    });
  } catch (err) {
    return res.status(500).json({ error: `Server error: ${err.message}` });
  }
};
