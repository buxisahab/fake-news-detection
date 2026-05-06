const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize Gemini Key Pool for Rotation
const keys = (process.env.GEMINI_API_KEY || '').split(',').map(k => k.trim()).filter(k => k);
const keyPool = keys.map(key => ({
    instance: new GoogleGenerativeAI(key),
    bannedUntil: 0,
    shortKey: key.substring(0, 10) + '...' 
}));

let poolIndex = 0;

function getAvailableInstance() {
    const now = Date.now();
    for (let i = 0; i < keyPool.length; i++) {
        const index = (poolIndex + i) % keyPool.length;
        const keyObj = keyPool[index];
        if (now >= keyObj.bannedUntil) {
            poolIndex = (index + 1) % keyPool.length; 
            return keyObj;
        }
    }
    return null;
}

app.post('/analyze', async (req, res) => {
    console.log(`--- New Analysis Request (Keys available: ${keyPool.length}) ---`);
    const { news } = req.body;

    if (!news || news.trim() === '') {
        return res.status(400).json({ error: 'News content is required' });
    }

    if (keyPool.length === 0) {
        return res.status(500).json({ error: 'Server configuration error: No API Keys provided' });
    }

    let attempts = 0;
    const maxAttempts = keyPool.length;

    while (attempts < maxAttempts) {
        const keyObj = getAvailableInstance();
        
        if (!keyObj) {
            return res.status(429).json({ error: 'All API keys are currently rate-limited. Please try again in 60 seconds.' });
        }

        try {
            console.log(`Using Key: ${keyObj.shortKey} (Attempt ${attempts + 1}/${maxAttempts})`);
            const model = keyObj.instance.getGenerativeModel({ model: "gemini-flash-latest" });

            const prompt = `Analyze the following news content and determine whether it is likely Real, Fake, or Suspicious.

Return response in STRICT JSON format:
{
"verdict": "",
"confidence": "",
"reasoning": "",
"inconsistencies": ""
}

News: ${news}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();

            // Clean up the response
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const jsonResponse = JSON.parse(text);
            
            console.log(`Successfully analyzed using Key: ${keyObj.shortKey}`);
            return res.json(jsonResponse);

        } catch (error) {
            const status = error.status || 0;
            console.error(`Error with Key ${keyObj.shortKey}:`, error.message);

            // If Rate Limited (429) or Server Error (500/503), ban key for 60 seconds and try next
            if (status === 429 || status === 503 || status === 500) {
                console.warn(`Key ${keyObj.shortKey} rate-limited. Banning for 60s.`);
                keyObj.bannedUntil = Date.now() + 60000;
                attempts++;
                continue; 
            }

            // For other critical errors, return immediately
            return res.status(500).json({ 
                error: 'AI Analysis Failed', 
                details: error.message 
            });
        }
    }

    res.status(429).json({ error: 'Exhausted all available API keys. All keys are rate-limited.' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Buxi.Ai Rotation Engine initialized with ${keyPool.length} keys.`);
});

module.exports = app;
