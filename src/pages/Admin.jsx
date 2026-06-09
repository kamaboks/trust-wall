import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Download, Search, RefreshCw, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import AdminStats from "@/components/admin/AdminStats";
import SubmissionTable from "@/components/admin/SubmissionTable";
import { useToast } from "@/components/ui/use-toast";

export default function Admin() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["admin-submissions"],
    queryFn: () => base44.entities.Submission.list("-created_date", 500),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Submission.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-submissions"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Submission.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-submissions"] }),
  });

  const handleUpdateStatus = (id, status) => {
    updateMutation.mutate({ id, data: { status } });
    toast({ title: `Status updated to ${status}` });
  };

  const handleDelete = (id) => {
    if (window.confirm("Permanently delete this submission?")) {
      deleteMutation.mutate(id);
      toast({ title: "Submission deleted" });
    }
  };

  const handleRecalcRanks = async () => {
    const approved = submissions
      .filter(s => s.status === "approved")
      .sort((a, b) => (b.total_score || 0) - (a.total_score || 0));

    for (let i = 0; i < approved.length; i++) {
      const newRank = i < 10 ? i + 1 : 0;
      if (approved[i].rank !== newRank) {
        await base44.entities.Submission.update(approved[i].id, { rank: newRank });
      }
    }
    queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
    toast({ title: "Rankings recalculated" });
  };

  const handleExport = () => {
    const csv = [
      ["ID", "Answer", "Email", "Alias", "Status", "Unhinged", "Think", "Trust", "Total", "Rank", "Created"],
      ...submissions.map(s => [
        s.id, `"${s.answer}"`, s.email, s.alias || "", s.status,
        s.votes_unhinged || 0, s.votes_think || 0, s.votes_trust || 0,
        s.total_score || 0, s.rank || 0, s.created_date || "",
      ]),
    ].map(r => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trust-wall-submissions.csv";
    a.click();
  };

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(s => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (search && !s.answer.toLowerCase().includes(search.toLowerCase()) &&
          !(s.email || "").toLowerCase().includes(search.toLowerCase()) &&
          !(s.alias || "").toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [submissions, statusFilter, search]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Trust Wall Admin</h1>
              <p className="text-sm text-muted-foreground font-body">Manage submissions, votes, and rankings</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRecalcRanks} className="font-body border-border">
              <Trophy size={14} className="mr-1.5" />
              Recalc Rankings
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} className="font-body border-border">
              <Download size={14} className="mr-1.5" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <AdminStats submissions={submissions} />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search answers, emails..."
              className="pl-9 bg-secondary border-border font-body text-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 bg-secondary border-border font-body text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
              <SelectItem value="removed">Removed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-submissions"] })}>
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </Button>
        </div>

        {/* Table */}
        <SubmissionTable
          submissions={filteredSubmissions}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDelete}
        />

        <p className="text-xs text-muted-foreground font-mono mt-4 text-center">
          Showing {filteredSubmissions.length} of {submissions.length} submissions
        </p>
      </div>
    </div>
  );
}