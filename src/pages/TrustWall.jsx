import React, { useState, useEffect, useMemo, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, useScroll, useTransform } from "framer-motion";
import { Plus } from "lucide-react";
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
  const [showSubmit, setShowSubmit] = useState(false);
  const [shareSubmission, setShareSubmission] = useState(null);
  const [userVotes, setUserVotes] = useState(getUserVotes);
  const containerRef = useRef(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleIntroComplete = () => {
    sessionStorage.setItem("tw_intro_seen", "1");
    setIntroComplete(true);
  };

  const { scrollY } = useScroll({ container: containerRef });
  // Canvas rises from below as user scrolls
  const canvasY = useTransform(scrollY, [0, window.innerHeight * 0.6], ["100vh", "0vh"]);
  const canvasOpacity = useTransform(scrollY, [0, window.innerHeight * 0.3], [0, 1]);
  const heroScale = useTransform(scrollY, [0, window.innerHeight * 0.5], [1, 0.94]);
  const heroOpacity = useTransform(scrollY, [0, window.innerHeight * 0.4], [1, 0]);

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["submissions"],
    queryFn: () => base44.entities.Submission.filter({ status: "approved" }, "-total_score", 200),
    refetchInterval: 15000,
  });

  const { data: allVotes = [] } = useQuery({
    queryKey: ["allVotes"],
    queryFn: () => base44.entities.Vote.list("-created_date", 100),
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
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll"
      style={{ backgroundColor: "#fafafa" }}
    >
      {/* Dot grid — always behind */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* ── SECTION 1: Hero — full viewport height ── */}
      <div className="relative h-screen flex flex-col" style={{ zIndex: 10 }}>
        {/* Nav */}
        <div className="flex items-center justify-between px-6 md:px-12 pt-8">
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

        {/* Hero text — centred, scales down & fades as you scroll */}
        <motion.div
          style={{ scale: heroScale, opacity: heroOpacity }}
          className="flex-1 flex flex-col items-center justify-center text-center px-6"
        >
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-7xl lg:text-[96px] text-foreground leading-[1.04] tracking-tight mb-6 max-w-4xl"
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

          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            onClick={() => setShowSubmit(true)}
            className="inline-flex items-center gap-2 bg-foreground text-background px-7 py-3.5 rounded-full text-[14px] hover:opacity-80 transition-opacity"
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
          >
            <Plus size={15} strokeWidth={2.5} />
            Add your answer
          </motion.button>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="absolute bottom-10 flex flex-col items-center gap-2 text-foreground/30"
          >
            <span className="text-[12px] tracking-wider uppercase" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Scroll to explore
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
              className="w-5 h-5 border border-foreground/20 rounded-full flex items-center justify-center"
            >
              <div className="w-1 h-1 rounded-full bg-foreground/30" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── SECTION 2: Spacer that drives the scroll-triggered reveal ── */}
      <div className="h-[60vh]" />

      {/* ── SECTION 3: Canvas — sticky, rises up as user scrolls ── */}
      <motion.div
        style={{ y: canvasY, opacity: canvasOpacity }}
        className="fixed inset-0 z-20"
      >
        {/* Bottom stats bar */}
        <div
          className="absolute bottom-0 left-0 right-0 z-30 pt-12 pb-6 px-6 flex items-center justify-center gap-8 pointer-events-auto"
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

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="w-6 h-6 border-2 border-black/10 border-t-black/40 rounded-full animate-spin" />
          </div>
        )}

        <Canvas
          submissions={positionedSubmissions}
          onVote={handleVote}
          onShare={(s) => setShareSubmission(s)}
          userVotes={userVotes}
        />
      </motion.div>

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