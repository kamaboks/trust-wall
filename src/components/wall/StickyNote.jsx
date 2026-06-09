import React, { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Siren, Brain, Handshake } from "lucide-react";

const NOTE_STYLES = {
  yellow: { bg: "#FBBF24", text: "#78350F", shadow: "rgba(251,191,36,0.3)" },
  pink: { bg: "#F472B6", text: "#831843", shadow: "rgba(244,114,182,0.3)" },
  blue: { bg: "#60A5FA", text: "#1E3A5F", shadow: "rgba(96,165,250,0.3)" },
  green: { bg: "#34D399", text: "#064E3B", shadow: "rgba(52,211,153,0.3)" },
  orange: { bg: "#FB923C", text: "#7C2D12", shadow: "rgba(251,146,60,0.3)" },
  violet: { bg: "#A78BFA", text: "#3B0764", shadow: "rgba(167,139,250,0.3)" },
  rose: { bg: "#FB7185", text: "#881337", shadow: "rgba(251,113,133,0.3)" },
  cyan: { bg: "#22D3EE", text: "#083344", shadow: "rgba(34,211,238,0.3)" },
  lime: { bg: "#A3E635", text: "#365314", shadow: "rgba(163,230,53,0.3)" },
  amber: { bg: "#FCD34D", text: "#78350F", shadow: "rgba(252,211,77,0.3)" },
};

export default function StickyNote({ submission, onVote, onShare, userVotes, scale = 1 }) {
  const [isHovered, setIsHovered] = useState(false);
  const color = NOTE_STYLES[submission.note_color] || NOTE_STYLES.yellow;
  const rotation = submission.note_rotation || 0;
  const isTop10 = submission.rank > 0 && submission.rank <= 10;

  const voteButtons = [
    { key: "unhinged", icon: Siren, label: "Unhinged", count: submission.votes_unhinged || 0 },
    { key: "think", icon: Brain, label: "Made Me Think", count: submission.votes_think || 0 },
    { key: "trust", icon: Handshake, label: "I'd Do This", count: submission.votes_trust || 0 },
  ];

  return (
    <motion.div
      className="absolute cursor-pointer select-none"
      style={{
        left: submission.note_x,
        top: submission.note_y,
        zIndex: isHovered ? 50 : 1,
      }}
      initial={{ opacity: 0, scale: 0.5, rotate: rotation }}
      animate={{
        opacity: 1,
        scale: isHovered ? 1.08 : 1,
        rotate: isHovered ? 0 : rotation,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative w-[220px] p-4 rounded-sm"
        style={{
          backgroundColor: color.bg,
          color: color.text,
          boxShadow: isHovered
            ? `0 20px 40px ${color.shadow}, 0 0 0 2px rgba(255,255,255,0.1)`
            : `4px 4px 12px rgba(0,0,0,0.3)`,
          transition: "box-shadow 0.3s ease",
        }}
      >
        {/* Tape effect */}
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-5 rounded-sm opacity-40"
          style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
        />

        {/* Rank badge */}
        {isTop10 && (
          <div className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-display font-bold text-xs shadow-lg border-2 border-white/20">
            #{submission.rank}
          </div>
        )}

        {/* Answer */}
        <p className="font-display font-semibold text-sm leading-snug mb-3 break-words" style={{ color: color.text }}>
          "{submission.answer}"
        </p>

        {/* Alias */}
        {submission.alias && (
          <p className="text-xs opacity-60 mb-3 font-body" style={{ color: color.text }}>
            — {submission.alias}
          </p>
        )}

        {/* Vote buttons */}
        <div className="flex items-center gap-1.5 mb-2">
          {voteButtons.map(({ key, icon: Icon, count }) => {
            const voted = userVotes?.[submission.id]?.includes(key);
            return (
              <button
                key={key}
                onClick={(e) => {
                  e.stopPropagation();
                  onVote(submission.id, key);
                }}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all"
                style={{
                  backgroundColor: voted ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.08)",
                  color: color.text,
                  transform: voted ? "scale(1.05)" : "scale(1)",
                }}
              >
                <Icon size={11} />
                {count}
              </button>
            );
          })}
        </div>

        {/* Share */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare(submission);
          }}
          className="flex items-center gap-1 text-[10px] opacity-50 hover:opacity-100 transition-opacity font-body"
          style={{ color: color.text }}
        >
          <Share2 size={10} />
          Share
        </button>
      </div>
    </motion.div>
  );
}