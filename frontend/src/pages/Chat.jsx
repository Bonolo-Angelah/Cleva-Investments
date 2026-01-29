import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiMic, FiMicOff, FiCheckCircle, FiTarget, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { useChatStore } from '../utils/store';
import socketService from '../services/socket';
import { chatAPI } from '../services/api';

// Format markdown-like text to JSX
const formatMessage = (text) => {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let currentList = [];
  let listKey = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} className="list-disc list-inside space-y-1 my-2">
          {currentList.map((item, idx) => (
            <li key={idx} className="text-sm">{item}</li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, idx) => {
    // Handle headings
    if (line.startsWith('### ')) {
      flushList();
      const text = line.substring(4);
      elements.push(<h3 key={idx} className="text-base font-semibold mt-3 mb-2">{text}</h3>);
    } else if (line.startsWith('## ')) {
      flushList();
      const text = line.substring(3);
      elements.push(<h2 key={idx} className="text-lg font-bold mt-3 mb-2">{text}</h2>);
    } else if (line.startsWith('# ')) {
      flushList();
      const text = line.substring(2);
      elements.push(<h1 key={idx} className="text-xl font-bold mt-3 mb-2">{text}</h1>);
    }
    // Handle bullet points
    else if (line.match(/^[•\-\*]\s+/)) {
      const text = line.replace(/^[•\-\*]\s+/, '');
      currentList.push(formatInlineMarkdown(text));
    }
    // Handle numbered lists
    else if (line.match(/^\d+\.\s+/)) {
      flushList();
      const text = line.replace(/^\d+\.\s+/, '');
      if (currentList.length === 0) {
        elements.push(<ol key={`ol-${idx}`} className="list-decimal list-inside space-y-1 my-2"></ol>);
      }
      currentList.push(formatInlineMarkdown(text));
    }
    // Handle empty lines
    else if (line.trim() === '') {
      flushList();
      elements.push(<div key={idx} className="h-2"></div>);
    }
    // Handle regular text
    else {
      flushList();
      elements.push(
        <p key={idx} className="text-sm leading-relaxed">
          {formatInlineMarkdown(line)}
        </p>
      );
    }
  });

  flushList();
  return <div className="space-y-1">{elements}</div>;
};

// Format inline markdown (bold, italic, etc.)
const formatInlineMarkdown = (text) => {
  const parts = [];
  let lastIndex = 0;

  // Bold: **text** or __text__
  const boldRegex = /(\*\*|__)(.*?)\1/g;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(<strong key={match.index}>{match[2]}</strong>);
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};

const Chat = () => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [createdGoals, setCreatedGoals] = useState([]);

  const { messages, isLoading, recommendations, marketData, addMessage, setLoading, setRecommendations, setMarketData, clearChat } = useChatStore();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast.error('Voice input error. Please try again.');
        setIsRecording(false);
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    }

    // Load chat history
    loadChatHistory();

    // Scroll to bottom
    scrollToBottom();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const response = await chatAPI.getActiveSession();
      if (response.data.session?.messages) {
        useChatStore.setState({ messages: response.data.session.messages });
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      type: 'text',
      timestamp: new Date()
    };

    addMessage(userMessage);
    setInput('');
    setLoading(true);

    try {
      const response = await socketService.sendMessage(input.trim(), 'text');

      const assistantMessage = {
        role: 'assistant',
        content: response.response,
        type: 'text',
        timestamp: new Date()
      };

      addMessage(assistantMessage);

      if (response.recommendations) {
        setRecommendations(response.recommendations);
      }

      if (response.marketData) {
        setMarketData(response.marketData);
      }

      // Handle goal creation
      if (response.goalCreated && response.goal) {
        setCreatedGoals(prev => [...prev, response.goal]);
        toast.success(
          <div>
            <strong>Goal Created!</strong>
            <p className="text-sm mt-1">{response.goal.title}</p>
          </div>,
          {
            icon: '🎯',
            autoClose: 5000
          }
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');

      const errorMessage = {
        role: 'assistant',
        content: "I'm having trouble processing your request. Please try again or consult a financial advisor.",
        type: 'text',
        timestamp: new Date()
      };
      addMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!recognition) {
      toast.error('Voice input is not supported in your browser.');
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
      toast.info('Listening... Speak now!');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    if (messages.length === 0) {
      toast.info('Chat is already empty.');
      return;
    }

    if (window.confirm('Are you sure you want to clear all messages? This cannot be undone.')) {
      clearChat();
      setCreatedGoals([]);
      toast.success('Chat cleared successfully!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 h-[calc(100vh-80px)]">
      <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">Cleva AI Assistant</h1>
              <p className="text-sm text-gray-600 mt-1">
                Ask me anything about investments, market trends, or your financial goals
              </p>
              <p className="text-xs text-primary-600 mt-1 font-medium">
                💡 Tip: Tell me your goals (e.g., "I want to save R100,000 for a car in 5 years") and I'll automatically create them for you!
              </p>
            </div>
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                title="Clear conversation"
              >
                <FiTrash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Clear Chat</span>
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-4">
                Ask me about investment opportunities, market analysis, or get personalized
                recommendations based on your financial goals.
              </p>
              <div className="max-w-2xl mx-auto mt-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Try saying:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-left">
                    <p className="text-sm text-gray-700">"I want to buy a house and need R500,000 in 10 years"</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-left">
                    <p className="text-sm text-gray-700">"Help me save R50,000 for my child's education in 5 years"</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 text-left">
                    <p className="text-sm text-gray-700">"What are the best investments for retirement?"</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 text-left">
                    <p className="text-sm text-gray-700">"I need an emergency fund of R100,000 in 2 years"</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.role === 'user' ? (
                  <p className="text-sm">{message.content}</p>
                ) : (
                  formatMessage(message.content)
                )}
                <span className="text-xs opacity-70 mt-2 block">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Goals Created, Recommendations & Market Data */}
        {(createdGoals.length > 0 || recommendations.length > 0 || marketData.length > 0) && (
          <div className="border-t px-6 py-4 bg-gray-50">
            {/* Created Goals */}
            {createdGoals.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FiTarget className="mr-1" />
                  Goals Created in This Conversation
                </h4>
                <div className="space-y-2">
                  {createdGoals.map((goal, idx) => (
                    <Link
                      key={idx}
                      to="/goals"
                      className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg border border-green-200 hover:border-green-400 transition-colors block"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <FiCheckCircle className="text-green-600" />
                            <p className="font-semibold text-gray-800">{goal.title}</p>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Target: R{parseFloat(goal.targetAmount).toLocaleString()} by{' '}
                            {new Date(goal.targetDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Monthly: R{parseFloat(goal.monthlyContribution).toLocaleString()}
                          </p>
                        </div>
                        <span className="text-xs text-green-600 font-medium">View Details →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {marketData.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Market Data</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {marketData.slice(0, 3).map((data, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">{data.symbol}</p>
                          <p className="text-xs text-gray-500">{data.name}</p>
                        </div>
                        <span className={`text-sm font-semibold ${
                          data.priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {data.priceChangePercent >= 0 ? '+' : ''}
                          {data.priceChangePercent?.toFixed(2)}%
                        </span>
                      </div>
                      <p className="text-lg font-bold text-gray-800 mt-1">
                        R{data.currentPrice?.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Personalized Recommendations
                </h4>
                <div className="flex flex-wrap gap-2">
                  {recommendations.slice(0, 5).map((rec, idx) => (
                    <div key={idx} className="bg-white px-3 py-1 rounded-full border text-sm">
                      {rec.symbol} - {rec.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input */}
        <div className="border-t px-6 py-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleVoiceInput}
              disabled={isLoading}
              className={`p-3 rounded-lg transition-colors ${
                isRecording
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isRecording ? <FiMicOff className="w-5 h-5" /> : <FiMic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              placeholder="Ask about investments, or tell me your financial goals..."
              className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />

            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiSend className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
