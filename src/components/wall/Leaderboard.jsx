import React from "react";
import { motion } from "framer-motion";

const TOP3_COLORS = ["#FEF3C7", "#FCE7F3", "#DBEAFE"];
const TOP3_LABELS = [
  { badge: "🏆 #1 — the one to beat", badgeBg: "#F59E0B", rank: "#1" },
  { badge: "#2", badgeBg: "#6B7280", rank: "#2" },
  { badge: "#3", badgeBg: "#F97316", rank: "#3" },
];

export default function Leaderboard({ submissions }) {
  const sorted = [...submissions]
    .sort((a, b) => (b.total_score || 0) - (a.total_score || 0))
    .slice(0, 10);

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  if (!sorted.length) {
    return (
      <div className="text-center py-20 text-foreground/40" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        No submissions yet. Be the first!
      </div>
    );
  }

  return (
    <section className="w-full bg-[#f7f6f3] py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl md:text-5xl text-foreground text-center mb-2 leading-tight"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          Leaderboard
        </motion.h2>
        <p className="text-center text-[13px] text-foreground/40 mb-12" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          The most trusted, thought-provoking, and delightfully unhinged answers.
        </p>

        {/* Top 3 podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 items-end">
          {/* #2 first on desktop for podium effect */}
          {[1, 0, 2].map((idx) => {
            const s = top3[idx];
            if (!s) return <div key={idx} />;
            const meta = TOP3_LABELS[idx];
            const isFirst = idx === 0;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`relative rounded-2xl p-6 ${isFirst ? "shadow-lg scale-105 origin-bottom" : "shadow-sm"}`}
                style={{ backgroundColor: TOP3_COLORS[idx] }}
              >
                {/* Badge */}
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-white text-[11px] font-semibold whitespace-nowrap"
                  style={{ backgroundColor: meta.badgeBg, fontFamily: "'DM Sans', sans-serif" }}
                >
                  {isFirst ? meta.badge : meta.rank}
                </div>

                <p
                  className={`text-foreground leading-snug mb-3 ${isFirst ? "text-xl" : "text-lg"}`}
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  "{s.answer}"
                </p>
                <p className="text-[12px] text-foreground/50 mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  — {s.alias || "anonymous"}
                </p>
                <div className="flex items-center gap-3 text-[12px] text-foreground/60 mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  <span>🚨 {s.votes_unhinged || 0}</span>
                  <span>🧠 {s.votes_think || 0}</span>
                  <span>🤝 {s.votes_trust || 0}</span>
                </div>
                <p className="text-[11px] uppercase tracking-widest text-foreground/40" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {(s.total_score || 0).toLocaleString()} total votes
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Rows #4–#10 */}
        <div className="bg-white rounded-2xl overflow-hidden border border-black/5 shadow-sm">
          {rest.map((s, i) => {
            const rank = i + 4;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex items-center gap-4 px-6 py-4 border-b border-black/5 last:border-0 hover:bg-black/[0.015] transition-colors"
              >
                <span
                  className="text-lg text-foreground/25 w-8 shrink-0 italic"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  #{rank}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-[14px] text-foreground font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    "{s.answer}"
                  </span>
                  {s.alias && (
                    <span className="text-[12px] text-foreground/35 ml-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      — {s.alias}
                    </span>
                  )}
                </div>
                <div className="hidden md:flex items-center gap-3 text-[12px] text-foreground/50 shrink-0" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  <span>🚨 {s.votes_unhinged || 0}</span>
                  <span>🧠 {s.votes_think || 0}</span>
                  <span>🤝 {s.votes_trust || 0}</span>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <div className="text-[18px] font-bold text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {(s.total_score || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-foreground/35 uppercase tracking-wider" style={{ fontFamily: "'DM Sans', sans-serif" }}>votes</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}