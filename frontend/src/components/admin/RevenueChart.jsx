import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

// Biểu đồ vùng một chuỗi (doanh thu theo ngày): một màu, lưới mờ, đường dóng + tooltip khi rê chuột.
const W = 720;
const H = 240;
const PAD = { top: 16, right: 16, bottom: 28, left: 56 };
const COLOR = "#2554ea";

const shortMoney = (v) => (v >= 1e6 ? `${(v / 1e6).toFixed(1)}tr` : v >= 1e3 ? `${Math.round(v / 1e3)}k` : `${v}`);

export default function RevenueChart({ from, to, points }) {
  const svgRef = useRef(null);
  const [hover, setHover] = useState(null);

  // điền đủ mọi ngày trong khoảng, ngày không có giao dịch = 0
  const series = useMemo(() => {
    const map = Object.fromEntries((points || []).map((p) => [p.date, Number(p.total)]));
    const out = [];
    for (let d = new Date(from); d <= new Date(to); d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      out.push({ date: key, value: map[key] || 0 });
    }
    return out;
  }, [from, to, points]);

  const max = Math.max(1, ...series.map((p) => p.value));
  const niceMax = Math.ceil(max / 10000) * 10000 || 10000;
  const iw = W - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;
  const x = (i) => PAD.left + (series.length <= 1 ? 0 : (i / (series.length - 1)) * iw);
  const y = (v) => PAD.top + ih - (v / niceMax) * ih;

  const line = series.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const area = `${line} L${x(series.length - 1)},${PAD.top + ih} L${x(0)},${PAD.top + ih} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * niceMax);
  const labelEvery = Math.ceil(series.length / 7);

  const onMove = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - PAD.left) / iw) * (series.length - 1));
    setHover(i >= 0 && i < series.length ? i : null);
  };

  const fmtDay = (key) => key.slice(8, 10) + "/" + key.slice(5, 7);
  const total = series.reduce((s, p) => s + p.value, 0);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full touch-none"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label={`Doanh thu theo ngày, tổng ${total.toLocaleString("vi-VN")} đồng`}
      >
        <defs>
          <linearGradient id="rev-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={COLOR} stopOpacity="0.22" />
            <stop offset="100%" stopColor={COLOR} stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="#e5e7eb" strokeDasharray={t ? "3 4" : undefined} />
            <text x={PAD.left - 10} y={y(t)} textAnchor="end" dominantBaseline="middle" className="fill-gray-400 text-[11px]">
              {shortMoney(t)}
            </text>
          </g>
        ))}
        {series.map((p, i) =>
          i % labelEvery === 0 ? (
            <text key={p.date} x={x(i)} y={H - 8} textAnchor="middle" className="fill-gray-400 text-[11px]">
              {fmtDay(p.date)}
            </text>
          ) : null
        )}

        <motion.path d={area} fill="url(#rev-fill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }} />
        <motion.path
          d={line}
          fill="none"
          stroke={COLOR}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />

        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + ih} stroke="#9ca3af" strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(series[hover].value)} r="5" fill={COLOR} stroke="#fff" strokeWidth="2" />
          </g>
        )}
      </svg>

      {hover !== null && (
        <div
          className="pointer-events-none absolute top-2 z-10 -translate-x-1/2 rounded-xl bg-gray-900 px-3 py-2 text-xs text-white shadow-xl"
          style={{ left: `${(x(hover) / W) * 100}%` }}
        >
          <p className="text-gray-300">Ngày {fmtDay(series[hover].date)}</p>
          <p className="font-bold">{series[hover].value.toLocaleString("vi-VN")}đ</p>
        </div>
      )}
    </div>
  );
}
