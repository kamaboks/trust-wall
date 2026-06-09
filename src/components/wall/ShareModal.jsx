import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Siren, Brain, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ShareModal({ submission, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !submission) return null;

  const shareUrl = `${window.location.origin}?note=${submission.id}`;
  const shareText = `"${submission.answer}" — Vote for this on Trust Wall! 🧠`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToX = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  const shareToLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  const rankLabel = submission.rank > 0 && submission.rank <= 10 ? `#${submission.rank} Overall` : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 md:p-8">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>

            {/* Share card preview */}
            <div className="bg-gradient-to-br from-secondary to-muted rounded-xl p-6 mb-6 border border-border">
              {rankLabel && (
                <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-display font-bold rounded-full mb-3">
                  {rankLabel}
                </span>
              )}
              <p className="text-lg font-display font-bold text-foreground leading-snug mb-4">
                "{submission.answer}"
              </p>
              <div className="flex items-center gap-3 text-sm font-mono text-muted-foreground">
                <span className="flex items-center gap-1"><Siren size={14} /> {submission.votes_unhinged || 0}</span>
                <span className="flex items-center gap-1"><Brain size={14} /> {submission.votes_think || 0}</span>
                <span className="flex items-center gap-1"><Handshake size={14} /> {submission.votes_trust || 0}</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground font-body mb-4">Share this take:</p>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={shareToX}
                variant="outline"
                className="font-body border-border hover:bg-secondary"
              >
                Share on 𝕏
              </Button>
              <Button
                onClick={shareToLinkedIn}
                variant="outline"
                className="font-body border-border hover:bg-secondary"
              >
                LinkedIn
              </Button>
              <Button
                onClick={handleCopy}
                variant="outline"
                className="col-span-2 font-body border-border hover:bg-secondary"
              >
                {copied ? (
                  <><Check size={14} className="mr-2 text-green-400" /> Copied!</>
                ) : (
                  <><Copy size={14} className="mr-2" /> Copy Link</>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}