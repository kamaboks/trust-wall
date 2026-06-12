import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Set your campaign end date here
const END_DATE = new Date("2026-07-12T23:59:59");

function getTimeLeft() {
  const diff = END_DATE - new Date();
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return { d, h, m, s };
}

export default function Countdown() {
  const [time, setTime] = useState(getTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  const ended = time.d === 0 && time.h === 0 && time.m === 0 && time.s === 0;

  return (
    <section className="w-full bg-[#f7f6f3] py-20 px-4 border-t border-black/5">
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-[11px] tracking-[0.25em] uppercase text-foreground/40 mb-6"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {ended ? "Campaign ended" : "Campaign ends in"}
        </motion.p>

        {ended ? (
          <p
            className="text-4xl md:text-6xl text-foreground"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            Time's up.
          </p>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-baseline gap-2 md:gap-3"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            <Unit value={time.d} label="d" />
            <Sep />
            <Unit value={time.h} label="h" />
            <Sep />
            <Unit value={time.m} label="m" />
            <Sep />
            <Unit value={time.s} label="s" />
          </motion.div>
        )}
      </div>
    </section>
  );
}

function Unit({ value, label }) {
  return (
    <span className="text-5xl md:text-8xl text-foreground leading-none">
      {value}{label}
    </span>
  );
}

function Sep() {
  return (
    <span className="text-4xl md:text-7xl text-foreground/30 leading-none select-none">:</span>
  );
}