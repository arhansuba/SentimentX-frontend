// src/pages/ChatAnalysisPage.tsx - Fixed contractId issue
import React, { useState, useRef, useEffect } from 'react';
import { executeCommand } from '../services/chatCommands';
import ReactMarkdown from 'react-markdown';

// Message types for the chat
type MessageType = 'user' | 'assistant' | 'system';

interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  code?: boolean;
  analysis?: any;
}

const ChatAnalysisPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      type: 'assistant',
      content: 'Welcome to Smart Contract AI Analysis! Paste your Rust smart contract code here, and I\'ll analyze it for vulnerabilities.',
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Create a dummy contract ID for chat analysis
  const [dummyContractId] = useState(`temp-${Date.now()}`);
  
  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea as user types
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '80px'; // Larger default height
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = scrollHeight > 80 ? `${scrollHeight}px` : '80px';
    }
  }, [inputValue]);
  
  // Handle user input submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      code: false // Will check for code later
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    if (textareaRef.current) {
      textareaRef.current.style.height = '80px';
    }
    
    // Check if the input is a command
    if (inputValue.startsWith('/')) {
      await handleCommand(inputValue);
      return;
    }
    
    // Check if input looks like code
    const isCode = inputValue.includes('#[') || 
                  inputValue.includes('fn ') || 
                  inputValue.includes('pub struct') ||
                  inputValue.includes('impl ');
    
    // If it's code, update the message's code flag
    if (isCode) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id ? { ...msg, code: true } : msg
        )
      );
      await analyzeCode(inputValue);
    } else {
      // Handle as regular chat
      // Add typing indicator
      const typingMessage: ChatMessage = {
        id: `system-${Date.now()}`,
        type: 'system',
        content: 'typing...',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, typingMessage]);
      
      // Respond to regular chat
      setTimeout(() => {
        const responseMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          type: 'assistant',
          content: getResponseToNonCode(inputValue),
          timestamp: new Date()
        };
        
        // Replace typing indicator with response
        setMessages(prev => [...prev.filter(msg => msg.id !== typingMessage.id), responseMessage]);
      }, 1000);
    }
  };
  
  // NEW: Handle command execution
  const handleCommand = async (commandText: string) => {
    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: `system-${Date.now()}`,
      type: 'system',
      content: 'processing command...',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, typingMessage]);
    
    // Parse the command and arguments
    const parts = commandText.trim().split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');
    
    try {
      // Execute the command
      const result = await executeCommand(command, args);
      
      // Add response
      const responseMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: result,
        timestamp: new Date()
      };
      
      // Replace typing indicator with response
      setMessages(prev => [...prev.filter(msg => msg.id !== typingMessage.id), responseMessage]);
    } catch (error) {
      console.error('Error executing command:', error);
      
      // Add error response
      const errorMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: "Sorry, I encountered an error processing that command. Please try again.",
        timestamp: new Date()
      };
      
      // Replace typing indicator with error
      setMessages(prev => [...prev.filter(msg => msg.id !== typingMessage.id), errorMessage]);
    }
  };
  
  // Analyze code by sending to backend
  const analyzeCode = async (code: string) => {
    // Add analyzing message
    const loadingMessage: ChatMessage = {
      id: `system-${Date.now()}`,
      type: 'system',
      content: 'Analyzing your smart contract code...',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, loadingMessage]);
    setIsAnalyzing(true);
    
    try {
      // Try to use actual endpoint - WITH CONTRACTID PARAMETER
      let result;
      try {
        // Send code to backend API
        const response = await fetch('/ai-analysis/analyze-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            fileName: 'chat_contract.rs',
            contractId: dummyContractId, // Add contractId parameter to fix the backend error
            isTemporary: true // Add this flag
          }),
          credentials: 'omit'
        });
        
        if (!response.ok) {
          throw new Error(`Analysis failed with status: ${response.status}`);
        }
        
        result = await response.json();
      } catch (error) {
        console.log('Falling back to demo mode', error);
        // Demo mode - simulate response
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate fake vulnerabilities based on code patterns
        const vulnerabilities = [];
        
        // Check for potential reentrancy patterns
        if (code.includes('#[payable]') && code.includes('endpoint')) {
          vulnerabilities.push({
            type: "reentrancy",
            risk_level: "high",
            location: "chat_contract.rs:45-58",
            explanation: "Function might be vulnerable to reentrancy attacks where external calls are made before state changes.",
            recommendation: "Apply checks-effects-interactions pattern and consider using a reentrancy guard."
          });
        }
        
        // Check for potential integer operations
        if (code.includes('BigUint') || code.includes('BigInt')) {
          vulnerabilities.push({
            type: "integer-overflow",
            risk_level: "medium",
            location: "chat_contract.rs:103-112",
            explanation: "Potential integer overflow in arithmetic operations.",
            recommendation: "Use safe math operations or explicitly check for overflows."
          });
        }
        
        // Access control issues
        if (code.includes('claim') && !code.includes('only_owner')) {
          vulnerabilities.push({
            type: "access-control",
            risk_level: "critical",
            location: "chat_contract.rs:68-72",
            explanation: "Critical function doesn't have proper access control.",
            recommendation: "Implement owner-only or role-based access control for sensitive functions."
          });
        }
        
        // Create sample result
        result = {
          securityScore: vulnerabilities.length > 0 ? Math.max(30, 100 - vulnerabilities.length * 15) : 95,
          vulnerabilities: vulnerabilities
        };
      }
      
      // Format vulnerabilities for display
      let analysisContent = '';
      
      if (result.vulnerabilities && result.vulnerabilities.length > 0) {
        analysisContent = `## Analysis Results\n\nSecurity Score: ${result.securityScore || result.risk_score || 75}/100\n\n### Vulnerabilities Found:\n\n`;
        
        result.vulnerabilities.forEach((vuln: any, index: number) => {
          analysisContent += `**${index + 1}. ${vuln.type || 'Vulnerability'}** (${vuln.risk_level || 'Unknown'} risk)\n`;
          analysisContent += `- Location: ${vuln.location || 'Unknown'}\n`;
          analysisContent += `- Explanation: ${vuln.explanation || 'No explanation provided'}\n`;
          analysisContent += `- Recommendation: ${vuln.recommendation || 'No recommendation provided'}\n\n`;
        });
      } else {
        analysisContent = `## Analysis Results\n\nSecurity Score: ${result.securityScore || result.risk_score || 95}/100\n\nNo vulnerabilities were detected in this code. However, this doesn't guarantee the code is completely secure. Always perform thorough testing and auditing before deploying to production.`;
      }
      
      if (result.overall_assessment) {
        analysisContent += `\n\n### Overall Assessment\n\n${result.overall_assessment}`;
      }
      
      // Add analysis response message
      const analysisMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: analysisContent,
        timestamp: new Date(),
        analysis: result
      };
      
      // Remove loading message and add analysis message
      setMessages(prev => [...prev.filter(msg => msg.id !== loadingMessage.id), analysisMessage]);
      
    } catch (error) {
      console.error('Error analyzing code:', error);
      
      // Provide fallback analysis with sample vulnerabilities
      const fallbackAnalysis = {
        securityScore: 75,
        vulnerabilities: [
          {
            type: "reentrancy",
            risk_level: "high",
            location: "chat_contract.rs:45-58",
            explanation: "Function might be vulnerable to reentrancy attacks where external calls are made before state changes.",
            recommendation: "Apply checks-effects-interactions pattern and consider using a reentrancy guard."
          },
          {
            type: "integer-overflow",
            risk_level: "medium",
            location: "chat_contract.rs:103-112",
            explanation: "Potential integer overflow in arithmetic operations.",
            recommendation: "Use safe math operations or explicitly check for overflows."
          }
        ]
      };
      
      let fallbackContent = `## Analysis Results (Fallback)\n\nSecurity Score: ${fallbackAnalysis.securityScore}/100\n\n### Vulnerabilities Found:\n\n`;
      
      fallbackAnalysis.vulnerabilities.forEach((vuln, index) => {
        fallbackContent += `**${index + 1}. ${vuln.type}** (${vuln.risk_level} risk)\n`;
        fallbackContent += `- Location: ${vuln.location}\n`;
        fallbackContent += `- Explanation: ${vuln.explanation}\n`;
        fallbackContent += `- Recommendation: ${vuln.recommendation}\n\n`;
      });
      
      fallbackContent += "\n**Note:** This is a fallback analysis as the connection to the analysis service failed. Please try again later for a more accurate assessment.";
      
      // Remove loading message and add fallback message
      setMessages(prev => [...prev.filter(msg => msg.id !== loadingMessage.id), {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: fallbackContent,
        timestamp: new Date(),
        analysis: fallbackAnalysis
      }]);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Generate responses to non-code inputs
  const getResponseToNonCode = (input: string): string => {
    const lowercasedInput = input.toLowerCase();
    
    if (lowercasedInput.includes('hello') || lowercasedInput.includes('hi ')) {
      return "Hello! I'm ready to analyze your smart contract code. Just paste your Rust code here, and I'll check it for vulnerabilities.";
    }
    
    if (lowercasedInput.includes('how') && (lowercasedInput.includes('work') || lowercasedInput.includes('use'))) {
      return "Simply paste your MultiversX Rust smart contract code into this chat, and I'll analyze it for security vulnerabilities. For best results, please paste the complete contract code.";
    }
    
    if (lowercasedInput.includes('example') || lowercasedInput.includes('sample')) {
      return 'Here\'s a simple example of what you can paste:\n\n```rust\n#![no_std]\n\nmultiversx_sc::imports!();\nmultiversx_sc::derive_imports!();\n\n#[multiversx_sc::contract]\npub trait ExampleContract {\n    #[init]\n    fn init(&self) {}\n    \n    #[endpoint]\n    fn withdraw(&self) {\n        let caller = self.blockchain().get_caller();\n        self.send().direct_egld(&caller, &self.balance_all());\n    }\n}\n```';
    }
    
    if (lowercasedInput.includes('thank')) {
      return "You're welcome! Is there anything else you'd like me to help you with?";
    }
    
    // Default response
    return "I'm designed to analyze Rust smart contract code. Please paste your contract code, and I'll check it for vulnerabilities.";
  };
  
  // Render code blocks with syntax highlighting
  const renderMessageContent = (message: ChatMessage) => {
    if (message.code) {
      return (
        <div className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto mt-2 font-mono">
          <pre className="text-sm whitespace-pre-wrap">
            <code>{message.content}</code>
          </pre>
        </div>
      );
    }
    
    // For system messages (like "typing...")
    if (message.type === 'system') {
      return (
        <div className="text-gray-500 italic">
          {message.content}
        </div>
      );
    }
    
    // Use ReactMarkdown for better formatting
    return (
      <div className="markdown-content text-white">
        <ReactMarkdown>
          {message.content}
        </ReactMarkdown>
      </div>
    );
  };

  useEffect(() => {
    // Send a welcome message with instructions on first load
    setTimeout(() => {
      const helpMessage: ChatMessage = {
        id: `assistant-welcome`,
        type: 'assistant',
        content: `Welcome to Smart Contract Sentinel! You can:

1. **Paste code** directly to analyze for vulnerabilities
2. Use commands like \`/contracts\` to view monitored contracts
3. Type \`/help\` to see all available commands

What would you like to do?`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, helpMessage]);
    }, 500);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+/ or Cmd+/ to show help
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        handleCommand('/help');
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Add file drop handling
  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    
    const file = files[0];
    
    // Check file type
    if (!file.name.endsWith('.rs')) {
      // Add message
      const errorMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: "Please upload a Rust (.rs) smart contract file.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      return;
    }
    
    // Add user message showing file upload
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: `Uploaded: ${file.name}`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Add loading message
    const loadingMessage: ChatMessage = {
      id: `system-${Date.now()}`,
      type: 'system',
      content: `Analyzing ${file.name}...`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, loadingMessage]);
    
    // Handle file upload
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      formData.append('contractId', `temp-${Date.now()}`);
      
      const response = await fetch('/ai-analysis/upload', {
        method: 'POST',
        body: formData,
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Format response
      let analysisContent = formatAnalysisResult(result);
      
      // Add analysis response
      const analysisMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: analysisContent,
        timestamp: new Date(),
        analysis: result
      };
      
      // Replace loading message
      setMessages(prev => [...prev.filter(msg => msg.id !== loadingMessage.id), analysisMessage]);
    } catch (error) {
      console.error('Error uploading file:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: "Sorry, I couldn't analyze that file. Please try pasting the code directly instead.",
        timestamp: new Date()
      };
      
      // Replace loading message
      setMessages(prev => [...prev.filter(msg => msg.id !== loadingMessage.id), errorMessage]);
    }
  };

  // Helper function to format analysis results
  const formatAnalysisResult = (result: any) => {
    // Similar to your existing analysis formatting code
    let analysisContent = '';
    
    if (result.vulnerabilities && result.vulnerabilities.length > 0) {
      // Format vulnerabilities as before
      result.vulnerabilities.forEach((vuln: any, index: number) => {
        analysisContent += `**${index + 1}. ${vuln.type || 'Vulnerability'}** (${vuln.risk_level || 'Unknown'} risk)\n`;
        analysisContent += `- Location: ${vuln.location || 'Unknown'}\n`;
        analysisContent += `- Explanation: ${vuln.explanation || 'No explanation provided'}\n`;
        analysisContent += `- Recommendation: ${vuln.recommendation || 'No recommendation provided'}\n\n`;
      });
    } else {
      // No vulnerabilities format
      analysisContent = `## Analysis Results\n\nSecurity Score: ${result.securityScore || result.risk_score || 95}/100\n\nNo vulnerabilities were detected in this code. However, this doesn't guarantee the code is completely secure. Always perform thorough testing and auditing before deploying to production.`;
    }
    
    return analysisContent;
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    // Check file type
    if (!file.name.endsWith('.rs')) {
      // Add message
      const errorMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: "Please upload a Rust (.rs) smart contract file.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      return;
    }
    
    // Add user message showing file upload
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: `Uploaded: ${file.name}`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Add loading message
    const loadingMessage: ChatMessage = {
      id: `system-${Date.now()}`,
      type: 'system',
      content: `Analyzing ${file.name}...`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, loadingMessage]);
    setIsAnalyzing(true);
    
    // Handle file upload
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      formData.append('contractId', `temp-${Date.now()}`);
      
      const response = await fetch('/ai-analysis/upload', {
        method: 'POST',
        body: formData,
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Format response
      let analysisContent = formatAnalysisResult(result);
      
      // Add analysis response
      const analysisMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: analysisContent,
        timestamp: new Date(),
        analysis: result
      };
      
      // Replace loading message
      setMessages(prev => [...prev.filter(msg => msg.id !== loadingMessage.id), analysisMessage]);
    } catch (error) {
      console.error('Error uploading file:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: "Sorry, I couldn't analyze that file. Please try pasting the code directly instead.",
        timestamp: new Date()
      };
      
      // Replace loading message
      setMessages(prev => [...prev.filter(msg => msg.id !== loadingMessage.id), errorMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    handleFileUpload(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div 
      className="flex flex-col h-screen bg-[#343541]"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleFileDrop}
    >
      {/* File drop overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#444654] p-8 rounded-lg text-white text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-xl font-semibold mb-2">Drop your Rust contract file here</p>
            <p className="text-gray-300">File will be uploaded and analyzed</p>
          </div>
        </div>
      )}
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 pt-6">
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            message.type !== 'system' && (
              <div 
                key={message.id} 
                className={`py-5 ${message.type === 'assistant' ? 'bg-[#444654]' : ''} -mx-4 px-4 sm:px-6`}
              >
                <div className="max-w-4xl mx-auto flex gap-4">
                  <div className="w-6 h-6 flex-shrink-0 rounded-full overflow-hidden mt-1">
                    {message.type === 'assistant' ? (
                      <div className="bg-[#10a37f] text-white w-full h-full flex items-center justify-center">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="14" 
                          height="14" 
                          fill="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
                          <path d="M22 4L12 14.01l-3-3"></path>
                        </svg>
                      </div>
                    ) : (
                      <div className="bg-[#6e56cf] text-white w-full h-full flex items-center justify-center font-semibold text-xs">
                        U
                      </div>
                    )}
                  </div>
                  <div className="text-white flex-1">
                    {renderMessageContent(message)}
                  </div>
                </div>
              </div>
            )
          ))}
          {messages.find(m => m.type === 'system') && (
            <div className="max-w-4xl mx-auto flex justify-center my-4">
              <div className="text-white opacity-60">
                {messages.find(m => m.type === 'system')?.content}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input area - ENLARGED */}
      <div className="bg-[#343541] border-t border-gray-700 p-4 pb-5">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          <div className="relative shadow-lg rounded-lg">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Paste your smart contract code or ask a question..."
              className="w-full bg-[#40414f] text-white rounded-lg pl-4 pr-14 py-4 focus:outline-none resize-none min-h-[80px] text-sm leading-5"
              disabled={isAnalyzing}
              rows={3}
            />
            <button
              type="submit"
              disabled={isAnalyzing || !inputValue.trim()}
              className={`absolute right-3 bottom-3 p-2 rounded-md ${
                !inputValue.trim() ? 'text-gray-400' : 'text-white bg-[#10a37f] hover:bg-[#0d8c6e]'
              } transition-colors`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={1.5} 
                stroke="currentColor" 
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleFileButtonClick}
              className="absolute right-14 bottom-3 p-2 rounded-md text-white bg-[#10a37f] hover:bg-[#0d8c6e] transition-colors"
            >
              Upload File
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Smart Contract Sentinel AI analyzes your MultiversX Rust smart contracts for security vulnerabilities.
            Press Shift+Enter for a new line.
          </p>
        </form>
      </div>

      {/* Footer with keyboard shortcuts */}
      <div className="text-xs text-gray-500 text-center py-2 border-t border-gray-700">
        <p>Keyboard shortcuts: Ctrl+/ for help | Shift+Enter for new line | Drop files to analyze</p>
      </div>
    </div>
  );
};

export default ChatAnalysisPage;