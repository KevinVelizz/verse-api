export default async function handler(req, res) {
    try {
        const API_KEY = process.env.BIBLE_API_KEY;

        if (!API_KEY) {
            return res.status(500).json({ error: "Missing API Key" });
        }

        const BIBLES = {
            en: 'de4e12af7f28f599-01',
            es: '592420522e16049f-01',
            pt: '90799bb5b996fddc-01'
        };

        const verseId = 'JHN.3.16'; // fijo para test

        const result = {};

        for (const lang in BIBLES) {

            const url = `https://rest.api.bible/v1/bibles/${BIBLES[lang]}/verses/${verseId}`;

            const response = await fetch(url, {
                headers: {
                    'api-key': API_KEY
                }
            });

            const text = await response.text();

            result[lang] = {
                status: response.status,
                raw: text
            };
        }

        return res.status(200).json(result);

    } catch (error) {
        return res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
}