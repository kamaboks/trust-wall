import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

const NOTE_TEXTS = [
  "Pick my next career move", "Write my wedding vows", "Tell me when to quit",
  "Name my firstborn", "Handle my inbox forever", "Decide if I should break up",
  "Run my finances", "Choose where I retire", "Pick my friends", "Raise my kids",
  "Drive my car", "Diagnose my health", "Be my therapist", "Write all my texts",
  "Plan every vacation", "Negotiate my salary", "Manage my social life",
  "Make every meal choice", "Vote on my behalf", "Choose my outfit daily",
  "Run my company", "Be my lawyer", "Decide if I have kids", "Buy my house",
  "Write my resume", "Pick my college major", "Find me a partner", "Fire people for me",
  "Tell me when to sleep", "Make my investment calls", "Write my apology texts",
  "Decide what I believe in", "Plan my funeral", "Choose my religion",
  "Tell me who to trust", "Handle my breakup", "Pick my next tattoo",
  "Ghostwrite my memoir", "Settle my arguments", "Tell me my life purpose",
];

const COLORS = [
  "#FEF3C7", "#FCE7F3", "#DBEAFE", "#D1FAE5", "#FFEDD5",
  "#EDE9FE", "#FFE4E6", "#CFFAFE", "#ECFCCB", "#FED7AA",
];

function generateNotes() {
  const notes = [];
  const noteW = 180;
  const noteH = 90;
  const cols = Math.ceil(window.innerWidth / (noteW - 10)) + 1;
  const rows = Math.ceil(window.innerHeight / (noteH - 10)) + 2;
  let id = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * (noteW - 12) + (row % 2 === 0 ? 0 : noteW / 2 - 10) - 20;
      const y = row * (noteH - 8) - 20;
      const r = (Math.random() - 0.5) * 10;
      const text = NOTE_TEXTS[id % NOTE_TEXTS.length];
      const color = COLORS[id % COLORS.length];
      notes.push({ id: id++, text, color, x, y, r });
    }
  }
  return notes;
}

// Phases: "fresco" → "filling" → "full" → "fall" → "done"
export default function IntroAnimation({ onComplete }) {
  const [phase, setPhase] = useState("fresco");
  const [visibleCount, setVisibleCount] = useState(0);

  const notes = useMemo(() => generateNotes(), []);

  // Show fresco for 2.8s then start filling
  useEffect(() => {
    if (phase !== "fresco") return;
    const t = setTimeout(() => setPhase("filling"), 2800);
    return () => clearTimeout(t);
  }, [phase]);

  // Fill all notes quickly
  useEffect(() => {
    if (phase !== "filling") return;
    let count = 0;
    const interval = setInterval(() => {
      count += 3;
      setVisibleCount(Math.min(count, notes.length));
      if (count >= notes.length) {
        clearInterval(interval);
        setTimeout(() => setPhase("full"), 400);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [phase, notes.length]);

  // Hold full, then fall
  useEffect(() => {
    if (phase !== "full") return;
    const t = setTimeout(() => setPhase("fall"), 800);
    return () => clearTimeout(t);
  }, [phase]);

  // After fall animation, complete
  useEffect(() => {
    if (phase !== "fall") return;
    const t = setTimeout(onComplete, 900);
    return () => clearTimeout(t);
  }, [phase]);

  const visibleNotes = notes.slice(0, visibleCount);
  const isFresco = phase === "fresco";
  const isFilling = phase === "filling" || phase === "full" || phase === "fall";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" style={{ backgroundColor: "#1a1208" }}>

      {/* Renaissance fresco background */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(https://media.base44.com/images/public/6a28709fc5f970eb1e30e66a/1005d6481_generated_image.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isFresco ? 1 : 0 }}
        transition={{ duration: isFresco ? 1.2 : 0.8 }}
      />

      {/* Vignette overlay on fresco */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(15,10,3,0.55) 100%)",
        }}
        animate={{ opacity: isFresco ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      />

      {/* "In AI We Trust" text on fresco */}
      <AnimatePresence>
        {isFresco && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            transition={{ delay: 0.8, duration: 1.0 }}
          >
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-[11px] tracking-[0.35em] uppercase mb-4"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: "rgba(255,240,200,0.55)",
                letterSpacing: "0.35em",
              }}
            >
              Niural AI Labs presents
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
              className="text-6xl md:text-8xl text-center leading-none tracking-tight"
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                color: "rgba(255,240,200,0.92)",
                textShadow: "0 4px 40px rgba(0,0,0,0.6), 0 1px 0 rgba(255,220,100,0.2)",
              }}
            >
              In AI<br /><em>We Trust</em>
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dot grid (appears as fresco fades) */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          backgroundColor: "#fafafa",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isFilling ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      />

      {/* Notes */}
      {visibleNotes.map((note) => {
        const isFalling = phase === "fall";
        const fallDelay = (note.x / window.innerWidth) * 0.15 + Math.random() * 0.1;
        return (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, scale: 0.75, rotate: note.r }}
            animate={
              isFalling
                ? {
                    opacity: 0,
                    y: window.innerHeight + 200,
                    rotate: note.r + (Math.random() - 0.5) * 30,
                    transition: { duration: 0.65, ease: [0.4, 0, 1, 1], delay: fallDelay },
                  }
                : {
                    opacity: 1,
                    scale: 1,
                    rotate: note.r,
                    transition: { type: "spring", stiffness: 300, damping: 24 },
                  }
            }
            className="absolute rounded-xl p-3 w-[168px]"
            style={{
              left: note.x,
              top: note.y,
              backgroundColor: note.color,
              border: "1.5px solid rgba(0,0,0,0.06)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              zIndex: 20,
            }}
          >
            <p
              className="text-[11px] leading-snug text-[#1a1a1a]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {note.text}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}