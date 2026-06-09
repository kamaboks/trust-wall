import React from "react";
import { motion } from "framer-motion";
import { Plus, MessageCircle, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroOverlay({ onAddAnswer, stats }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {/* Top hero section */}
      <div className="absolute top-0 left-0 right-0 pointer-events-auto">
        <div className="bg-gradient-to-b from-background via-background/95 to-transparent pb-16 pt-6 px-4 md:px-8">
          {/* Nav */}
          <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Zap size={16} className="text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-sm tracking-wider text-foreground/80">
                NIURAL AI LABS
              </span>
            </div>
            <div className="flex items-center gap-3">
              <a href="/admin" className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono">
                Admin
              </a>
            </div>
          </div>

          {/* Hero text */}
          <div className="text-center max-w-3xl mx-auto">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xs font-mono tracking-[0.3em] text-primary/80 uppercase mb-4"
            >
              The Internet is Deciding
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.05] tracking-tight text-foreground mb-5"
            >
              What's the wildest thing
              <br />
              <span className="text-primary">you'd trust AI with?</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-base md:text-lg text-muted-foreground font-body max-w-xl mx-auto mb-8"
            >
              Add your answer, vote on others, and help crown the wildest take.
              <br />
              <span className="text-accent font-semibold">$1,000 prize</span> for the top submission.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={onAddAnswer}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-display font-bold text-base px-8 py-6 rounded-full shadow-[0_0_30px_rgba(251,191,36,0.3)] hover:shadow-[0_0_50px_rgba(251,191,36,0.5)] transition-all"
              >
                <Plus size={20} className="mr-2" />
                Add Your Answer
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom stats bar */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-auto">
        <div className="bg-gradient-to-t from-background via-background/90 to-transparent pt-12 pb-5 px-4">
          <div className="flex items-center justify-center gap-6 md:gap-12">
            <Stat icon={MessageCircle} value={stats.answers} label="Answers" />
            <div className="w-px h-8 bg-border" />
            <Stat icon={Zap} value={stats.votes} label="Votes" />
            <div className="w-px h-8 bg-border" />
            <Stat icon={Trophy} value="$1K" label="Prize" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={16} className="text-primary" />
      <div>
        <span className="font-display font-bold text-lg text-foreground">
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        <span className="text-xs text-muted-foreground ml-1.5 font-body">{label}</span>
      </div>
    </div>
  );
}