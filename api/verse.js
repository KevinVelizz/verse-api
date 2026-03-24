export default async function handler(req, res) {

  const API_KEY = process.env.BIBLE_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "Missing API Key" });
  }

  try {

    const response = await fetch(
      'https://api.scripture.api.bible/v1/bibles/de4e12af7f28f599-01/verses/JHN.3.16',
      {
        headers: {
          'api-key': API_KEY
        }
      }
    );

    const text = await response.text(); // 👈 importante

    return res.status(200).json({
      status: response.status,
      raw: text
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}