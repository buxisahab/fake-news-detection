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

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/analyze', async (req, res) => {
    const { news } = req.body;

    if (!news || news.trim() === '') {
        return res.status(400).json({ error: 'News content is required' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Analyze the following news content and determine whether it is likely Real, Fake, or Suspicious.

Return response in STRICT JSON format:
{
"verdict": "",
"confidence": "",
"reasoning": "",
"inconsistencies": ""
}

News: ${news}`;

        console.log('Analyzing news with Gemini...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up the response in case Gemini adds markdown code blocks
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const jsonResponse = JSON.parse(text);
            res.json(jsonResponse);
        } catch (parseError) {
            console.error('JSON Parsing Error:', parseError, 'Raw Text:', text);
            // Fallback JSON
            res.json({
                verdict: "Suspicious",
                confidence: "50",
                reasoning: "The AI response could not be parsed, but the content requires further verification.",
                inconsistencies: "Unable to extract specific inconsistencies."
            });
        }
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: 'Failed to analyze news content' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
