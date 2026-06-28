"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getToken } from "@/lib/api";
import Nav from "@/components/Nav";

type Member = { id: string; name: string };
type Copy = { id: string; code: string; status: string; book: { title: string } };
type Loan = {
  id: string; loanedAt: string; dueAt: string; returnedAt?: string;
  copy: { code: string; book: { title: string } };
  member: { name: string };
};

export default function EmprestimosPage() {
  const router = useRouter();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [copies, setCopies] = useState<Copy[]>([]);
  const [copyId, setCopyId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadAll() {
    const [l, m, c] = await Promise.all([apiFetch("/loans"), apiFetch("/members"), apiFetch("/copies")]);
    setLoans(l); setMembers(m); setCopies(c);
  }

  useEffect(() => {
    if (!getToken()) { router.push("/login"); return; }
    loadAll().catch(() => router.push("/login"));
  }, [router]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      await apiFetch("/loans", { method: "POST", body: JSON.stringify({ copyId, memberId, dueAt: new Date(dueAt).toISOString() }) });
      setCopyId(""); setMemberId(""); setDueAt("");
      await loadAll();
    } catch (err) { setError(err instanceof Error ? err.message : "Erro ao criar empréstimo"); }
    finally { setLoading(false); }
  }

  async function handleReturn(id: string) {
    await apiFetch(`/loans/${id}/return`, { method: "PATCH" });
    await loadAll();
  }

  const availableCopies = copies.filter((c) => c.status === "AVAILABLE");

  return (
    <div className="min-h-screen bg-zinc-50">
      <Nav />
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="mb-4 text-xl font-bold text-zinc-800">Empréstimos</h1>

        <form onSubmit={handleAdd} className="mb-6 rounded-xl bg-white p-4 shadow-sm">
          <p className="mb-3 font-medium text-zinc-700">Novo empréstimo</p>
          {error && <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <select value={copyId} onChange={(e) => setCopyId(e.target.value)} required
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-violet-500">
              <option value="">Selecionar exemplar...</option>
              {availableCopies.map((c) => <option key={c.id} value={c.id}>{c.book.title} (#{c.code})</option>)}
            </select>
            <select value={memberId} onChange={(e) => setMemberId(e.target.value)} required
              className="w-48 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-violet-500">
              <option value="">Selecionar membro...</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} required
              className="w-40 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-violet-500" />
            <button type="submit" disabled={loading}
              className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-medium text-white hover:bg-violet-800 disabled:opacity-50">
              {loading ? "..." : "Emprestar"}
            </button>
          </div>
        </form>

        <div className="space-y-2">
          {loans.map((loan) => {
            const returned = !!loan.returnedAt;
            const overdue = !returned && new Date(loan.dueAt) < new Date();
            return (
              <div key={loan.id} className={`flex items-center justify-between rounded-xl px-4 py-3 shadow-sm ${overdue ? "bg-red-50 border border-red-200" : "bg-white"}`}>
                <div>
                  <p className="font-medium text-zinc-800">
                    {loan.copy.book.title}
                    <span className="ml-1 text-xs text-zinc-400">#{loan.copy.code}</span>
                    {overdue && <span className="ml-2 text-xs font-medium text-red-600">⚠ Atrasado</span>}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {loan.member.name} · Devolução: {new Date(loan.dueAt).toLocaleDateString("pt-BR")}
                    {returned && ` · Devolvido em ${new Date(loan.returnedAt!).toLocaleDateString("pt-BR")}`}
                  </p>
                </div>
                {!returned && (
                  <button onClick={() => handleReturn(loan.id)}
                    className="rounded-lg bg-green-100 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-200">
                    Devolver
                  </button>
                )}
                {returned && <span className="text-xs text-zinc-400">Devolvido</span>}
              </div>
            );
          })}
          {loans.length === 0 && <p className="text-center text-zinc-400">Nenhum empréstimo registrado.</p>}
        </div>
      </main>
    </div>
  );
}
