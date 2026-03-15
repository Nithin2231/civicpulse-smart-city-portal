import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  text: string;
  isBot: boolean;
}

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I am CivicBot, your Smart City AI Assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setInput('');
    setIsLoading(true);

    try {
      // 1. Get the API Key from your .env file
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error("API Key missing! Please add VITE_GEMINI_API_KEY to your .env file.");
      }

      // 2. The System Prompt (Tells the AI how to behave)
      const systemPrompt = "You are CivicBot, a helpful assistant for the CivicPulse Smart City Portal. You help citizens know how to report grievances (like potholes, water leaks, electricity issues), understand municipal services, and track issues. Keep your answers short, polite, and formatted nicely. Do not use complex markdown.";

      // 3. Call the Google Gemini API directly
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${systemPrompt}\n\nCitizen: ${userMessage}` }]
          }]
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      const botReply = data.candidates[0].content.parts[0].text;
      setMessages(prev => [...prev, { text: botReply, isBot: true }]);

    } catch (error: any) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { text: `Oops! Something went wrong: ${error.message || "Please check your API key."}`, isBot: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {/* The Floating Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[350px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 mb-4">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1e293b] to-[#0f172a] p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <div className="bg-[#00AEEF] p-1.5 rounded-lg"><Bot size={20} /></div>
              <div>
                <h3 className="font-black tracking-widest text-sm uppercase flex items-center gap-1">Civic<span className="text-[#00AEEF]">Bot</span> <Sparkles size={12} className="text-yellow-400"/></h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Smart City AI</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Chat Messages Area */}
          <div className="h-[350px] overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`flex gap-2 max-w-[85%] ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                  
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${msg.isBot ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'}`}>
                    {msg.isBot ? <Bot size={16} /> : <User size={16} />}
                  </div>

                  {/* Bubble */}
                  <div className={`p-3 text-sm shadow-sm ${
                    msg.isBot 
                      ? 'bg-white text-gray-700 rounded-2xl rounded-tl-sm border border-gray-100' 
                      : 'bg-[#00AEEF] text-white rounded-2xl rounded-tr-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about city services..." 
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00AEEF] transition-colors"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-[#1e293b] hover:bg-[#00AEEF] text-white p-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* The Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-[#00AEEF] hover:bg-[#0081C9]'} text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 flex items-center justify-center`}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>
    </div>
  );
};

export default AIChatbot;