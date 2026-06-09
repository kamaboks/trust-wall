import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const EXAMPLES = [
  "Deciding whether to text my ex",
  "Naming my startup",
  "Picking my wedding playlist",
  "Choosing what city to move to",
  "Telling me when to quit my job",
];

export default function SubmitModal({ isOpen, onClose, onSubmit }) {
  const [answer, setAnswer] = useState("");
  const [email, setEmail] = useState("");
  const [alias, setAlias] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!answer.trim()) errs.answer = "Required";
    if (!email.trim()) errs.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Invalid email";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setIsSubmitting(true);
    await onSubmit({ answer: answer.trim(), email: email.trim(), alias: alias.trim() || null });
    setIsSubmitting(false);
    setAnswer(""); setEmail(""); setAlias(""); setErrors({});
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.10)] border border-black/5 overflow-hidden"
          >
            <div className="p-8">
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 text-foreground/30 hover:text-foreground/60 transition-colors"
              >
                <X size={18} />
              </button>

              {/* Title */}
              <h2
                className="text-2xl text-foreground mb-1 leading-snug"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
              >
                Your answer
              </h2>
              <p className="text-[13px] text-foreground/40 mb-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                What's the wildest thing you'd trust AI with?
              </p>

              {/* Example chips */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setAnswer(ex)}
                    className="text-[11px] px-3 py-1.5 rounded-full border border-black/8 text-foreground/50 hover:border-black/20 hover:text-foreground/80 transition-all bg-transparent"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {ex}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Answer */}
                <div>
                  <textarea
                    value={answer}
                    onChange={(e) => { setAnswer(e.target.value); setErrors(p => ({...p, answer: undefined})); }}
                    placeholder="I'd trust AI to..."
                    maxLength={280}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3 text-[14px] text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-black/25 transition-colors"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.answer && <span className="text-[11px] text-red-500">{errors.answer}</span>}
                    <span className="text-[11px] text-foreground/30 ml-auto">{answer.length}/280</span>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors(p => ({...p, email: undefined})); }}
                    placeholder="your@email.com"
                    className="w-full rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3 text-[14px] text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-black/25 transition-colors"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                  {errors.email && <span className="text-[11px] text-red-500 mt-1 block">{errors.email}</span>}
                </div>

                {/* Alias */}
                <div>
                  <input
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    placeholder="Name or alias (optional)"
                    maxLength={50}
                    className="w-full rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3 text-[14px] text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-black/25 transition-colors"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-foreground text-background rounded-xl py-3.5 text-[14px] font-medium hover:opacity-80 transition-opacity disabled:opacity-40"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                  ) : (
                    "Drop it on the wall →"
                  )}
                </button>

                <p className="text-center text-[11px] text-foreground/25" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Your email won't be displayed publicly.
                </p>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}