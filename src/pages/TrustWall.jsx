import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import IntroAnimation from "@/components/wall/IntroAnimation";
import HeroOverlay from "@/components/wall/HeroOverlay";
import Canvas from "@/components/wall/Canvas";
import SubmitModal from "@/components/wall/SubmitModal";
import ShareModal from "@/components/wall/ShareModal";

const NOTE_COLORS = [
  "#FEF3C7", "#FCE7F3", "#DBEAFE", "#D1FAE5", "#FFEDD5",
  "#EDE9FE", "#FFE4E6", "#CFFAFE", "#ECFCCB", "#FED7AA",
];

function getBrowserFingerprint() {
  const nav = navigator;
  const str = [nav.userAgent, nav.language, screen.width, screen.height, new Date().getTimezoneOffset()].join("|");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export default function TrustWall() {
  const [showIntro, setShowIntro] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [shareSubmission, setShareSubmission] = useState(null);
  const [fingerprint] = useState(() => getBrowserFingerprint());
  const queryClient = useQueryClient();

  const { data: submissions = [] } = useQuery({
    queryKey: ["submissions"],
    queryFn: () => base44.entities.Submission.filter({ status: "approved" }),
    enabled: !showIntro,
  });

  const { data: myVotes = [] } = useQuery({
    queryKey: ["votes", fingerprint],
    queryFn: () => base44.entities.Vote.filter({ voter_fingerprint: fingerprint }),
    enabled: !showIntro,
  });

  const userVotes = myVotes.reduce((acc, v) => {
    if (!acc[v.submission_id]) acc[v.submission_id] = [];
    acc[v.submission_id].push(v.category);
    return acc;
  }, {});

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
      const alreadyVoted = userVotes[submissionId]?.includes(category);
      if (alreadyVoted) return;
      await base44.entities.Vote.create({
        submission_id: submissionId,
        category,
        voter_fingerprint: fingerprint,
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
      queryClient.invalidateQueries({ queryKey: ["votes", fingerprint] });
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
    <div className="w-screen" style={{ height: "200vh" }}>
      {/* Section 1 — Hero */}
      <div className="relative w-full h-screen overflow-hidden bg-background">
        <HeroOverlay
          onAddAnswer={() => setShowSubmitModal(true)}
          stats={stats}
        />
      </div>

      {/* Section 2 — Canvas */}
      <div className="relative w-full h-screen overflow-hidden bg-background">
        <Canvas
          submissions={submissions}
          onVote={(submissionId, category) => voteMutation.mutate({ submissionId, category })}
          onShare={(submission) => setShareSubmission(submission)}
          userVotes={userVotes}
        />
        {/* Add answer button on canvas section */}
        <button
          onClick={() => setShowSubmitModal(true)}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-foreground text-background px-6 py-3 rounded-full text-[13px] font-medium hover:opacity-80 transition-opacity z-10"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          + Add your answer
        </button>
      </div>

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