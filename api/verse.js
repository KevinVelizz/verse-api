module.exports = async function handler(req, res) {

    const API_KEY = process.env.BIBLE_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ error: 'Missing API Key' });
    }

    // IDs de Biblia
    const BIBLES = {
        en: 'de4e12af7f28f599-01',
        es: '592420522e16049f-01',
        pt: 'bba9f40183526463-01'
    };

    // 📅 clave diaria (cache)
    const today = new Date().toISOString().split('T')[0];

    // ⚡ cache en memoria (simple y gratis)
    if (global.verseCache && global.verseCache.date === today) {
        return res.status(200).json(global.verseCache.data);
    }

    // 🎯 lista de versículos válidos (puedes ampliar esto)
    const verses = [
        'JHN.3.16',
        'PSA.23.1',
        'PRO.3.5',
        'ROM.8.28',
        'MAT.6.33',
        'ISA.41.10',
        'PHP.4.13'
    ];

    const verseId = verses[Math.floor(Math.random() * verses.length)];

    const result = {};

    for (const lang in BIBLES) {

        const response = await fetch(
            `https://api.scripture.api.bible/v1/bibles/${BIBLES[lang]}/verses/${verseId}`,
            {
                headers: {
                    'api-key': API_KEY
                }
            }
        );

        const data = await response.json();

        let text = data.data.content;

        // 🧼 limpiar HTML
        text = text.replace(/<[^>]*>?/gm, '');

        // 🧼 limpiar números y símbolos raros
        text = text.replace(/^[\d\s¶]+/, '');

        result[lang] = `${text} (${data.data.reference})`;
    }

    const finalData = {
        date: today,
        verseId,
        ...result
    };

    // guardar cache
    global.verseCache = {
        date: today,
        data: finalData
    };

    return res.status(200).json(finalData);
}