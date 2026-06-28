"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getToken } from "@/lib/api";
import Nav from "@/components/Nav";

type Book = { id: string; title: string; author: { name: string } };
type Copy = { id: string; code: string; status: "AVAILABLE" | "LOANED"; book: { title: string } };

export default function ExemplaresPage() {
  const router = useRouter();
  const [copies, setCopies] = useState<Copy[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [bookId, setBookId] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!getToken()) { router.push("/login"); return; }
    Promise.all([apiFetch("/copies"), apiFetch("/books")])
      .then(([c, b]) => { setCopies(c); setBooks(b); })
      .catch(() => router.push("/login"));
  }, [router]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      await apiFetch("/copies", { method: "POST", body: JSON.stringify({ bookId, code }) });
      setBookId(""); setCode("");
      setCopies(await apiFetch("/copies"));
    } catch (err) { setError(err instanceof Error ? err.message : "Erro ao cadastrar"); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover exemplar?")) return;
    await apiFetch(`/copies/${id}`, { method: "DELETE" });
    setCopies((p) => p.filter((c) => c.id !== id));
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Nav />
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="mb-4 text-xl font-bold text-zinc-800">Exemplares</h1>

        <form onSubmit={handleAdd} className="mb-6 rounded-xl bg-white p-4 shadow-sm">
          <p className="mb-3 font-medium text-zinc-700">Novo exemplar</p>
          {error && <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <select value={bookId} onChange={(e) => setBookId(e.target.value)} required
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-violet-500">
              <option value="">Selecionar livro...</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>{b.title} — {b.author.name}</option>
              ))}
            </select>
            <input placeholder="Código (ex: EX-001)" value={code} onChange={(e) => setCode(e.target.value)} required
              className="w-40 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-violet-500" />
            <button type="submit" disabled={loading}
              className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-medium text-white hover:bg-violet-800 disabled:opacity-50">
              {loading ? "..." : "Cadastrar"}
            </button>
          </div>
        </form>

        <div className="space-y-2">
          {copies.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
              <div>
                <p className="font-medium text-zinc-800">{c.book.title}</p>
                <p className="text-sm text-zinc-500">Código: {c.code}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${c.status === "AVAILABLE" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  {c.status === "AVAILABLE" ? "Disponível" : "Emprestado"}
                </span>
                {c.status === "AVAILABLE" && (
                  <button onClick={() => handleDelete(c.id)} className="text-xs text-red-500 hover:text-red-700">Remover</button>
                )}
              </div>
            </div>
          ))}
          {copies.length === 0 && <p className="text-center text-zinc-400">Nenhum exemplar cadastrado.</p>}
        </div>
      </main>
    </div>
  );
}
