import React from "react";
import { motion } from "framer-motion";

import { Link } from "react-router-dom";

export default function HeroOverlay({ onAddAnswer, stats }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 pointer-events-auto flex items-center justify-between px-6 md:px-10 pt-7">
        <span
          className="text-[11px] tracking-[0.18em] uppercase text-foreground/35"
          style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
        >
          Niural AI Labs
        </span>
        <Link
          to="/admin"
          className="text-[11px] tracking-[0.05em] text-foreground/30 hover:text-foreground/60 transition-colors"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Admin
        </Link>
      </div>

      {/* Hero — centered, large, minimal */}
      <div className="absolute top-0 left-0 right-0 pointer-events-auto flex flex-col items-center justify-start pt-20 pb-10 px-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl md:text-7xl lg:text-8xl text-foreground text-center leading-[1.05] tracking-tight mb-4"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          What's the wildest thing
          <br />
          <em>you'd trust AI with?</em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-[14px] text-foreground/40 mt-2 cursor-pointer hover:text-foreground/70 transition-colors pointer-events-auto"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
          onClick={onAddAnswer}
        >
          Add your answer. Vote on others.{" "}
          <span className="text-foreground/60 font-medium">$1,000 for the top submission.</span>
        </motion.p>
      </div>

      {/* Bottom — stats + scroll cue */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-auto pb-7 flex flex-col items-center gap-5">
        <div className="flex items-center gap-8">
          <Stat value={stats.answers} label="answers" />
          <div className="w-px h-4 bg-foreground/15" />
          <Stat value={stats.votes} label="votes" />
          <div className="w-px h-4 bg-foreground/15" />
          <Stat value="$1K" label="prize" />
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="flex flex-col items-center gap-1.5"
        >
          <span className="text-[11px] tracking-[0.12em] uppercase text-foreground/25" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Scroll to explore
          </span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="w-px h-5 bg-foreground/20"
          />
        </motion.div>
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div
      className="text-[13px] text-foreground/40"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <span className="text-foreground/70 font-medium">
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>{" "}
      {label}
    </div>
  );
}