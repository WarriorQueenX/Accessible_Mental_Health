// Simulated AI responses - replace with real API later
const RESPONSES = [
  "I hear you. That sounds really tough. Would you like to try a breathing exercise together?",
  "Thank you for sharing. You're not alone in this. How long have you been feeling this way?",
  "It takes courage to talk about these things. What do you think would help you feel better right now?",
  "I'm here with you. Sometimes just talking helps. Would you like to continue?",
  "That sounds exhausting. Have you been able to rest at all today?",
  "I can sense this is really weighing on you. What's one small thing that could make today a little easier?",
  "Thank you for trusting me with this. Would you like some practical suggestions to help you right now?",
  "It's okay to feel this way. You're human, and these feelings are valid.",
];

export async function getAIResponse(message, user, chatHistory) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600));
  
  // Simple keyword-based responses
  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes('neend') || lowerMsg.includes('sleep')) {
    return "🫁 Neend ki problem hai? Aaiye, deep breathing karte hain: 4 seconds inhale, 4 seconds hold, 4 seconds exhale. 3 baar repeat karein. Kya aap try karna chahenge?";
  }
  if (lowerMsg.includes('stress') || lowerMsg.includes('tension') || lowerMsg.includes('pressure')) {
    return "🌿 Kaam ka stress samajh aata hai. Aaj kaam ke baad 5-4-3-2-1 grounding try karein: 5 cheezein dekhein, 4 chhuein, 3 suniye, 2 sunghein, 1 chakhein. Yeh mind ko calm karne mein madad karta hai.";
  }
  if (lowerMsg.includes('alone') || lowerMsg.includes('akela') || lowerMsg.includes('lonely')) {
    return "🤝 Aap akela nahi hain. Bahut log aisa feel karte hain. Kya aap kisi dost ya family member se baat kar sakte hain? Ya hum kisi peer group se connect kar sakte hain?";
  }
  
  // Random fallback response
  const randomResponse = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];
  
  // Add Hinglish translation for some responses
  const hinglishResponses = {
    "I hear you. That sounds really tough.": "Main samajh sakta hoon. Yeh bahut mushkil lagta hai.",
    "Thank you for sharing. You're not alone in this.": "Share karne ke liye shukriya. Aap is mein akele nahi hain.",
    "It takes courage to talk about these things.": "In cheezon ke baare mein baat karne ke liye bahut himmat chahiye.",
  };
  
  for (const [eng, hing] of Object.entries(hinglishResponses)) {
    if (randomResponse.includes(eng)) {
      return randomResponse.replace(eng, hing);
    }
  }
  
  return randomResponse;
}