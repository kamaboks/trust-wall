import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

// Fake seed notes for the fill phase
const SEED_NOTES = [
  { id: 1, text: "Pick my next career move", color: "#FEF3C7", x: 80,  y: 60,  r: -3 },
  { id: 2, text: "Write my wedding vows", color: "#FCE7F3", x: 320, y: 30,  r: 2  },
  { id: 3, text: "Tell me when to quit my job", color: "#DBEAFE", x: 560, y: 80,  r: -5 },
  { id: 4, text: "Name my firstborn child", color: "#D1FAE5", x: 800, y: 20,  r: 3  },
  { id: 5, text: "Handle my entire inbox forever", color: "#FFEDD5", x: 1040,y: 70,  r: -2 },
  { id: 6, text: "Decide if I should break up with someone", color: "#EDE9FE", x: 140, y: 220, r: 4  },
  { id: 7, text: "Run my finances", color: "#FFE4E6", x: 380, y: 190, r: -4 },
  { id: 8, text: "Choose where I retire", color: "#CFFAFE", x: 620, y: 240, r: 2  },
  { id: 9, text: "Pick my friends for me", color: "#ECFCCB", x: 860, y: 180, r: -3 },
  { id: 10, text: "Raise my kids", color: "#FEF3C7", x: 1100,y: 230, r: 5  },
  { id: 11, text: "Drive my car forever", color: "#FCE7F3", x: 60,  y: 380, r: -2 },
  { id: 12, text: "Diagnose my health issues", color: "#DBEAFE", x: 300, y: 360, r: 3  },
  { id: 13, text: "Be my therapist", color: "#D1FAE5", x: 540, y: 400, r: -5 },
  { id: 14, text: "Write all my texts", color: "#FFEDD5", x: 780, y: 350, r: 4  },
  { id: 15, text: "Plan every vacation I ever take", color: "#EDE9FE", x: 1020,y: 390, r: -1 },
  { id: 16, text: "Negotiate my salary", color: "#FFE4E6", x: 180, y: 510, r: 3  },
  { id: 17, text: "Manage my social life", color: "#CFFAFE", x: 420, y: 530, r: -4 },
  { id: 18, text: "Make every meal decision", color: "#ECFCCB", x: 660, y: 490, r: 2  },
  { id: 19, text: "Vote on my behalf", color: "#FEF3C7", x: 900, y: 540, r: -3 },
  { id: 20, text: "Choose my outfit daily", color: "#FCE7F3", x: 100, y: 640, r: 5  },
  { id: 21, text: "Run my company", color: "#DBEAFE", x: 340, y: 670, r: -2 },
  { id: 22, text: "Be my lawyer", color: "#D1FAE5", x: 580, y: 630, r: 3  },
  { id: 23, text: "Decide if I have kids", color: "#FFEDD5", x: 820, y: 680, r: -4 },
];

// Phases: "blank" → "filling" → "sweep" → "reveal"
export default function IntroAnimation({ onComplete }) {
  const [phase, setPhase] = useState("blank");
  const [visibleNotes, setVisibleNotes] = useState([]);
  const noteQueue = useRef(null);

  useEffect(() => {
    // Phase 1: blank for 0.5s
    const t1 = setTimeout(() => {
      setPhase("filling");
    }, 500);
    return () => clearTimeout(t1);
  }, []);

  // Fill notes one by one
  useEffect(() => {
    if (phase !== "filling") return;

    let i = 0;
    noteQueue.current = setInterval(() => {
      setVisibleNotes(prev => [...prev, SEED_NOTES[i]]);
      i++;
      if (i >= SEED_NOTES.length) {
        clearInterval(noteQueue.current);
        // After all notes shown, wait then sweep
        setTimeout(() => setPhase("sweep"), 800);
      }
    }, 80);

    return () => clearInterval(noteQueue.current);
  }, [phase]);

  // After sweep, go to reveal
  useEffect(() => {
    if (phase !== "sweep") return;
    const t = setTimeout(() => setPhase("reveal"), 900);
    return () => clearTimeout(t);
  }, [phase]);

  // After reveal text animates in, call onComplete
  useEffect(() => {
    if (phase !== "reveal") return;
    const t = setTimeout(onComplete, 3200);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" style={{ backgroundColor: "#fafafa" }}>
      {/* Dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Notes layer */}
      <AnimatePresence>
        {phase !== "reveal" && visibleNotes.map((note) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, scale: 0.7, rotate: note.r }}
            animate={{ opacity: 1, scale: 1, rotate: note.r }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.05 } }}
            transition={{ type: "spring", stiffness: 280, damping: 22, duration: 0.35 }}
            className="absolute rounded-2xl p-4 w-[190px]"
            style={{
              left: note.x,
              top: note.y,
              backgroundColor: note.color,
              border: "1.5px solid rgba(0,0,0,0.06)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <p
              className="text-[12px] leading-snug text-[#1a1a1a]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {note.text}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Sweep overlay — white wipe left-to-right */}
      <AnimatePresence>
        {phase === "sweep" && (
          <motion.div
            className="absolute inset-0 z-10"
            style={{ backgroundColor: "#fafafa", originX: 0 }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, ease: [0.77, 0, 0.18, 1] }}
          />
        )}
      </AnimatePresence>

      {/* Reveal text */}
      <AnimatePresence>
        {phase === "reveal" && (
          <motion.div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl md:text-6xl lg:text-7xl text-foreground leading-[1.08] tracking-tight mb-5 max-w-3xl"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              What's the wildest thing
              <br />
              <em>you'd trust AI with?</em>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-[15px] text-foreground/50 mb-8 max-w-sm"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Add your answer. Vote on others.{" "}
              <span className="text-foreground/70">$1,000 for the top submission.</span>
            </motion.p>

            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              onClick={onComplete}
              className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-full text-[14px] hover:opacity-80 transition-opacity"
              style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
            >
              <Plus size={15} strokeWidth={2.5} />
              Add your answer
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}