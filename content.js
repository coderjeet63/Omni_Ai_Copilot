// ==========================================
// 🛡️ THE INVISIBLE SHIELD & UI SETUP
// ==========================================

// STEP 1: Ek khali container (Host) banaya
const hostDiv = document.createElement('div');
document.body.appendChild(hostDiv);

// STEP 2: The Magic - Shadow DOM (Website ki CSS ko block karne ke liye)
const shadowRoot = hostDiv.attachShadow({ mode: 'open' });

// 🌟 STEP 3: THE MAIN BOX (Top-Center + Glassmorphism)
const mainContainer = document.createElement('div');
mainContainer.style.position = "fixed";

// 🟢 Top-Center Positioning Logic
mainContainer.style.top = "20px"; 
mainContainer.style.left = "50%"; 
mainContainer.style.transform = "translateX(-50%)"; 

// 🟢 Glassmorphism (Frosted Glass) Logic
mainContainer.style.backgroundColor = "rgba(0, 0, 0, 0.4)"; 
mainContainer.style.backdropFilter = "blur(10px)"; 
mainContainer.style.webkitBackdropFilter = "blur(10px)"; 
mainContainer.style.border = "1px solid rgba(255, 255, 255, 0.2)"; 

// Styling
mainContainer.style.color = "white";
mainContainer.style.zIndex = "999999"; // Sabse upar rakhne ke liye
mainContainer.style.padding = "15px";
mainContainer.style.borderRadius = "12px"; 
mainContainer.style.fontFamily = "Arial, sans-serif";
mainContainer.style.width = "400px"; 
mainContainer.style.boxShadow = "0px 8px 32px rgba(0, 0, 0, 0.3)";

// 🗣️ STEP 4: User Transcript UI (Jo aap bolenge/sunenge)
const uiDiv = document.createElement('div');
uiDiv.style.fontSize = "13px";
uiDiv.style.marginBottom = "10px";
uiDiv.style.color = "#e0e0e0"; 
uiDiv.style.textShadow = "1px 1px 3px rgba(0,0,0,0.8)";
uiDiv.innerHTML = "⚪ (Muted): Press 'Alt' to activate AI...";

// 🤖 STEP 5: AI Response UI (Jo Gemini answer dega)
const aiDiv = document.createElement('div');
aiDiv.style.paddingTop = "10px";
aiDiv.style.borderTop = "1px solid rgba(255, 255, 255, 0.2)"; 
aiDiv.style.color = "#00ffcc"; // Hacker Cyan Color
aiDiv.style.fontWeight = "bold";
aiDiv.style.fontSize = "15px";
aiDiv.style.textShadow = "1px 1px 3px rgba(0,0,0,0.8)"; 
aiDiv.innerHTML = "🤖 AI: Waiting for connection...";

// STEP 6: UI ko Shadow DOM ke andar pack karo
mainContainer.appendChild(uiDiv);
mainContainer.appendChild(aiDiv);
shadowRoot.appendChild(mainContainer);


// ==========================================
// 🔌 THE NERVE CENTER: WEBSOCKET & BACKEND
// ==========================================

const socket = new WebSocket('ws://localhost:8080');

// 1. Connection Start
socket.onopen = () => {
    console.log("✅ Node.js Backend se pipe jud gaya!");
    aiDiv.innerHTML = "🤖 AI: Connected. Ready to help!";
    socket.send("Hello Backend! Main Chrome Extension bol raha hoon 🕵️‍♂️");
};

// 2. Receive Answer from AI
socket.onmessage = (event) => {
    console.log("🤖 Backend ne kaha: ", event.data);
    aiDiv.innerHTML = "🤖 AI: " + event.data;
};


// ==========================================
// 🎙️ THE EAVESDROPPER: THE TOGGLE SWITCH (ALT KEY)
// ==========================================

let isAiActive = false; // By default, AI is muted

// 🥷 NINJA TOGGLE: Ek baar dabao ON, dubara dabao OFF
document.addEventListener('keydown', (e) => {
    // Check if Alt key is pressed
    if (e.key === 'Alt') {
        e.preventDefault(); // Browser ke default Alt menu ko rokne ke liye
        
        isAiActive = !isAiActive; // State ko reverse kar do (Toggle)

        if (isAiActive) {
            // 🟢 AI IS ON
            uiDiv.style.color = "#00ffcc"; // Hacker Cyan
            uiDiv.style.textShadow = "0px 0px 8px #00ffcc"; // Glow
            uiDiv.innerHTML = "🔴 (AI LIVE): Listening to interviewer...";
        } else {
            // ⚪ AI IS OFF
            uiDiv.style.color = "#e0e0e0"; // Normal Gray
            uiDiv.style.textShadow = "1px 1px 3px rgba(0,0,0,0.8)"; // Normal shadow
            uiDiv.innerHTML = "⚪ (Muted): Reading/Idle...";
        }
    }
});

const recognition = new webkitSpeechRecognition();
recognition.continuous = true;

// Jab naya word/sentence bola jaye
recognition.onresult = function(event) {
    const transcript = event.results[event.results.length - 1][0].transcript.trim();
    console.log("Speech detected: ", transcript);
    
    if (isAiActive) {
        // AI Active hai toh text dikhao aur bhejo
        uiDiv.innerHTML = "🔴 <b>Sending to AI:</b> " + transcript;
        
        // 🚀 SIRF TAB BHEJO JAB AI ACTIVE HO!
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(transcript);
            aiDiv.innerHTML = "🤖 AI: Thinking... 🤔"; 
        }
    } else {
        // Agar muted hai, toh sirf screen par gray color mein dikhao, bhejo mat
        uiDiv.innerHTML = "⚪ <i>Ignored:</i> " + transcript;
    }
}

// 🛡️ The Pro Shield: Agar Chrome mic ko band kare, toh auto-restart karo!
recognition.onend = function() {
    console.log("Silence detected. Restarting engine... 🔄");
    recognition.start();
};

// Start listening immediately!
recognition.start();