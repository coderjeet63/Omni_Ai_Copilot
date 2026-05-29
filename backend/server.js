import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ==========================================
// 📄 STEP 1: APNA RESUME YAHAN DAALEIN (Knowledge Base)
// ==========================================
const myResume = `
Name: Jitendra
Skills: JavaScript, React, Node.js, WebSockets, Chrome Extensions, API Integration.
Experience: Built an advanced 'Omni-AI Co-pilot' using Manifest V3, Shadow DOM, WebSockets, and Gemini API for real-time interview assistance.
Strengths: System Design, Problem Solving, Quick Learner.
`;

// ==========================================
// 🧠 STEP 2: AI KO SMART BANANA (System Instructions)
// ==========================================
// Hum Gemini ko System Instruction de rahe hain jo uske dimaag mein fix rahegi
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    systemInstruction: `You are an expert HR and behavioral interview assistant helping the candidate.
    The candidate's resume and details are provided below. 
    
    YOUR RULES:
    1. Answer behavioral, HR, situational, and scenario-based questions professionally.
    2. Provide descriptive, well-explained, and comprehensive answers. Give the candidate strong talking points and detailed examples.
    3. ALWAYS answer whatever text you receive. Do not ignore any text. 
    4. Maintain a positive, collaborative, and confident tone suitable for an HR round.
    
    CANDIDATE RESUME:
    ${myResume}`
});

wss.on('connection', (ws) => {
    console.log('🟢 Chrome Extension Connect Ho Gaya! (New Interview Session Started)');

    // ==========================================
    // 🔄 STEP 3: THE MEMORY (Chat Session Start)
    // ==========================================
    // Har baar jab naya connection banega, ek naya 'Chat' shuru hoga.
    // Yeh apne aap poore interview ki history (previous questions/answers) save karta rahega!
    const chatSession = model.startChat({
        history: [], // Shuru mein history khali hai
    });

    ws.on('message', async (message) => {
        const text = message.toString();
        
        // Extension connection check ignore karo
        if (text.includes("Hello Backend")) return;

        console.log('🎙️ Interviewer/Audio:', text);

        try {
            // 🟢 STEP 4: Ab hum 'chatSession.sendMessage' use kar rahe hain
            // Yeh pichle saare messages aur naya message ek sath AI ko bhejta hai
            const result = await chatSession.sendMessage(`Incoming Speech: "${text}"`);
            const aiResponse = result.response.text();

            console.log('🤖 AI Answer:', aiResponse);
            
            // Answer screen par bhej do
            ws.send(aiResponse); 

        } catch (error) {
            console.error("AI Error:", error);
            ws.send("Error: AI so gaya hai 😴");
        }
    });

    ws.on('close', () => console.log('🔴 Client Disconnect Ho Gaya. (Interview Session Ended)'));
});

server.listen(8080, () => {
    console.log(`🚀 Smart AI WebSocket Server is running on ws://localhost:8080`);
});