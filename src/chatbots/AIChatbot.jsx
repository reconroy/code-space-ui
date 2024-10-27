import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaTimes } from 'react-icons/fa';
import { HfInference } from '@huggingface/inference';

const AIChatbot = ({ isDarkMode, code }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const hf = new HfInference(import.meta.env.VITE_HUGGINGFACE_API_KEY);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await hf.textGeneration({
        model: 'gpt2',
        inputs: `Code: ${code}\n\nQuestion: ${input}\n\nAnswer:`,
        parameters: {
          max_new_tokens: 250,
          temperature: 0.7,
          top_p: 0.95,
          repetition_penalty: 1.2,
        },
      });

      const aiMessage = { text: response.generated_text.trim(), sender: 'ai' };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling Hugging Face API:', error);
      const errorMessage = { text: "Sorry, I couldn't process that request. Please try again.", sender: 'ai' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        className={`fixed bottom-20 right-4 p-3 rounded-full ${isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'} z-10`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaRobot size={24} />
      </button>
      {isOpen && (
        <div className={`fixed bottom-36 right-4 w-80 h-96 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} rounded-lg shadow-lg flex flex-col z-10`}>
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-bold">AI Assistant</h3>
            <button onClick={() => setIsOpen(false)}><FaTimes /></button>
          </div>
          <div className="flex-grow overflow-auto p-4">
            {messages.map((message, index) => (
              <div key={index} className={`mb-2 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <span className={`inline-block p-2 rounded-lg ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                  {message.text}
                </span>
              </div>
            ))}
            {isLoading && <div className="text-center">AI is thinking...</div>}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black'}`}
              placeholder="Ask about your code..."
            />
          </form>
        </div>
      )}
    </>
  );
};

export default AIChatbot;