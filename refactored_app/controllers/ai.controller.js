import UserModel from "../models/user.model.js";

async function generateContentWithGoogleAI(prompt) {
    const apiKey = process.env.GOOGLE_AI1;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const requestBody = { contents: [{ parts: [{ text: `what topic for ${prompt} in three world at most & give me qustion on same topic you have 1000 token at most` }] }] };

    const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });
    if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
    return response.json();
}

async function generateContentWithGoogleAI2(prompt) {
    const apiKey = process.env.GOOGLE_AI2;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const requestBody = { contents: [{ parts: [{ text: `what topic for ${prompt} in three world at most && give me qustion on same topic  you have 1000 token at most` }] }] };

    const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });
    if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
    return response.json();
}

async function generateContentWithGoogleAI3(prompt) {
    const apiKey = process.env.GOOGLE_AI3;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const requestBody = { contents: [{ parts: [{ text: `what topic for ${prompt} in three world at most && give me qustion on same topic  you have 1000 token at most` }] }] };

    const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });
    if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
    return response.json();
}

export const getAiAssist = async (req, res, next) => {
    try {
        const now = Date.now();
        const time = await UserModel.findStudentByEmail(req.session.user.email);

        let h = req.session.h || 0;
        const r1time = Math.ceil((3600000 - (now - time.lasttry)) / 1000);

        if (time.lasttry != 0 && r1time >= 0) {
            req.session.now = time.lasttry;
            h = 1; req.session.sec = 0;
        } else {
            req.session.now = now;
        }

        const rtime = Math.ceil((3600000 - (now - req.session.now)) / 1000);
        const avg = req.session.avg || 0;
        const list = req.session.listdata || [];
        const id_q = req.session.id_q;

        let data_Ai = [];
        for (let i = 0; i < list.length; i++) {
            if (list[i].valid == 'invalid answer') data_Ai.push(list[i]);
        }
        req.session.data_Ai = data_Ai;

        if (h == 0) {
            req.session.h = 1;
            req.session.sec = id_q;
            res.render("student/AI-assist.ejs", { avg, data_Ai, id_q, sec: id_q, time: 0 });
        } else {
            let sec = req.session.sec;
            res.render("student/AI-assist.ejs", { avg, data_Ai, id_q, wait: h, sec, time: rtime });
        }
    } catch (err) {
        next(err);
    }
};

export const postAiAssist = async (req, res) => {
    const userMessage = req.body.r;
    req.session.h = 1;
    let flag = req.session.flag || 0;

    if (!userMessage) return res.status(400).json({ error: 'Message is required' });

    const flagActions = {
        0: generateContentWithGoogleAI, 1: generateContentWithGoogleAI2, 2: generateContentWithGoogleAI3,
    };
    const generateContent = flagActions[flag];

    try {
        if (!generateContent) throw new Error('Invalid flag value');

        flag = (flag + 1) % 3;
        req.session.flag = flag;

        const assistantResponse = await generateContent(userMessage);
        const responseText = await assistantResponse.candidates[0].content.parts[0].text;

        res.json({ response: responseText });
    } catch (error) {
        console.error('Error occurred:', error.message);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
};

export const postData3 = (req, res) => {
    const { action, data } = req.body;
    const now = Date.now();

    if (action === 'save') {
        req.session.now = now;
        req.session.data3 = data;
        res.json({ message: `Data3 saved successfully ${now}` });
    } else if (action === 'load') {
        if (req.session.data3) res.json({ data: req.session.data3 });
        else res.status(404).json({ message: 'No data3 found in session' });
    } else {
        res.status(400).json({ message: 'Invalid action' });
    }
};
