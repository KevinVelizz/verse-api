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

        const today = new Date().toISOString().split('T')[0];

        if (global.verseCache && global.verseCache.date === today) {
            return res.status(200).json(global.verseCache.data);
        }

        const validVerses = [
            'JHN.3.16', 'PSA.23.1', 'PRO.3.5', 'ROM.8.28', 'MAT.6.33',
            'ISA.41.10', 'PHP.4.13', 'GEN.1.1', 'JER.29.11', 'PSA.119.105',
            'ROM.12.2', 'HEB.11.1', 'MAT.11.28', 'JOS.1.9', 'PRO.16.3',
            'COL.3.23', '1CO.10.13', '2TI.1.7', 'PSA.46.1', 'ISA.26.3'
        ];

        function getRandomVerse() {
            return validVerses[Math.floor(Math.random() * validVerses.length)];
        }

        let verseId;
        let success = false;
        let result = {};

        for (let i = 0; i < 5; i++) {

            verseId = getRandomVerse();

            try {
                const tempResult = {};

                for (const lang in BIBLES) {

                    const response = await fetch(
                        `https://rest.api.bible/v1/bibles/${BIBLES[lang]}/verses/${verseId}`,
                        {
                            headers: { 'api-key': API_KEY }
                        }
                    );

                    if (!response.ok) throw new Error("Invalid verse");

                    const data = await response.json();

                    let text = data.data.content;

                    text = text.replace(/<[^>]*>?/gm, '');

                    text = text.replace(/^[\d\s¶]+/, '');

                    tempResult[lang] = `${text} (${data.data.reference})`;
                }

                result = tempResult;
                success = true;
                break;

            } catch (e) {
            }
        }

        if (!success) {
            return res.status(500).json({ error: "No verse found" });
        }

        const finalData = {
            date: today,
            verseId,
            ...result
        };

        global.verseCache = {
            date: today,
            data: finalData
        };


        return res.status(200).json(finalData);

    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
}