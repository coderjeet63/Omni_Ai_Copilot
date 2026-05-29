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

// 🟢 Semi-Transparent Blur Logic
mainContainer.style.backgroundColor = "rgba(0, 0, 0, 0.7)"; 
mainContainer.style.backdropFilter = "blur(8px)"; 
mainContainer.style.webkitBackdropFilter = "blur(8px)"; 
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
aiDiv.style.fontSize = "16px"; // Slightly larger
// Standard soft text shadow for the dark background
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
// 🎙️ THE EAVESDROPPER: PUSH-TO-TALK (HOLD ALT)
// ==========================================

let isAiActive = false;
let accumulatedTranscript = "";
let currentInterim = ""; // 🔥 Track interim speech

// 🥷 KEYDOWN: Press and Hold Alt to Listen
document.addEventListener('keydown', (e) => {
    // Prevent default Alt menu behavior
    if (e.key === 'Alt') {
        e.preventDefault(); 
        console.log("⌨️ KEYDOWN: Alt pressed. isAiActive currently:", isAiActive, "repeat:", e.repeat);
    }
    
    if (e.key === 'Alt' && !e.repeat && !isAiActive) {
        isAiActive = true;
        accumulatedTranscript = ""; // Clear purana text
        currentInterim = "";
        console.log("🟢 STATE CHANGED: AI is now LISTENING (isAiActive=true)");
        
        // 🟢 AI IS ON
        uiDiv.style.color = "#00ffcc"; 
        uiDiv.style.textShadow = "0px 0px 8px #00ffcc";
        uiDiv.innerHTML = "🔴 (AI LIVE): Listening... Keep holding Alt!";
    }
});

// 🥷 KEYUP: Release Alt to Send
document.addEventListener('keyup', (e) => {
    if (e.key === 'Alt') {
        e.preventDefault();
        console.log("⌨️ KEYUP: Alt released. Waiting for speech API to catch up...");
        
        // ⚪ Change UI to show processing
        uiDiv.style.color = "#ffff99"; 
        uiDiv.innerHTML = "⏳ <b>Processing Audio...</b>";
        
        // We wait 800 milliseconds before sending to allow the browser's 
        // speech recognition engine to finish converting the audio to text!
        setTimeout(() => {
            isAiActive = false;
            
            // Merge finalized text with any pending interim text
            let finalStringToSend = (accumulatedTranscript + " " + currentInterim).trim();
            console.log("⌨️ TIMEOUT FINISHED. Final String to send:", `"${finalStringToSend}"`);
            
            uiDiv.style.color = "#e0e0e0"; 
            
            if (finalStringToSend !== "") {
                uiDiv.innerHTML = "🔴 <b>Sent to AI:</b> " + finalStringToSend;
                console.log("🚀 SENDING TO WEBSOCKET:", finalStringToSend);
                
                // 🚀 SEND DIRECTLY
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(finalStringToSend);
                    aiDiv.innerHTML = "🤖 AI: Thinking... 🤔"; 
                } else {
                    console.error("❌ WebSocket is NOT open. State:", socket.readyState);
                }
            } else {
                console.log("⚠️ Nothing to send. Both Final and Interim were empty.");
                uiDiv.innerHTML = "⚪ (Muted): Ready. Hold Alt to listen.";
            }
            
            // Reset everything
            accumulatedTranscript = ""; 
            currentInterim = "";
        }, 800); // 800ms grace period
    }
});

const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true; // Added this to see partial results immediately
recognition.lang = 'en-US'; // Explicitly set to English

recognition.onstart = function() {
    console.log("🎤 SPEECH API: Started listening successfully!");
};

recognition.onerror = function(event) {
    console.error("🎤 SPEECH API ERROR:", event.error);
};

// Jab naya word/sentence bola jaye
recognition.onresult = function(event) {
    let finalChunk = "";
    let interimChunk = "";

    // Loop through results to get accurate text
    for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
            finalChunk += event.results[i][0].transcript;
        } else {
            interimChunk += event.results[i][0].transcript;
        }
    }

    console.log(`🗣️ SPEECH DETECTED -> Interim: "${interimChunk}" | Final: "${finalChunk}"`);
    
    if (isAiActive) {
        // Accumulate completely confirmed words
        if (finalChunk.trim() !== "") {
            accumulatedTranscript += (accumulatedTranscript ? " " : "") + finalChunk.trim();
        }
        // Save the unconfirmed words so we don't lose them if they release Alt right now!
        currentInterim = interimChunk.trim();
        
        uiDiv.innerHTML = "🔴 <b>Listening:</b> " + accumulatedTranscript + " <i>" + currentInterim + "</i>";
    }
}

let isRestarting = false;
// 🛡️ The Pro Shield: Agar Chrome mic ko band kare, toh auto-restart karo!
recognition.onend = function() {
    if (isRestarting) return; // Prevent infinite loops!
    
    console.log("Silence detected. Restarting engine in 1 second... 🔄");
    isRestarting = true;
    
    // Wait 1 full second before restarting so the browser can breathe
    setTimeout(() => {
        try {
            recognition.start();
        } catch (e) {
            console.error("Restart failed:", e);
        }
        isRestarting = false;
    }, 1000);
};

// Start listening immediately!
recognition.start();