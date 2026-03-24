export default async function handler(req, res) {
    try {
        const API_KEY = process.env.BIBLE_API_KEY;

        if (!API_KEY) {
            return res.status(500).json({ error: "Missing API Key" });
        }

        const BIBLES = {
            en: 'de4e12af7f28f599-01',
            es: '592420522e16049f-01',
            pt: 'bba9f40183526463-01'
        };

        const today = new Date().toISOString().split('T')[0];

        if (global.verseCache && global.verseCache.date === today) {
            return res.status(200).json(global.verseCache.data);
        }

        const books = [
            'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT',
            '1SA', '2SA', '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST',
            'JOB', 'PSA', 'PRO', 'ECC', 'SNG',
            'ISA', 'JER', 'LAM', 'EZK', 'DAN',
            'HOS', 'JOL', 'AMO', 'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL',
            'MAT', 'MRK', 'LUK', 'JHN', 'ACT',
            'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL',
            '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM',
            'HEB', 'JAS', '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV'
        ];

        function getRandomVerse() {
            const book = books[Math.floor(Math.random() * books.length)];
            const chapter = Math.floor(Math.random() * 50) + 1;
            const verse = Math.floor(Math.random() * 30) + 1;

            return `${book}.${chapter}.${verse}`;
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