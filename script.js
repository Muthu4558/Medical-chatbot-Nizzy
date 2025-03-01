// Gemini API configuration
const API_KEY = 'AIzaSyC2wJRzz4eWYJllO_IEBLpfe-Xoq6f0jzM';

// DOM Elements
const chatWidget = document.getElementById('chat-widget');
const chatIcon = document.getElementById('chat-icon');
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const minimizeChat = document.getElementById('minimize-chat');

let chatHistory = [];
let currentSymptoms = [];
let isHealthMode = false;
let healthInteractionCount = 0; // Counter for health-related interactions
const SUGGEST_TELECONSULTATION_AFTER = 3; // Suggest teleconsultation after this many health interactions

// Speech synthesis setup
let speechSynthesis = window.speechSynthesis;
let femaleVoice = null;

// Initialize female voice
function initVoice() {
    speechSynthesis.onvoiceschanged = () => {
        const voices = speechSynthesis.getVoices();
        // Find an English female voice
        femaleVoice = voices.find(voice => 
            voice.lang.includes('en-') && voice.name.toLowerCase().includes('female')) ||
            voices.find(voice => voice.name.toLowerCase().includes('female')) ||
            voices.find(voice => voice.lang.includes('en-')) || // Fallback to any English voice
            voices[0]; // Final fallback to first available voice
    };
    speechSynthesis.getVoices(); // Trigger voice loading
}

// Initialize voice when the script loads
initVoice();

function speakText(text) {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = femaleVoice;
    utterance.lang = 'en-US'; // Force English language
    utterance.rate = 1;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
}

function addSpeakerButton(messageDiv) {
    const speakerBtn = document.createElement('button');
    speakerBtn.className = 'speaker-button';
    speakerBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    speakerBtn.onclick = () => {
        const textToSpeak = messageDiv.textContent;
        speakText(textToSpeak);
    };
    messageDiv.appendChild(speakerBtn);
}

function suggestTeleconsultation(userInput) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    const messageText = document.createElement('p');
    messageText.textContent = `I feel sorry for this. You should consider scheduling a teleconsultation for proper medical advice.`;
    messageDiv.appendChild(messageText);
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'margin-top: 10px; display: flex; justify-content: center;';
    const bookButton = document.createElement('button');
    bookButton.textContent = 'Book Teleconsultation';
    bookButton.style.cssText = 'background-color: #1b8188; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; font-size: 14px;';
    bookButton.addEventListener('click', handleTeleconsultation);
    buttonContainer.appendChild(bookButton);
    messageDiv.appendChild(buttonContainer);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    chatHistory.push({ 
        role: 'assistant', 
        content: "I feel sorry for this. You should consider scheduling a teleconsultation for proper medical advice." 
    });
}

// Event Listeners
chatIcon.addEventListener('click', () => {
    chatWidget.classList.remove('closed');
    if (chatMessages.children.length === 0) {
        initialize();
    }
});

minimizeChat.addEventListener('click', () => {
    chatWidget.classList.add('closed');
});

sendButton.addEventListener('click', handleUserMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleUserMessage();
    }
});

function initialize() {
    addBotMessage("Nizzy! I'm your AI-Powered health assistant. How may I help you today?");
    showInitialOptions();
}

function showInitialOptions() {
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'options-container';
    const teleButton = document.createElement('button');
    teleButton.className = 'option-btn';
    teleButton.innerHTML = '<i class="fas fa-calendar-check"></i> Book Teleconsultation';
    teleButton.onclick = () => {
        addUserMessage("I'd like to book a teleconsultation");
        handleTeleconsultation();
    };
    const healthButton = document.createElement('button');
    healthButton.className = 'option-btn';
    healthButton.innerHTML = '<i class="fas fa-heartbeat"></i> Health Concerns';
    healthButton.onclick = () => {
        addUserMessage("I have some health concerns");
        handleHealthConcerns();
    };
    optionsDiv.appendChild(teleButton);
    optionsDiv.appendChild(healthButton);
    chatMessages.appendChild(optionsDiv);
}

function handleTeleconsultation() {
    isHealthMode = false;
    const container = document.createElement("div");
    container.style.cssText = `background: #ffffff; padding: 10px; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); font-family: Arial, sans-serif; margin: 10px 0;`;
    const message = document.createElement("p");
    message.textContent = "Select Date to Book Your Teleconsultation:";
    message.style.cssText = `font-weight: bold; margin-bottom: 10px; font-family: Arial, sans-serif;`;
    container.appendChild(message);
    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.min = new Date(new Date().setDate(new Date().getDate() + 1))
        .toISOString()
        .split("T")[0];
    dateInput.style.cssText = `margin: 5px 0; padding: 5px; border: 1px solid #ccc; margin-bottom: 10px; border-radius: 5px;`;
    dateInput.addEventListener("change", () => handleDateSelection(dateInput.value));
    container.appendChild(dateInput);
    chatMessages.appendChild(container);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleDateSelection(selectedDate) {
    const userMessage = document.createElement("div");
    userMessage.textContent = `Selected Date: ${selectedDate}`;
    userMessage.className = 'message user-message';
    chatMessages.appendChild(userMessage);
    const container = document.createElement("div");
    container.style.cssText = `background: #ffffff; padding: 10px; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); margin: 10px 0; font-family: Arial, sans-serif;`;
    const message = document.createElement("p");
    message.textContent = `Choose Your Time Slot for ${selectedDate}:`;
    message.style.cssText = `font-weight: bold; margin-bottom: 10px;`;
    container.appendChild(message);
    const timeSlots = ["10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM"];
    timeSlots.forEach((slot) => {
        const button = document.createElement("button");
        button.textContent = slot;
        button.style.cssText = `background: #229ea6; color: white; padding: 8px 12px; border: none; margin: 5px 0; border-radius: 5px; cursor: pointer; display: block; width: 100%; text-align: left;`;
        button.addEventListener("click", () => handleTimeSlotSelection(selectedDate, slot));
        container.appendChild(button);
    });
    chatMessages.appendChild(container);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleTimeSlotSelection(date, slot) {
    const userMessage = document.createElement("div");
    userMessage.textContent = `Selected Time Slot: ${slot}`;
    userMessage.className = 'message user-message';
    chatMessages.appendChild(userMessage);
    const detailsContainer = document.createElement("div");
    detailsContainer.style.cssText = `margin: 10px 0; background: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #ccc; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);`;
    const botMessage = document.createElement("p");
    botMessage.textContent = "Please share the following details:";
    botMessage.style.cssText = `font-weight: bold; margin-bottom: 15px; font-family: Arial, sans-serif; font-size: 16px;`;
    detailsContainer.appendChild(botMessage);
    const userInputs = {};
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Full Name";
    nameInput.style.cssText = `background: #f9f9f9; color: #333; padding: 10px; border: 1px solid #ddd; margin-bottom: 10px; border-radius: 5px; display: block; width: 100%; box-sizing: border-box; font-size: 14px;`;
    userInputs["Full Name"] = nameInput;
    detailsContainer.appendChild(nameInput);
    const ageInput = document.createElement("input");
    ageInput.type = "number";
    ageInput.placeholder = "Age";
    ageInput.max = "999";
    ageInput.style.cssText = `background: #f9f9f9; color: #333; padding: 10px; border: 1px solid #ddd; margin-bottom: 10px; border-radius: 5px; display: block; width: 100%; box-sizing: border-box; font-size: 14px;`;
    userInputs["Age"] = ageInput;
    detailsContainer.appendChild(ageInput);
    const genderInput = document.createElement("select");
    genderInput.style.cssText = `background: #f9f9f9; color: #333; padding: 10px; border: 1px solid #ddd; margin-bottom: 10px; border-radius: 5px; display: block; width: 100%; box-sizing: border-box; font-size: 14px;`;
    ["Select Gender", "Male", "Female", "Others"].forEach((option) => {
        const genderOption = document.createElement("option");
        genderOption.value = option === "Select Gender" ? "" : option;
        genderOption.textContent = option;
        genderInput.appendChild(genderOption);
    });
    userInputs["Gender"] = genderInput;
    detailsContainer.appendChild(genderInput);
    const mobileInput = document.createElement("input");
    mobileInput.type = "number";
    mobileInput.placeholder = "Mobile Number";
    mobileInput.style.cssText = `background: #f9f9f9; color: #333; padding: 10px; border: 1px solid #ddd; margin-bottom: 10px; border-radius: 5px; display: block; width: 100%; box-sizing: border-box; font-size: 14px;`;
    userInputs["Mobile Number"] = mobileInput;
    detailsContainer.appendChild(mobileInput);
    const submitButton = document.createElement("button");
    submitButton.textContent = "Submit";
    submitButton.style.cssText = `background: #229ea6; color: white; padding: 10px; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; width: 100%; margin-top: 10px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);`;
    detailsContainer.appendChild(submitButton);
    chatMessages.appendChild(detailsContainer);
    function handleSubmit() {
        let allFieldsFilled = true;
        const collectedData = {};
        for (const field in userInputs) {
            const input = userInputs[field];
            const value = input.value.trim();
            if (field === "Full Name" && !/^[a-zA-Z\s]+$/.test(value)) {
                input.style.border = "1px solid red";
                allFieldsFilled = false;
                continue;
            }
            if (field === "Gender" && value === "") {
                input.style.border = "1px solid red";
                allFieldsFilled = false;
                continue;
            }
            if (!value) {
                input.style.border = "1px solid red";
                allFieldsFilled = false;
            } else {
                input.style.border = "1px solid #ddd";
                collectedData[field] = value;
            }
        }
        if (allFieldsFilled) {
            const otpContainer = document.createElement("div");
            otpContainer.style.cssText = `margin: 10px 0; background: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #ccc; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);`;
            
            const otpMessage = document.createElement("p");
            otpMessage.textContent = `OTP sent to ${collectedData["Mobile Number"]}. Verify your number:`;
            otpMessage.style.cssText = `font-weight: bold; margin-bottom: 15px; font-size: 16px;`;
            otpContainer.appendChild(otpMessage);

            const otpInput = document.createElement("input");
            otpInput.type = "text";
            otpInput.placeholder = "Enter OTP";
            otpInput.style.cssText = `margin: 5px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; width: 100%; box-sizing: border-box; font-size: 14px;`;
            otpInput.addEventListener("input", (e) => {
                otpInput.value = otpInput.value.replace(/\D/g, "");
            });
            otpContainer.appendChild(otpInput);
            const verifyButton = document.createElement("button");
            verifyButton.textContent = "Verify";
            verifyButton.style.cssText = `background: #229ea6; color: white; padding: 10px; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; width: 100%; margin-top: 10px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);`;
            verifyButton.addEventListener("click", () => {
                const confirmationMessage = document.createElement("div");
                confirmationMessage.innerHTML = `✅ Booking Confirmation!<br><br>
                    📅 Date: ${date}<br>
                    ⏰ Time: ${slot}<br>
                    👤 Patient Name: ${collectedData["Full Name"]}<br>
                    📞 Mobile Number: ${collectedData["Mobile Number"]}`;
                confirmationMessage.style.cssText = `background: #fff; font-family: Arial, Helvetica, sans-serif; color: #333; padding: 10px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; width: 100%; margin-top: 10px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);`;
                const closeConfirmationBtn = document.createElement("button");
                closeConfirmationBtn.textContent = "Close";
                closeConfirmationBtn.style.cssText = `background: red; color: white; padding: 6px 12px; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;`;
                closeConfirmationBtn.addEventListener("click", function() {
                    location.reload();
                });
                confirmationMessage.appendChild(closeConfirmationBtn);
                chatMessages.appendChild(confirmationMessage);
                chatMessages.scrollTop = chatMessages.scrollHeight;
                otpContainer.remove();
            });
            otpContainer.appendChild(verifyButton);
            chatMessages.appendChild(otpContainer);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            otpInput.addEventListener("keydown", (event) => {
                if (event.key === "Enter") verifyButton.click();
            });
        } else {
            addBotMessage("❗ Please fill in all the details correctly.");
        }
    }
    submitButton.addEventListener("click", handleSubmit);
    detailsContainer.addEventListener("keydown", (event) => {
        if (event.key === "Enter") handleSubmit();
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


function handleHealthConcerns() {
    isHealthMode = true;
    healthInteractionCount++; // Increment health interaction count
    addBotMessage("I'm here to help. Please describe your health concerns, and I'll provide guidance to the best of my ability.");
    if (healthInteractionCount >= SUGGEST_TELECONSULTATION_AFTER) {
        addBotMessage("You've had multiple health concerns. Would you like to book a teleconsultation?");
    }
}

// Show typing indicator
function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typing-indicator';
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'typing-dot';
        indicator.appendChild(dot);
    }
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// Handle user message
async function handleUserMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    // Check for booking related commands first
    const bookingKeywords = ['book appointment','book me','book an appointment','book teleconsultation','book consultation','schedule appointment'];
    if (bookingKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
        addUserMessage(message);
        userInput.value = '';
        handleTeleconsultation();
        return;
    }
    addUserMessage(message);
    userInput.value = '';
    showTypingIndicator();
    if (message.toLowerCase() === 'exit') {
        hideTypingIndicator();
        addBotMessage("Goodbye! Take care of your health.");
        setTimeout(() => {
            chatWidget.classList.add('closed');
            location.reload();
        }, 1000);
        return;
    }
    // Handle other messages
    chatHistory.push({ role: 'user', content: message });
    try {
        const messageType = analyzeMessageType(message);
        // Handle greetings directly without API call
        if (messageType === 'greeting') {
            hideTypingIndicator();
            const greetingResponse = getGreetingResponse();
            addBotMessage(greetingResponse);
            chatHistory.push({ role: 'assistant', content: greetingResponse });
            // Reset symptom conversation state when greeting
            symptomConversationState = {
                askedAboutDuration: false,
                userRespondedAboutDuration: false,
                askedAboutAdditionalSymptoms: false,
                userMentionedAdditionalSymptoms: false,
                initialSymptoms: "",
                additionalInfo: ""
            };
            lastMessageType = 'greeting';
            return;
        }
        // Handle symptom follow-up conversation
        if (lastMessageType === 'symptoms' && symptomConversationState.askedAboutDuration) {
            // This is a follow-up to our questions about symptoms
            
            // Check if user is responding about duration
            if (isAboutSymptomDuration(message) && !symptomConversationState.userRespondedAboutDuration) {
                symptomConversationState.userRespondedAboutDuration = true;
                symptomConversationState.additionalInfo += `Duration: ${message}. `;
            }
            
            // Check if user is mentioning additional symptoms
            if (mentionsAdditionalSymptoms(message)) {
                symptomConversationState.userMentionedAdditionalSymptoms = true;
                symptomConversationState.additionalInfo += `Additional symptoms/info: ${message}. `;
            }
            
            // If we have enough information, provide a comprehensive analysis
            if (symptomConversationState.userRespondedAboutDuration || 
                symptomConversationState.userMentionedAdditionalSymptoms) {
                
                // Create a comprehensive analysis prompt
                const analysisPrompt = createComprehensiveAnalysisPrompt(
                    symptomConversationState.initialSymptoms,
                    symptomConversationState.additionalInfo
                );
                
                // Get a response from the API
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: analysisPrompt
                            }]
                        }]
                    })
                });
                
                const data = await response.json();
                hideTypingIndicator();
                
                if (data.candidates && data.candidates[0]?.content?.parts?.[0]) {
                    const botResponse = data.candidates[0].content.parts[0].text;
                    addBotMessage(botResponse);
                    chatHistory.push({ role: 'assistant', content: botResponse });
                    
                    // Suggest teleconsultation after providing the analysis
                    setTimeout(() => {
                        suggestTeleconsultation();
                    }, 1000);
                    
                    // Reset the symptom conversation state
                    symptomConversationState = {
                        askedAboutDuration: false,
                        userRespondedAboutDuration: false,
                        askedAboutAdditionalSymptoms: false,
                        userMentionedAdditionalSymptoms: false,
                        initialSymptoms: "",
                        additionalInfo: ""
                    };
                } else {
                    throw new Error('Invalid response format');
                }
                
                return;
            }
        }
        
        // Only respond to medical-related concerns or booking requests
        if (messageType !== 'symptoms' && messageType !== 'lifestyle' && 
            messageType !== 'diet' && messageType !== 'remedies' && 
            messageType !== 'booking' && messageType !== 'psychological' &&
            messageType !== 'exit' && messageType !== 'greeting') {
            hideTypingIndicator();
            addBotMessage("I'm sorry, I can only assist with medical-related concerns. Please ask me about symptoms, lifestyle, diet, remedies, psychological concerns, or booking an appointment.");
            return;
        }
        
        // Increment health interaction counter for health-related queries
        if (messageType === 'symptoms' || messageType === 'lifestyle' || 
            messageType === 'diet' || messageType === 'remedies' || messageType === 'psychological') {
            healthInteractionCount++;
        }
        
        // If this is a symptoms message, store the initial symptoms
        if (messageType === 'symptoms') {
            symptomConversationState.initialSymptoms = message;
            symptomConversationState.askedAboutDuration = true; // We'll ask about duration in the response
        }
        
        // Store the last message type
        lastMessageType = messageType;
        
        let prompt = '';

        switch(messageType) {
            case 'symptoms':
                prompt = createSymptomsPrompt(message);
                currentSymptoms = [];
                break;
            case 'lifestyle':
                prompt = createLifestylePrompt(message);
                break;
            case 'diet':
                prompt = createDietPrompt(message);
                break;
            case 'remedies':
                prompt = createRemediesPrompt(message);
                break;
            case 'psychological':
                prompt = createPsychologicalPrompt(message);
                break;
            case 'greeting':
                prompt = createGreetingPrompt(message);
                break;
            default:
                prompt = createGeneralPrompt(message);
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        const data = await response.json();
        hideTypingIndicator();

        if (data.error) {
            throw new Error(data.error.message || 'API request failed');
        }

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]) {
            const botResponse = formatResponse(data.candidates[0].content.parts[0].text, messageType);
            addStructuredBotMessage(botResponse, messageType);
            chatHistory.push({ role: 'assistant', content: botResponse });
            
            // Check if we should suggest teleconsultation after the response
            if (healthInteractionCount >= SUGGEST_TELECONSULTATION_AFTER && 
                (messageType === 'symptoms' || messageType === 'lifestyle' || 
                 messageType === 'diet' || messageType === 'remedies' || messageType === 'psychological')) {
                // Add a slight delay before suggesting teleconsultation
                setTimeout(() => {
                    suggestTeleconsultation();
                }, 1000);
            }
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Error:', error);
        hideTypingIndicator();
        addBotMessage('Sorry, I encountered an error. Please try again.');
    }
}

function analyzeMessageType(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for greetings
    if (lowerMessage.match(/^(hi|hello|heyy|hey|hii|greetings |good morning|good afternoon|good evening|howdy)(\s|$)/) || 
        lowerMessage.includes('how are you') || 
        lowerMessage.includes('nice to meet you') ||
        lowerMessage.includes("what's up")) {
        return 'greeting';
    }
    
    // Check for exit command
    if (lowerMessage === 'exit') {
        chatWidget.classList.add('closed');
        setTimeout(() => {
            location.reload();
        }, 500);
        return 'exit';
    }

    // Check for booking related messages
    if (lowerMessage.includes('book') || 
        lowerMessage.includes('appointment') || 
        lowerMessage.includes('consultation') ||
        lowerMessage.includes('schedule') ||
        lowerMessage.includes('teleconsult')) {
        return 'booking';
    }

    // Medical-related concerns
    // Symptoms
    if (lowerMessage.includes('symptom') || 
        lowerMessage.includes('feel') || 
        lowerMessage.includes('have') || 
        lowerMessage.includes('pain') || 
        lowerMessage.includes('hurt') ||
        lowerMessage.includes('ache') ||
        lowerMessage.includes('sick') ||
        lowerMessage.includes('fever') ||
        lowerMessage.includes('cough') ||
        lowerMessage.includes('headache') ||
        lowerMessage.includes('nausea') ||
        lowerMessage.includes('dizzy') ||   
        lowerMessage.includes('tired') ||
        lowerMessage.includes('fatigue')) {
        return 'symptoms';
    } 
    // Psychological concerns (new)
    if (lowerMessage.includes('anxiety') || 
        lowerMessage.includes('depression') || 
        lowerMessage.includes('anxious') || 
        lowerMessage.includes('depression') || 
        lowerMessage.includes('depressed') || 
        lowerMessage.includes('panic') || 
        lowerMessage.includes('mental health') || 
        lowerMessage.includes('psychological')) {
        return 'psychological';
    }
    // Lifestyle
    else if (lowerMessage.includes('lifestyle') || 
             lowerMessage.includes('exercise') || 
             lowerMessage.includes('activity') ||
             lowerMessage.includes('sleep') ||
             lowerMessage.includes('stress') ||
             lowerMessage.includes('smoking') ||
             lowerMessage.includes('alcohol')) {
        return 'lifestyle';
    } 
    // Diet
    else if (lowerMessage.includes('diet') || 
             lowerMessage.includes('food') || 
             lowerMessage.includes('eat') ||
             lowerMessage.includes('nutrition') ||
             lowerMessage.includes('meal') ||
             lowerMessage.includes('vitamin') ||
             lowerMessage.includes('supplement')) {
        return 'diet';
    } 
    // Remedies
    else if (lowerMessage.includes('remedy') || 
             lowerMessage.includes('treatment') || 
             lowerMessage.includes('cure') ||
             lowerMessage.includes('medicine') ||
             lowerMessage.includes('medication') ||
             lowerMessage.includes('drug') ||
             lowerMessage.includes('therapy') ||
             lowerMessage.includes('prescription')) {
        return 'remedies';
    }
    
    // Non-medical query
    return 'general';
}

function createSymptomsPrompt(message) {
    return `
    Analyze these symptoms from a healthcare perspective:
    "${message}"
    
    First, provide a brief analysis of possible causes in 2-3 sentences.
    Keep it simple, clear, and informative.
    
    Then, ALWAYS end your response with these two questions:
    1. "For how many days have you been experiencing these symptoms?"
    2. "Do you have any other symptoms you'd like to mention?"
    `;
}

function createLifestylePrompt(message) {
    return `
    Suggest lifestyle modifications for the symptoms:
    "${message}"
    
    Provide 3 simple lifestyle changes that might help.
    Keep each suggestion to one line.
    `;
}

function createDietPrompt(message) {
    return `
    Suggest dietary recommendations for the symptoms:
    "${message}"
    
    1. Include (3 foods to add to diet)
    2. Avoid (3 foods to reduce or eliminate)
    
    Keep it very short and specific.
    `;
}

function createRemediesPrompt(message) {
    return `
    Suggest home remedies:
    "${message}"
    
    Provide 2-3 simple home remedies using common household ingredients.
    Keep each remedy to one line.
    `;
}

function createPsychologicalPrompt(message) {
    return `
    Provide supportive guidance for the following psychological concern:
    "${message}"
    
    Offer 2-3 empathetic suggestions or coping strategies.
    Emphasize that you are not a substitute for professional mental health advice and recommend seeking help if needed.
    `;
}

function createGreetingPrompt(message) {
    return `
    Respond to the greeting:
    "${message}"
    
    Provide a friendly and welcoming response.
    `;
}

function createGeneralPrompt(message) {
    return `
    Provide a clear, short response in 1-2 sentences with a healthcare perspective.
    "${message}"
    `;
}

function formatResponse(text, type) {
    // For symptoms, lifestyle, diet, remedies, and psychological, return the exact response without formatting
    if (type === 'symptoms' || type === 'lifestyle' || type === 'diet' || type === 'remedies' || type === 'psychological') {
        return text;
    }
    
    // For other types, format with bullet points if needed
    return text
        .replace(/•/g, '')
        .replace(/\n/g, '\n• ');
}

function addUserMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addStructuredBotMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message structured';
    
    const formattedMessage = message.split('\n').map(line => {
        if (line.match(/^\d+\./)) {
            return `<div class="title">${line}</div>`;
        } else if (line.match(/^[•\-]/)) {
            return `<div class="list">${line}</div>`;
        }
        return `<div>${line}</div>`;
    }).join('');
    
    messageDiv.innerHTML = formattedMessage;
    addSpeakerButton(messageDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addBotMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.textContent = message;
    addSpeakerButton(messageDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getGreetingResponse() {
    const currentHour = new Date().getHours();
    let timeBasedGreeting;
    
    if (currentHour < 12) {
        timeBasedGreeting = 'Good morning!';
    } else if (currentHour < 18) {
        timeBasedGreeting = 'Good afternoon!';
    } else {
        timeBasedGreeting = 'Good evening!';
    }
    
    // Array of possible greeting responses
    const greetingResponses = [
        `${timeBasedGreeting} I'm Nizzy, your AI-powered health assistant. How can I assist you today?`,
        `${timeBasedGreeting} How are you feeling today? I'm here to help with any health concerns.`,
        `Hello there! ${timeBasedGreeting} I'm here to assist with your health questions.`,
        `${timeBasedGreeting} It's nice to chat with you. How can I help with your health today?`,
        `Hi! ${timeBasedGreeting} I'm your health assistant. How may I help you?`
    ];
    
    // Return a random greeting from the array
    return greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
}

// Variables to track conversation context
let lastMessageType = null;
let symptomConversationState = {
    askedAboutDuration: false,
    userRespondedAboutDuration: false,
    askedAboutAdditionalSymptoms: false,
    userMentionedAdditionalSymptoms: false,
    initialSymptoms: "",
    additionalInfo: ""
};

// Function to detect if a message is about symptom duration
function isAboutSymptomDuration(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for mentions of time periods
    return lowerMessage.includes('day') || 
           lowerMessage.includes('week') || 
           lowerMessage.includes('month') ||
           lowerMessage.includes('hour') ||
           lowerMessage.includes('since') ||
           lowerMessage.includes('yesterday') ||
           lowerMessage.includes('today') ||
           lowerMessage.includes('morning') ||
           lowerMessage.includes('night') ||
           /\d+/.test(lowerMessage); // Contains numbers
}

// Function to detect if a message mentions additional symptoms
function mentionsAdditionalSymptoms(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for mentions of additional symptoms
    return lowerMessage.includes('also') ||
           lowerMessage.includes('addition') ||
           lowerMessage.includes('another') ||
           lowerMessage.includes('more') ||
           lowerMessage.includes('symptom') ||
           lowerMessage.includes('as well') ||
           lowerMessage.includes('too') ||
           lowerMessage.includes('yes') ||
           lowerMessage.includes('and');
}

// Function to create a comprehensive analysis based on all symptoms
function createComprehensiveAnalysisPrompt(initialSymptoms, additionalInfo) {
    return `
    A user initially reported these symptoms: "${initialSymptoms}"
    
    They have now provided additional information: "${additionalInfo}"
    
    Based on ALL of this information, provide a comprehensive analysis of their condition.
    Consider the combination of symptoms, their duration, and any patterns.
    
    Suggest a possible health concern that might explain these symptoms.
    Emphasize that this is not a diagnosis but a possible explanation that should be confirmed by a healthcare professional.
    
    Keep your response concise (3-4 sentences) and end by recommending they speak with a healthcare professional.
    `;
}

// User Information Form Handler
document.getElementById('userInfoForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userInfo = {
        name: document.getElementById('name').value,
        age: parseInt(document.getElementById('age').value),
        gender: document.getElementById('gender').value,
        country: document.getElementById('country').value,
        state: document.getElementById('state').value,
    };
    
    showStage('symptomsStage');
});

// Symptoms Management
document.getElementById('addSymptom').addEventListener('click', function() {
    const symptomInput = document.getElementById('symptom');
    const symptom = symptomInput.value.trim();
    
    if (symptom) {
        currentSymptoms.push(symptom);
        updateSymptomsList();
        symptomInput.value = '';
        document.getElementById('analyzeSymptoms').disabled = false;
    }
});

function updateSymptomsList() {
    const list = document.querySelector('#symptomsList ul');
    list.innerHTML = '';
    
    currentSymptoms.forEach((symptom, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${symptom}
            <button onclick="removeSymptom(${index})">Remove</button>
        `;
        list.appendChild(li);
    });
}

function removeSymptom(index) {
    currentSymptoms.splice(index, 1);
    updateSymptomsList();
    if (currentSymptoms.length === 0) {
        document.getElementById('analyzeSymptoms').disabled = true;
    }
}

// Analysis Handler
document.getElementById('analyzeSymptoms').addEventListener('click', async function() {
    showStage('resultsStage');
    await analyzeSymptoms();
});

async function analyzeSymptoms() {
    const prompt = `
    Patient Information:
    - Age: ${document.getElementById('age').value}
    - Gender: ${document.getElementById('gender').value}
    - Location: ${document.getElementById('state').value}, ${document.getElementById('country').value}
    
    Reported Symptoms:
    ${currentSymptoms.join(', ')}
    
    Based on these symptoms, what are the possible conditions? Also suggest if any other relevant symptoms should be checked. 
    Format the response as follows:
    1. Possible Conditions (list top 3 most likely conditions)
    2. Additional Symptoms to Check (list 2-3 most relevant symptoms to ask about)
    3. Recommendation (include a medical disclaimer)
    `;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        const data = await response.json();
        console.log('API Response:', data); // For debugging

        if (data.error) {
            throw new Error(data.error.message || 'API request failed');
        }

        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
            displayResults(data.candidates[0].content.parts[0].text);
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Error:', error);
        displayResults('Error: ' + error.message);
    }
}

function displayResults(analysisText) {
    if (!analysisText || analysisText.includes('Error')) {
        document.getElementById('conditions').innerHTML = `<h3>Possible Conditions:</h3><p>${analysisText || 'Error analyzing symptoms'}</p>`;
        document.getElementById('additionalSymptoms').innerHTML = `<h3>Additional Symptoms to Check:</h3><p>Unable to provide suggestions at this time</p>`;
        document.getElementById('recommendations').innerHTML = `<h3>Recommendations:</h3><p>Please try again or consult with a healthcare professional</p>`;
        return;
    }

    // Split the analysis into sections based on markers
    const sections = analysisText.split(/(?:Possible Conditions|Additional Symptoms to Check|Recommendations):/i).map(section => section.trim());
    
    document.getElementById('conditions').innerHTML = `<h3>Possible Conditions:</h3><p>${sections[1] || 'No conditions found'}</p>`;
    document.getElementById('additionalSymptoms').innerHTML = `<h3>Additional Symptoms to Check:</h3><p>${sections[2] || 'No additional symptoms suggested'}</p>`;
    document.getElementById('recommendations').innerHTML = `<h3>Recommendations:</h3><p>${sections[3] || 'Please consult with a healthcare professional for proper diagnosis'}</p>`;
}

// Start Over Handler
document.getElementById('startOver').addEventListener('click', function() {
    currentSymptoms = [];
    document.getElementById('userInfoForm').reset();
    document.querySelector('#symptomsList ul').innerHTML = '';
    document.getElementById('analyzeSymptoms').disabled = true;
    showStage('userInfoStage');
});

// Stage management
function showStage(stageId) {
    document.querySelectorAll('.stage').forEach(stage => stage.classList.remove('active'));
    document.getElementById(stageId).classList.add('active');
}
