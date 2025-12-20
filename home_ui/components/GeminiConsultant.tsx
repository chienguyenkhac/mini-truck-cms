
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

export const GeminiConsultant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })), { role: 'user', parts: [{ text: userMessage }] }],
        config: {
          systemInstruction: `Bạn là trợ lý ảo cao cấp của SINOTRUK HÀ NỘI. 
          Nhiệm vụ: Tư vấn kỹ thuật và gợi ý các dòng xe tải nặng (HOWO, SITRAK, T7H, TH7, G7S) phù hợp với nhu cầu công việc của khách hàng tại Việt Nam.
          Phong cách: Chuyên nghiệp, am hiểu kỹ thuật xe, nhiệt tình, lịch sự.
          Luôn khuyến khích khách hàng đến đại lý tại Hà Nội hoặc gọi hotline 0988.xxx.xxx để có giá tốt nhất.
          Nếu hỏi về giá, hãy nói giá dao động tùy phiên bản và cấu hình, gợi ý để lại số điện thoại hoặc liên hệ trực tiếp.`,
          temperature: 0.7,
        },
      });

      const aiText = response.text || "Xin lỗi, tôi gặp sự cố kết nối. Quý khách vui lòng thử lại sau.";
      setHistory(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setHistory(prev => [...prev, { role: 'model', text: "Tôi không thể trả lời lúc này. Quý khách có thể gọi Hotline 0988.xxx.xxx để được hỗ trợ ngay lập tức." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-up origin-bottom-right">
          <div className="bg-primary p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/20">
                <span className="material-symbols-outlined text-white">smart_toy</span>
              </div>
              <div>
                <h4 className="text-white font-bold leading-none">Chuyên Viên Tư Vấn AI</h4>
                <p className="text-white/60 text-[10px] uppercase font-bold tracking-widest mt-1">Đang trực tuyến</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div ref={scrollRef} className="flex-grow p-5 overflow-y-auto space-y-4 scrollbar-hide">
            {history.length === 0 && (
              <div className="text-center py-10 space-y-3">
                <span className="material-symbols-outlined text-5xl text-gray-700">robot_2</span>
                <p className="text-gray-400 text-sm">Chào quý khách! Tôi có thể giúp gì cho quý khách trong việc lựa chọn xe Sinotruk hôm nay?</p>
              </div>
            )}
            {history.map((h, i) => (
              <div key={i} className={`flex ${h.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${h.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-none'}`}>
                  {h.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border bg-background/50">
            <div className="flex gap-2 bg-white/5 border border-border rounded-2xl p-1">
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Hỏi về kỹ thuật, giá xe..."
                className="flex-grow bg-transparent border-none focus:ring-0 text-white text-sm px-4 py-2"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="bg-primary hover:bg-red-600 disabled:opacity-50 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all"
              >
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative size-16 rounded-full bg-primary flex items-center justify-center text-white shadow-2xl transition-all duration-300 transform ${isOpen ? 'rotate-90 scale-0' : 'hover:scale-110 active:scale-95'}`}
      >
        <span className="material-symbols-outlined text-3xl">chat</span>
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
        </span>
      </button>

      {/* Alternative Button when open */}
      {isOpen && (
        <button 
          onClick={() => setIsOpen(false)}
          className="size-16 rounded-full bg-surface border border-border flex items-center justify-center text-white shadow-2xl animate-fade-in"
        >
          <span className="material-symbols-outlined text-3xl">close</span>
        </button>
      )}
    </div>
  );
};
