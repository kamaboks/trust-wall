import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Eye, EyeOff, Trash2, Siren, Brain, Handshake } from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  hidden: "bg-muted text-muted-foreground border-border",
  removed: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function SubmissionTable({ submissions, onUpdateStatus, onDelete }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/50 hover:bg-secondary/50">
            <TableHead className="font-mono text-xs">Answer</TableHead>
            <TableHead className="font-mono text-xs">Email</TableHead>
            <TableHead className="font-mono text-xs">Alias</TableHead>
            <TableHead className="font-mono text-xs">Votes</TableHead>
            <TableHead className="font-mono text-xs">Score</TableHead>
            <TableHead className="font-mono text-xs">Rank</TableHead>
            <TableHead className="font-mono text-xs">Status</TableHead>
            <TableHead className="font-mono text-xs">Date</TableHead>
            <TableHead className="font-mono text-xs text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((sub) => (
            <TableRow key={sub.id} className="hover:bg-secondary/30">
              <TableCell className="max-w-[200px]">
                <p className="text-sm font-body truncate" title={sub.answer}>{sub.answer}</p>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground font-mono">{sub.email}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{sub.alias || "—"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="flex items-center gap-0.5"><Siren size={10} />{sub.votes_unhinged || 0}</span>
                  <span className="flex items-center gap-0.5"><Brain size={10} />{sub.votes_think || 0}</span>
                  <span className="flex items-center gap-0.5"><Handshake size={10} />{sub.votes_trust || 0}</span>
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm font-bold">{sub.total_score || 0}</TableCell>
              <TableCell className="font-mono text-sm">
                {sub.rank > 0 && sub.rank <= 10 ? (
                  <Badge className="bg-primary/10 text-primary border-primary/20 font-mono">#{sub.rank}</Badge>
                ) : "—"}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={`${statusColors[sub.status]} text-[10px] font-mono`}>
                  {sub.status}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground font-mono">
                {sub.created_date ? format(new Date(sub.created_date), "MMM d") : "—"}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  {sub.status !== "approved" && (
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onUpdateStatus(sub.id, "approved")}>
                      <Check size={14} className="text-emerald-400" />
                    </Button>
                  )}
                  {sub.status !== "hidden" && (
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onUpdateStatus(sub.id, "hidden")}>
                      <EyeOff size={14} className="text-muted-foreground" />
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onUpdateStatus(sub.id, "removed")}>
                    <X size={14} className="text-destructive" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onDelete(sub.id)}>
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {submissions.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                No submissions yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}