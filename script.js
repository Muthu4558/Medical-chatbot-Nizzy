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
    // Cancel any ongoing speech
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
    addBotMessage("Nizzy! I'm your AI health assistant. How may I help you today?");
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
    dateInput.style.cssText = `margin: 5px 0; padding: 5px; border: 1px solid #ccc; border-radius: 4px;`;
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
    
    // Name Input
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Full Name";
    nameInput.style.cssText = `background: #f9f9f9; color: #333; padding: 10px; border: 1px solid #ddd; margin-bottom: 10px; border-radius: 5px; display: block; width: 100%; box-sizing: border-box; font-size: 14px;`;
    userInputs["Full Name"] = nameInput;
    detailsContainer.appendChild(nameInput);

    // Age Input
    const ageInput = document.createElement("input");
    ageInput.type = "number";
    ageInput.placeholder = "Age";
    ageInput.max = "999";
    ageInput.style.cssText = `background: #f9f9f9; color: #333; padding: 10px; border: 1px solid #ddd; margin-bottom: 10px; border-radius: 5px; display: block; width: 100%; box-sizing: border-box; font-size: 14px;`;
    userInputs["Age"] = ageInput;
    detailsContainer.appendChild(ageInput);

    // Gender Input
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

    // Mobile Input
    const mobileInput = document.createElement("input");
    mobileInput.type = "number";
    mobileInput.placeholder = "Mobile Number";
    mobileInput.style.cssText = `background: #f9f9f9; color: #333; padding: 10px; border: 1px solid #ddd; margin-bottom: 10px; border-radius: 5px; display: block; width: 100%; box-sizing: border-box; font-size: 14px;`;
    userInputs["Mobile Number"] = mobileInput;
    detailsContainer.appendChild(mobileInput);

    // Submit Button
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
    addBotMessage("I'm here to help. Please describe your health concerns, and I'll provide guidance to the best of my ability.");
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

    addUserMessage(message);
    userInput.value = '';
    showTypingIndicator();

    chatHistory.push({ role: 'user', content: message });

    try {
        const messageType = analyzeMessageType(message);
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
    if (lowerMessage.includes('symptom') || lowerMessage.includes('feel') || lowerMessage.includes('pain') || lowerMessage.includes('hurt')) {
        return 'symptoms';
    } else if (lowerMessage.includes('lifestyle') || lowerMessage.includes('exercise') || lowerMessage.includes('activity')) {
        return 'lifestyle';
    } else if (lowerMessage.includes('diet') || lowerMessage.includes('food') || lowerMessage.includes('eat')) {
        return 'diet';
    } else if (lowerMessage.includes('remedy') || lowerMessage.includes('treatment') || lowerMessage.includes('cure')) {
        return 'remedies';
    }
    return 'general';
}

function createSymptomsPrompt(message) {
    return `
    Analyze these symptoms from an Indian healthcare perspective:
    "${message}"
    
    Provide a very brief response with:
    1. Possible Conditions (2 most likely)
    2. Key Symptoms Noted
    3. Severity (Mild/Moderate/Severe)
    
    Keep it short and clear.
    `;
}

function createLifestylePrompt(message) {
    return `
    Suggest Indian lifestyle modifications for the symptoms:
    Previous context: ${chatHistory.slice(-4).map(msg => msg.content).join(' | ')}
    
    Provide 3 quick tips focusing on:
    - Yoga or exercise
    - Daily routine
    - Rest and relaxation
    
    Keep each point to one line only.
    `;
}

function createDietPrompt(message) {
    return `
    Suggest Indian dietary recommendations for the symptoms:
    Previous context: ${chatHistory.slice(-4).map(msg => msg.content).join(' | ')}
    
    List briefly:
    1. Include (3 Indian foods)
    2. Avoid (2 items)
    3. One spice/herb recommendation
    
    Keep it very short and specific to Indian cuisine.
    `;
}

function createRemediesPrompt(message) {
    return `
    Suggest traditional Indian home remedies:
    Previous context: ${chatHistory.slice(-4).map(msg => msg.content).join(' | ')}
    
    Provide 2-3 simple home remedies using common Indian household ingredients.
    Keep each remedy to one line.
    Include basic Ayurvedic wisdom if relevant.
    `;
}

function createGeneralPrompt(message) {
    return `
    Previous context: ${chatHistory.slice(-4).map(msg => msg.content).join(' | ')}
    Current request: "${message}"
    
    Provide a clear, short response in 1-2 sentences with an Indian healthcare perspective.
    `;
}

function formatResponse(response, type) {
    return response
        .trim()
        .replace(/\n\n+/g, '\n')
        .replace(/^(Note|Remember|Please note|Important):.+$/gm, '')
        .replace(/\*\*/g, '')
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
