import React, { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";
import Canvas from "@/components/wall/Canvas";
import SubmitModal from "@/components/wall/SubmitModal";
import ShareModal from "@/components/wall/ShareModal";
import IntroAnimation from "@/components/wall/IntroAnimation";
import { useToast } from "@/components/ui/use-toast";

const NOTE_COLORS = ["yellow", "pink", "blue", "green", "orange", "violet", "rose", "cyan", "lime", "amber"];

function getFingerprint() {
  let fp = localStorage.getItem("tw_fp");
  if (!fp) {
    fp = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem("tw_fp", fp);
  }
  return fp;
}

function getUserVotes() {
  const raw = localStorage.getItem("tw_votes");
  return raw ? JSON.parse(raw) : {};
}

function setUserVoteStorage(votes) {
  localStorage.setItem("tw_votes", JSON.stringify(votes));
}

function generatePosition(index, total) {
  const cols = Math.ceil(Math.sqrt(total * 1.5));
  const row = Math.floor(index / cols);
  const col = index % cols;
  const baseX = col * 260 + (row % 2 === 0 ? 0 : 130);
  const baseY = row * 240;
  const jitterX = (Math.random() - 0.5) * 80;
  const jitterY = (Math.random() - 0.5) * 60;
  return { x: baseX + jitterX, y: baseY + jitterY };
}

export default function TrustWall() {
  const [introComplete, setIntroComplete] = useState(() => !!sessionStorage.getItem("tw_intro_seen"));
  const [showCanvas, setShowCanvas] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [shareSubmission, setShareSubmission] = useState(null);
  const [userVotes, setUserVotes] = useState(getUserVotes);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleIntroComplete = () => {
    sessionStorage.setItem("tw_intro_seen", "1");
    setIntroComplete(true);
  };

  // Trigger canvas reveal on scroll
  useEffect(() => {
    if (showCanvas) return;
    const onScroll = () => {
      if (window.scrollY > 80) setShowCanvas(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showCanvas]);

  // Lock body scroll once canvas is shown
  useEffect(() => {
    if (showCanvas) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [showCanvas]);

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["submissions"],
    queryFn: () => base44.entities.Submission.filter({ status: "approved" }, "-total_score", 200),
    refetchInterval: 15000,
  });

  const positionedSubmissions = useMemo(() => {
    return submissions.map((s, i) => ({
      ...s,
      note_x: s.note_x || generatePosition(i, submissions.length).x,
      note_y: s.note_y || generatePosition(i, submissions.length).y,
      note_rotation: s.note_rotation || (Math.random() - 0.5) * 12,
      note_color: s.note_color || NOTE_COLORS[i % NOTE_COLORS.length],
    }));
  }, [submissions]);

  const stats = useMemo(() => {
    let totalVotes = 0;
    submissions.forEach(s => {
      totalVotes += (s.votes_unhinged || 0) + (s.votes_think || 0) + (s.votes_trust || 0);
    });
    return { answers: submissions.length, votes: totalVotes };
  }, [submissions]);

  const createSubmission = useMutation({
    mutationFn: async (data) => {
      const index = submissions.length;
      const pos = generatePosition(index, submissions.length + 1);
      return base44.entities.Submission.create({
        ...data,
        status: "approved",
        votes_unhinged: 0, votes_think: 0, votes_trust: 0,
        total_score: 0, rank: 0,
        note_color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
        note_rotation: (Math.random() - 0.5) * 12,
        note_x: pos.x, note_y: pos.y,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      setShowSubmit(false);
      toast({ title: "🎉 You're on the wall!", description: "Your answer has been added. Share it to get votes!" });
    },
  });

  const handleVote = async (submissionId, category) => {
    const fp = getFingerprint();
    const currentVotes = { ...userVotes };
    if (!currentVotes[submissionId]) currentVotes[submissionId] = [];
    if (currentVotes[submissionId].includes(category)) {
      toast({ title: "Already voted", description: "You already voted in this category for this note." });
      return;
    }
    const categoryVoteCount = Object.values(currentVotes).filter(v => v.includes(category)).length;
    if (categoryVoteCount >= 3) {
      toast({ title: "Vote limit reached", description: `You can only cast 3 ${category} votes total.` });
      return;
    }
    currentVotes[submissionId].push(category);
    setUserVotes(currentVotes);
    setUserVoteStorage(currentVotes);
    await base44.entities.Vote.create({ submission_id: submissionId, category, voter_fingerprint: fp });
    const sub = submissions.find(s => s.id === submissionId);
    if (sub) {
      const field = category === "unhinged" ? "votes_unhinged" : category === "think" ? "votes_think" : "votes_trust";
      await base44.entities.Submission.update(submissionId, {
        [field]: (sub[field] || 0) + 1,
        total_score: (sub.total_score || 0) + 1,
      });
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
    }
  };

  if (!introComplete) {
    return <IntroAnimation onComplete={handleIntroComplete} />;
  }

  return (
    <div className="relative" style={{ backgroundColor: "#fafafa" }}>
      {/* Dot grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          zIndex: 0,
        }}
      />

      {/* ── HERO ── */}
      <AnimatePresence>
        {!showCanvas && (
          <motion.div
            key="hero"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 flex flex-col z-10"
          >
            {/* Nav */}
            <div className="flex items-center justify-between px-6 md:px-12 pt-8 flex-shrink-0">
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

            {/* Hero text */}
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl md:text-7xl lg:text-[88px] text-foreground leading-[1.04] tracking-tight mb-6 max-w-4xl"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
              >
                What's the wildest thing
                <br />
                <em>you'd trust AI with?</em>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="text-[15px] text-foreground/50 mb-10 max-w-sm"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Add your answer. Vote on others.{" "}
                <span className="text-foreground/70">$1,000 for the top submission.</span>
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="flex flex-col sm:flex-row items-center gap-3"
              >
                <button
                  onClick={() => setShowSubmit(true)}
                  className="inline-flex items-center gap-2 bg-foreground text-background px-7 py-3.5 rounded-full text-[14px] hover:opacity-80 transition-opacity"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
                >
                  <Plus size={15} strokeWidth={2.5} />
                  Add your answer
                </button>
                <button
                  onClick={() => setShowCanvas(true)}
                  className="inline-flex items-center gap-2 text-foreground/50 hover:text-foreground/80 px-4 py-3.5 rounded-full text-[14px] transition-colors"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  See the wall
                  <ArrowDown size={14} />
                </button>
              </motion.div>
            </div>

            {/* Scroll hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              className="pb-10 flex flex-col items-center gap-2 text-foreground/25"
            >
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              >
                <ArrowDown size={16} />
              </motion.div>
              <span className="text-[11px] tracking-widest uppercase" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                scroll to explore
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll driver — only shown when hero is visible */}
      {!showCanvas && <div style={{ height: "200vh" }} />}

      {/* ── CANVAS ── */}
      <AnimatePresence>
        {showCanvas && (
          <motion.div
            key="canvas"
            initial={{ y: "100vh" }}
            animate={{ y: 0 }}
            exit={{ y: "100vh" }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-20"
            style={{ backgroundColor: "#fafafa" }}
          >
            {/* Top bar */}
            <div
              className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 md:px-10 pt-5 pb-10 pointer-events-auto"
              style={{
                background: "linear-gradient(to bottom, rgba(250,250,250,1) 55%, rgba(250,250,250,0))",
              }}
            >
              <button
                onClick={() => setShowCanvas(false)}
                className="text-[12px] text-foreground/40 hover:text-foreground/70 transition-colors flex items-center gap-1.5"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                ← Back
              </button>
              <span
                className="text-[13px] tracking-[0.15em] uppercase text-foreground/30"
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

            {/* Canvas */}
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-black/10 border-t-black/40 rounded-full animate-spin" />
              </div>
            ) : (
              <Canvas
                submissions={positionedSubmissions}
                onVote={handleVote}
                onShare={(s) => setShareSubmission(s)}
                userVotes={userVotes}
              />
            )}

            {/* Bottom bar */}
            <div
              className="absolute bottom-0 left-0 right-0 z-30 pointer-events-auto"
              style={{
                background: "linear-gradient(to top, rgba(250,250,250,1) 55%, rgba(250,250,250,0))",
              }}
            >
              <div className="flex items-center justify-between px-6 md:px-10 pb-7 pt-12">
                <div className="flex items-center gap-6">
                  <Stat value={stats.answers} label="answers" />
                  <div className="w-px h-4 bg-foreground/10" />
                  <Stat value={stats.votes} label="votes" />
                  <div className="w-px h-4 bg-foreground/10" />
                  <Stat value="$1K" label="prize" />
                </div>
                <button
                  onClick={() => setShowSubmit(true)}
                  className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-[13px] hover:opacity-80 transition-opacity"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
                >
                  <Plus size={13} strokeWidth={2.5} />
                  Add your answer
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <SubmitModal
        isOpen={showSubmit}
        onClose={() => setShowSubmit(false)}
        onSubmit={(data) => createSubmission.mutate(data)}
      />
      <ShareModal
        submission={shareSubmission}
        isOpen={!!shareSubmission}
        onClose={() => setShareSubmission(null)}
      />
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="text-[13px] text-foreground/40" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <span className="text-foreground/70 font-medium">
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>{" "}
      {label}
    </div>
  );
}