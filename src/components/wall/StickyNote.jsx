import React, { useState } from "react";
import { motion } from "framer-motion";
import { Share2 } from "lucide-react";

const NOTE_STYLES = {
  yellow: { bg: "#FEF3C7", border: "#FDE68A", text: "#1a1a1a" },
  pink:   { bg: "#FCE7F3", border: "#FBCFE8", text: "#1a1a1a" },
  blue:   { bg: "#DBEAFE", border: "#BFDBFE", text: "#1a1a1a" },
  green:  { bg: "#D1FAE5", border: "#A7F3D0", text: "#1a1a1a" },
  orange: { bg: "#FFEDD5", border: "#FED7AA", text: "#1a1a1a" },
  violet: { bg: "#EDE9FE", border: "#DDD6FE", text: "#1a1a1a" },
  rose:   { bg: "#FFE4E6", border: "#FECDD3", text: "#1a1a1a" },
  cyan:   { bg: "#CFFAFE", border: "#A5F3FC", text: "#1a1a1a" },
  lime:   { bg: "#ECFCCB", border: "#D9F99D", text: "#1a1a1a" },
  amber:  { bg: "#FEF3C7", border: "#FDE68A", text: "#1a1a1a" },
};

const VOTE_EMOJIS = {
  unhinged: "🎰",
  think:    "🧠",
  trust:    "🤝",
};

export default function StickyNote({ submission, onVote, onShare, userVotes, highlighted }) {
  const [isHovered, setIsHovered] = useState(false);
  const color = NOTE_STYLES[submission.note_color] || NOTE_STYLES.yellow;
  const rotation = submission.note_rotation || 0;
  const isTop10 = submission.rank > 0 && submission.rank <= 10;

  const voteButtons = [
    { key: "unhinged", count: submission.votes_unhinged || 0 },
    { key: "think",    count: submission.votes_think    || 0 },
    { key: "trust",    count: submission.votes_trust    || 0 },
  ];

  return (
    <motion.div
      className="absolute select-none"
      style={{
        left: submission.note_x,
        top: submission.note_y,
        zIndex: isHovered ? 50 : 1,
      }}
      initial={{ opacity: 0, scale: 0.8, rotate: rotation }}
      animate={{
        opacity: 1,
        scale: isHovered ? 1.04 : 1,
        rotate: isHovered ? rotation * 0.3 : rotation,
      }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative w-[200px] p-4 rounded-2xl cursor-pointer"
        style={{
          backgroundColor: color.bg,
          border: `1.5px solid ${color.border}`,
          boxShadow: highlighted
            ? "0 0 0 3px #1a1a1a, 0 12px 32px rgba(0,0,0,0.18)"
            : isHovered
            ? "0 12px 32px rgba(0,0,0,0.10)"
            : "0 2px 8px rgba(0,0,0,0.06)",
          transition: "box-shadow 0.2s ease",
        }}
      >
        {/* Rank badge */}
        {isTop10 && (
          <div
            className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold"
            style={{ backgroundColor: color.border, color: "#1a1a1a" }}
          >
            #{submission.rank}
          </div>
        )}

        {/* Answer */}
        <p
          className="text-[13px] leading-snug mb-3 break-words"
          style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, color: color.text }}
        >
          {submission.answer}
        </p>

        {/* Alias */}
        {submission.alias && (
          <p
            className="text-[11px] mb-3 opacity-50"
            style={{ fontFamily: "'DM Sans', sans-serif", color: color.text }}
          >
            — {submission.alias}
          </p>
        )}

        {/* Votes */}
        <div className="flex items-center gap-2">
          {voteButtons.map(({ key, count }) => {
            const voted = userVotes?.[submission.id]?.includes(key);
            return (
              <button
                key={key}
                onClick={(e) => { e.stopPropagation(); onVote(submission.id, key); }}
                className="flex items-center gap-0.5 text-[11px] rounded-full px-1.5 py-0.5 transition-all"
                style={{
                  backgroundColor: voted ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.05)",
                  color: color.text,
                  fontFamily: "'DM Sans', sans-serif",
                  opacity: voted ? 1 : 0.7,
                }}
              >
                <span>{VOTE_EMOJIS[key]}</span>
                <span className="ml-0.5">{count}</span>
              </button>
            );
          })}

          <button
            onClick={(e) => { e.stopPropagation(); onShare(submission); }}
            className="ml-auto opacity-30 hover:opacity-70 transition-opacity"
            style={{ color: color.text }}
          >
            <Share2 size={11} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}