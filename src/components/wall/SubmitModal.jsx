import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const EXAMPLES = [
  "Deciding whether I should text my ex",
  "Naming my startup",
  "Choosing my next city",
  "Picking my wedding playlist",
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
    if (!answer.trim()) errs.answer = "Please share your answer";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Invalid email";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setIsSubmitting(true);
    await onSubmit({ answer: answer.trim(), email: email.trim(), alias: alias.trim() || null });
    setIsSubmitting(false);
    setAnswer("");
    setEmail("");
    setAlias("");
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header accent */}
          <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-chart-3" />

          <div className="p-6 md:p-8">
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>

            {/* Title */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={18} className="text-primary" />
                <span className="text-xs font-mono tracking-wider text-primary uppercase">Your Turn</span>
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground leading-tight">
                What's the wildest thing you'd trust AI with?
              </h2>
            </div>

            {/* Examples */}
            <div className="flex flex-wrap gap-2 mb-6">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setAnswer(ex)}
                  className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors font-body"
                >
                  {ex}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label className="text-sm font-body text-muted-foreground mb-1.5 block">
                  Your answer *
                </Label>
                <Textarea
                  value={answer}
                  onChange={(e) => { setAnswer(e.target.value); setErrors(prev => ({...prev, answer: undefined})); }}
                  placeholder="I'd trust AI to..."
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none h-24 font-body"
                  maxLength={280}
                />
                <div className="flex justify-between mt-1">
                  {errors.answer && <span className="text-xs text-destructive">{errors.answer}</span>}
                  <span className="text-xs text-muted-foreground ml-auto">{answer.length}/280</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-body text-muted-foreground mb-1.5 block">
                  Email *
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({...prev, email: undefined})); }}
                  placeholder="your@email.com"
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground font-body"
                />
                {errors.email && <span className="text-xs text-destructive mt-1">{errors.email}</span>}
              </div>

              <div>
                <Label className="text-sm font-body text-muted-foreground mb-1.5 block">
                  Name or alias <span className="text-muted-foreground/60">(optional)</span>
                </Label>
                <Input
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="Anonymous"
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground font-body"
                  maxLength={50}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display font-bold py-6 rounded-xl text-base shadow-[0_0_20px_rgba(251,191,36,0.2)] hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] transition-all"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Drop It On The Wall
                  </>
                )}
              </Button>

              <p className="text-[10px] text-center text-muted-foreground/60 font-body">
                By submitting, you agree to our terms. Your email won't be displayed.
              </p>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}