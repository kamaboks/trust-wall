import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import IntroAnimation from "@/components/wall/IntroAnimation";
import HeroOverlay from "@/components/wall/HeroOverlay";
import Canvas from "@/components/wall/Canvas";
import SubmitModal from "@/components/wall/SubmitModal";
import ShareModal from "@/components/wall/ShareModal";
import Leaderboard from "@/components/wall/Leaderboard";
import FAQ from "@/components/wall/FAQ";
import Countdown from "@/components/wall/Countdown";

const NOTE_COLORS = [
  "#FEF3C7", "#FCE7F3", "#DBEAFE", "#D1FAE5", "#FFEDD5",
  "#EDE9FE", "#FFE4E6", "#CFFAFE", "#ECFCCB", "#FED7AA",
];

export default function TrustWall() {
  const canvasRef = useRef(null);
  const [showIntro, setShowIntro] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [shareSubmission, setShareSubmission] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const handleSignIn = () => {
    base44.auth.loginWithProvider("google", window.location.href);
  };

  const { data: submissions = [] } = useQuery({
    queryKey: ["submissions"],
    queryFn: () => base44.entities.Submission.filter({ status: "approved" }),
    enabled: !showIntro,
  });

  const { data: myVotes = [] } = useQuery({
    queryKey: ["votes", user?.id],
    queryFn: () => base44.entities.Vote.filter({ created_by_id: user.id }),
    enabled: !!user && !showIntro,
  });

  const userVotes = myVotes.reduce((acc, v) => {
    if (!acc[v.submission_id]) acc[v.submission_id] = [];
    acc[v.submission_id].push(v.category);
    return acc;
  }, {});

  // Track which categories the user has already voted in (global, 1 per category)
  const usedCategories = new Set(myVotes.map(v => v.category));

  const submitMutation = useMutation({
    mutationFn: async ({ answer, email, alias }) => {
      const colorIndex = Math.floor(Math.random() * NOTE_COLORS.length);
      const rotation = (Math.random() - 0.5) * 8;
      const existingCount = submissions.length;
      const cols = 6;
      const col = existingCount % cols;
      const row = Math.floor(existingCount / cols);
      const x = col * 240 + (Math.random() - 0.5) * 20;
      const y = row * 180 + (Math.random() - 0.5) * 20;
      return base44.entities.Submission.create({
        answer,
        email,
        alias: alias || null,
        status: "approved",
        votes_unhinged: 0,
        votes_think: 0,
        votes_trust: 0,
        total_score: 0,
        note_color: NOTE_COLORS[colorIndex],
        note_rotation: rotation,
        note_x: x,
        note_y: y,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      setShowSubmitModal(false);
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({ submissionId, category }) => {
      // Global limit: 1 vote per category across all submissions
      if (usedCategories.has(category)) return;
      await base44.entities.Vote.create({
        submission_id: submissionId,
        category,
        voter_fingerprint: user.id,
      });
      const submission = submissions.find(s => s.id === submissionId);
      if (!submission) return;
      const field = `votes_${category}`;
      const newCount = (submission[field] || 0) + 1;
      const newTotal = (submission.total_score || 0) + 1;
      await base44.entities.Submission.update(submissionId, {
        [field]: newCount,
        total_score: newTotal,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      queryClient.invalidateQueries({ queryKey: ["votes", user?.id] });
    },
  });

  const stats = {
    answers: submissions.length,
    votes: submissions.reduce((sum, s) => sum + (s.total_score || 0), 0),
  };

  if (showIntro) {
    return <IntroAnimation onComplete={() => setShowIntro(false)} />;
  }

  return (
    <div className="w-screen">
      {/* Section 1 — Hero */}
      <div className="relative w-full h-screen overflow-hidden bg-background">
        <HeroOverlay
          onAddAnswer={() => {
            if (!isAuthenticated) { handleSignIn(); return; }
            setShowSubmitModal(true);
          }}
          stats={stats}
        />
      </div>

      {/* Section 2 — Canvas */}
      <div className="relative w-full h-screen overflow-hidden bg-background">
        <Canvas
          ref={canvasRef}
          submissions={submissions}
          onVote={(submissionId, category) => {
            if (!isAuthenticated) { handleSignIn(); return; }
            voteMutation.mutate({ submissionId, category });
          }}
          onShare={(submission) => setShareSubmission(submission)}
          userVotes={userVotes}
          usedCategories={usedCategories}
          onAddAnswer={() => {
            if (!isAuthenticated) { handleSignIn(); return; }
            setShowSubmitModal(true);
          }}
          isAuthenticated={isAuthenticated}
          onSignIn={handleSignIn}
        />

      </div>

      {/* Section 3 — Leaderboard */}
      <Leaderboard
        submissions={submissions}
        onFocusNote={(id) => {
          const canvasEl = document.querySelector(".relative.w-full.h-screen:nth-child(2)");
          window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
          setTimeout(() => canvasRef.current?.focusNote(id), 600);
        }}
      />

      {/* Section 4 — FAQ */}
      <FAQ />

      {/* Section 5 — Countdown */}
      <Countdown />

      <SubmitModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onSubmit={({ answer, email, alias }) => submitMutation.mutateAsync({ answer, email, alias })}
      />

      {shareSubmission && (
        <ShareModal
          submission={shareSubmission}
          onClose={() => setShareSubmission(null)}
        />
      )}
    </div>
  );
}