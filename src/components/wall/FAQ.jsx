import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

const FAQS = [
  {
    q: "What is this?",
    a: "A giant internet experiment about AI and trust.",
  },
  {
    q: "What am I supposed to do?",
    a: `Answer one question: "What's the wildest thing you'd trust AI with?" Then explore the wall, vote on other answers, and see where your take ranks.`,
  },
  {
    q: "How does voting work?",
    a: "Every answer can receive three types of votes:\n🤝 I'd Actually Do This\n🧠 Made Me Think\n🚨 Unhinged",
  },
  {
    q: "Can I vote for my own answer?",
    a: "No. Nice try.",
  },
  {
    q: "Do I need an account?",
    a: "No. Just submit your answer and email address.",
  },
  {
    q: "Why do you need my email?",
    a: "To verify submissions, prevent spam, and contact the winner.",
  },
  {
    q: "Is there a prize?",
    a: "Yes. The highest-ranked answer when the campaign ends wins a $1,000 gift card.",
  },
  {
    q: "How are rankings calculated?",
    a: "Every vote contributes to your overall score. The most trusted, thought-provoking, and delightfully unhinged answers rise to the top.",
  },
  {
    q: "Can I submit more than one answer?",
    a: "Only one answer per person. Choose wisely.",
  },
  {
    q: "Who are you?",
    a: "We're Niural. The AI-native platform for global payroll, payments, and compliance. Learn more at niural.com.",
  },
];

function FAQItem({ item, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="border-b border-black/8 last:border-0"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
      >
        <span
          className="text-[15px] md:text-[16px] text-foreground group-hover:text-foreground/70 transition-colors"
          style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
        >
          {item.q}
        </span>
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-foreground/40"
        >
          <Plus size={18} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p
              className="pb-5 text-[14px] text-foreground/55 leading-relaxed whitespace-pre-line"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  return (
    <section className="w-full bg-background py-20 px-4 border-t border-black/5">
      <div className="max-w-2xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl md:text-5xl text-foreground text-center mb-12 leading-tight"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          Questions?
        </motion.h2>

        <div className="bg-white rounded-2xl px-6 md:px-10 border border-black/5 shadow-sm">
          {FAQS.map((item, i) => (
            <FAQItem key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}