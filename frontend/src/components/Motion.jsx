import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useScroll, useSpring } from "framer-motion";
import { useLocation } from "react-router-dom";

/** Hiệu ứng chuyển trang: mỗi lần đổi đường dẫn, nội dung trượt nhẹ lên và hiện dần. */
export function PageTransition({ children }) {
  const { pathname } = useLocation();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Thanh tiến trình cuộn trang ở mép trên màn hình. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-gradient-to-r from-primary-500 via-accent-500 to-sunset-400"
    />
  );
}

/** Nút cuộn lên đầu trang, chỉ hiện khi đã cuộn xuống đủ xa. */
export function BackToTop({ side = "right" }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.button
      aria-label="Lên đầu trang"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      initial={false}
      animate={visible ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.6, y: 20 }}
      whileHover={{ scale: 1.1, y: -3 }}
      whileTap={{ scale: 0.92 }}
      className={`fixed bottom-6 ${side === "left" ? "left-6" : "right-6"} z-40 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-accent-500 text-lg text-white shadow-card-hover ${
        visible ? "" : "pointer-events-none"
      }`}
    >
      ↑
    </motion.button>
  );
}

/** Số đếm tăng dần từ 0 khi phần tử lọt vào khung nhìn. */
export function CountUp({ value, format = (v) => Math.round(v).toLocaleString("vi-VN"), duration = 1.2 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);
  const target = Number(value) || 0;

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, target, { duration, ease: [0.22, 1, 0.36, 1], onUpdate: setDisplay });
    return () => controls.stop();
  }, [inView, target, duration]);

  return <span ref={ref}>{format(display)}</span>;
}
