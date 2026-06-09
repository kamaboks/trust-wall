import React from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function HeroOverlay({ onAddAnswer, stats }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {/* Top */}
      <div className="absolute top-0 left-0 right-0 pointer-events-auto">
        <div
          className="pb-20 pt-8 px-6 md:px-12"
          style={{
            background: "linear-gradient(to bottom, rgba(250,250,250,1) 60%, rgba(250,250,250,0))",
          }}
        >
          {/* Nav */}
          <div className="flex items-center justify-between mb-12 max-w-5xl mx-auto">
            <span
              className="text-[13px] tracking-[0.15em] uppercase text-foreground/40"
              style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
            >
              Niural AI Labs
            </span>
            <Link
              to="/admin"
              className="text-[12px] text-foreground/30 hover:text-foreground/60 transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Admin
            </Link>
          </div>

          {/* Hero */}
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl md:text-6xl lg:text-7xl text-foreground leading-[1.08] tracking-tight mb-5"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              What's the wildest thing
              <br />
              <em>you'd trust AI with?</em>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="text-[15px] text-foreground/50 mb-8 max-w-md mx-auto"
              style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}
            >
              Add your answer. Vote on others.{" "}
              <span className="text-foreground/70">$1,000 for the top submission.</span>
            </motion.p>

            <motion.button
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              onClick={onAddAnswer}
              className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-full text-[14px] hover:opacity-80 transition-opacity"
              style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
            >
              <Plus size={15} strokeWidth={2.5} />
              Add your answer
            </motion.button>
          </div>
        </div>
      </div>

      {/* Bottom stats */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-auto">
        <div
          className="pt-16 pb-6 px-6 flex items-center justify-center gap-8"
          style={{
            background: "linear-gradient(to top, rgba(250,250,250,1) 50%, rgba(250,250,250,0))",
          }}
        >
          <Stat value={stats.answers} label="answers" />
          <div className="w-px h-5 bg-foreground/10" />
          <Stat value={stats.votes} label="votes" />
          <div className="w-px h-5 bg-foreground/10" />
          <Stat value="$1K" label="prize" />
        </div>
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