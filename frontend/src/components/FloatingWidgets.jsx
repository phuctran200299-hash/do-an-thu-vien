import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { aiSearchApi } from "../api/ai";
import { CONTACT } from "../config";

const STORAGE_KEY = "ai_chat_history";
const SUGGESTIONS = ["Sách lập trình cho người mới", "Tiểu thuyết trinh thám hay", "Sách giúp quản lý tài chính", "Truyện thiếu nhi kinh điển"];
const GREETING = {
  role: "bot",
  text: "Xin chào! 👋 Mình là trợ lý AI của Thư Viện Thông Minh. Bạn đang muốn tìm sách về chủ đề gì? Cứ mô tả tự nhiên, mình sẽ gợi ý ngay nhé!",
};

const loadHistory = () => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) && saved.length ? saved : [GREETING];
  } catch {
    return [GREETING];
  }
};

function ZaloIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-7 w-7" aria-hidden="true">
      <path
        fill="#fff"
        d="M24 6C13 6 4 13.4 4 22.6c0 5.3 3 10 7.6 13l-1.2 5.3c-.2.8.7 1.4 1.4 1l6.1-3.4c2 .5 4 .8 6.1.8 11 0 20-7.4 20-16.6S35 6 24 6z"
      />
      <text x="24" y="27" textAnchor="middle" fontSize="11" fontWeight="800" fill="#0068ff" fontFamily="Arial, sans-serif">
        Zalo
      </text>
    </svg>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-1 px-1 py-1.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-gray-400"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

function ChatPanel({ onClose }) {
  const [messages, setMessages] = useState(loadHistory);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    } catch {
      // trình duyệt chặn lưu trữ thì vẫn chat bình thường, chỉ không giữ lịch sử
    }
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const ask = async (text) => {
    const query = text.trim();
    if (!query || typing) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: query }]);
    setTyping(true);
    try {
      const res = await aiSearchApi(query);
      const results = res.data.results || [];
      const books = results.slice(0, 4).map((r) => ({
        id: r.book.id,
        title: r.book.title,
        cover: r.book.cover_image,
        author: r.book.authors?.map((a) => a.name).join(", "),
        reason: r.reason,
        available: r.book.available_quantity > 0,
      }));
      setMessages((m) => [
        ...m,
        results.length
          ? { role: "bot", text: `Mình tìm được ${results.length} cuốn phù hợp. Đây là những gợi ý nổi bật nhất:`, books, query }
          : { role: "bot", text: res.data.message || "Mình chưa tìm thấy sách phù hợp 😥 Bạn thử mô tả cụ thể hơn, ví dụ tên tác giả hoặc thể loại nhé!" },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "bot", text: "Xin lỗi, hệ thống đang bận. Bạn vui lòng thử lại sau giây lát nhé!" }]);
    } finally {
      setTyping(false);
    }
  };

  const reset = () => setMessages([GREETING]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.94 }}
      transition={{ type: "spring", stiffness: 360, damping: 30 }}
      style={{ transformOrigin: "bottom right" }}
      className="fixed bottom-24 right-4 z-50 flex h-[min(600px,calc(100vh-8rem))] w-[calc(100vw-2rem)] max-w-[390px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 sm:right-6"
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600 px-5 py-4 text-white">
        <div className="blob -right-10 -top-10 h-32 w-32 bg-accent-300" />
        <div className="relative flex items-center gap-3">
          <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Bot size={22} />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-primary-600 bg-emerald-400" />
          </span>
          <div className="flex-1">
            <p className="font-bold">Trợ lý AI Thư viện</p>
            <p className="text-xs text-white/75">Đang trực tuyến · Gợi ý sách tức thì</p>
          </div>
          <button onClick={reset} className="rounded-lg px-2 py-1 text-[11px] font-semibold text-white/80 hover:bg-white/10" title="Cuộc trò chuyện mới">
            Làm mới
          </button>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/10" aria-label="Đóng">
            <X size={18} />
          </button>
        </div>
      </div>

      <div ref={bodyRef} className="flex-1 space-y-3 overflow-y-auto bg-gray-50 px-4 py-4">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start gap-2"}`}
          >
            {m.role === "bot" && (
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white">
                <Sparkles size={14} />
              </span>
            )}
            <div className={`max-w-[85%] ${m.role === "user" ? "" : "flex-1"}`}>
              <div
                className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "rounded-br-md bg-gradient-to-br from-primary-600 to-primary-500 text-white"
                    : "rounded-tl-md bg-white text-gray-700 shadow-sm ring-1 ring-gray-100"
                }`}
              >
                {m.text}
              </div>
              {m.books && (
                <div className="mt-2 space-y-2">
                  {m.books.map((b) => (
                    <Link
                      key={b.id}
                      to={`/sach/${b.id}`}
                      className="flex gap-3 rounded-xl bg-white p-2 shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-primary-200"
                    >
                      <span className="h-16 w-11 shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-primary-100 to-accent-100">
                        {b.cover && <img src={b.cover} alt="" className="h-full w-full object-cover" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-semibold text-gray-900">{b.title}</p>
                        <p className="line-clamp-1 text-xs text-gray-500">{b.author}</p>
                        <p className="mt-0.5 line-clamp-1 text-[11px] text-primary-600">✨ {b.reason}</p>
                        <span className={`mt-1 inline-block text-[10px] font-bold ${b.available ? "text-emerald-600" : "text-rose-500"}`}>
                          {b.available ? "● Còn sách" : "● Hết sách - có thể đặt trước"}
                        </span>
                      </div>
                    </Link>
                  ))}
                  <Link to={`/tim-kiem-ai?q=${encodeURIComponent(m.query)}`} className="block text-center text-xs font-semibold text-primary-600 hover:underline">
                    Xem tất cả kết quả →
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {typing && (
          <div className="flex gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white">
              <Sparkles size={14} />
            </span>
            <div className="rounded-2xl rounded-tl-md bg-white px-3 shadow-sm ring-1 ring-gray-100">
              <TypingDots />
            </div>
          </div>
        )}

        {messages.length === 1 && !typing && (
          <div className="flex flex-wrap gap-2 pl-9">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => ask(s)}
                className="rounded-full border border-primary-200 bg-white px-3 py-1.5 text-xs font-medium text-primary-700 transition hover:bg-primary-600 hover:text-white"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="flex items-center gap-2 border-t border-gray-100 bg-white p-3"
      >
        <input
          className="flex-1 rounded-full bg-gray-100 px-4 py-2.5 text-sm outline-none ring-primary-200 transition focus:bg-white focus:ring-4"
          placeholder="Nhập câu hỏi, ví dụ: sách về thói quen..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={!input.trim() || typing}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-accent-500 text-white shadow-soft transition hover:scale-105 active:scale-95 disabled:opacity-40"
          aria-label="Gửi"
        >
          <Send size={17} />
        </button>
      </form>
    </motion.div>
  );
}

export default function FloatingWidgets() {
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState(false);

  // lời mời chat xuất hiện sau vài giây, ẩn khi người dùng đã mở chat
  useEffect(() => {
    const t = setTimeout(() => setHint(true), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <AnimatePresence>{open && <ChatPanel onClose={() => setOpen(false)} />}</AnimatePresence>

      <div className="fixed bottom-6 right-4 z-40 flex flex-col items-end gap-3 sm:right-6">
        <AnimatePresence>
          {hint && !open && (
            <motion.button
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              onClick={() => setOpen(true)}
              className="relative mr-1 max-w-[220px] rounded-2xl rounded-br-md bg-white px-4 py-3 text-left text-sm text-gray-700 shadow-card-hover ring-1 ring-black/5"
            >
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setHint(false);
                }}
                className="absolute -left-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300"
              >
                <X size={11} />
              </span>
              <b className="text-gray-900">Cần tìm sách?</b> Hỏi trợ lý AI ngay 🤖
            </motion.button>
          )}
        </AnimatePresence>

        <motion.a
          href={`https://zalo.me/${CONTACT.zaloPhone}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Liên hệ qua Zalo"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#0068ff] shadow-lg shadow-blue-500/40"
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-[#0068ff] opacity-30" />
          <ZaloIcon />
          <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
            Chat Zalo: {CONTACT.zaloPhone}
          </span>
        </motion.a>

        <motion.button
          onClick={() => {
            setOpen((o) => !o);
            setHint(false);
          }}
          aria-label={open ? "Đóng trợ lý AI" : "Mở trợ lý AI"}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-accent-500 text-white shadow-lg shadow-primary-500/40"
        >
          {!open && <span className="absolute inset-0 rounded-full animate-pulse-ring" />}
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={open ? "x" : "bot"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              {open ? <X size={24} /> : <Bot size={26} />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  );
}
