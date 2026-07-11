export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, provider, size } = req.body;

    if (provider === "huggingface") {
      const hfModel = process.env.HF_IMAGE_MODEL || "black-forest-labs/FLUX.1-schnell";
      const response = await fetch(`https://api-inference.huggingface.co/models/${hfModel}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            width: Number(size.split("x")[0]),
            height: Number(size.split("x")[1])
          }
        })
      });

      const contentType = response.headers.get("content-type") || "";
      if (!response.ok) {
        const text = await response.text();
        return res.status(response.status).send(text);
      }

      if (contentType.includes("image")) {
        const arrayBuffer = await response.arrayBuffer();
        res.setHeader("Content-Type", contentType);
        return res.status(200).send(Buffer.from(arrayBuffer));
      }

      const data = await response.json();
      return res.status(200).json(data);
    }

    const response = await fetch("https://api.together.xyz/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.TOGETHER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.TOGETHER_IMAGE_MODEL || "black-forest-labs/FLUX.1-schnell-Free",
        prompt,
        size
      })
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Server error"
    });
  }
}
