"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getToken } from "@/lib/api";
import Nav from "@/components/Nav";

type Author = { id: string; name: string };

export default function AutoresPage() {
  const router = useRouter();
  const [list, setList] = useState<Author[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getToken()) { router.push("/login"); return; }
    apiFetch("/authors").then(setList).catch(() => router.push("/login"));
  }, [router]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault(); setError("");
    try {
      await apiFetch("/authors", { method: "POST", body: JSON.stringify({ name }) });
      setName(""); setList(await apiFetch("/authors"));
    } catch (err) { setError(err instanceof Error ? err.message : "Erro"); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover autor?")) return;
    await apiFetch(`/authors/${id}`, { method: "DELETE" });
    setList((p) => p.filter((a) => a.id !== id));
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Nav />
      <main className="mx-auto max-w-xl p-6">
        <h1 className="mb-4 text-xl font-bold text-zinc-800">Autores</h1>
        <form onSubmit={handleAdd} className="mb-4 flex gap-2">
          <input placeholder="Nome do autor" value={name} onChange={(e) => setName(e.target.value)} required
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-violet-500" />
          <button type="submit" className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-medium text-white hover:bg-violet-800">
            Adicionar
          </button>
        </form>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <div className="space-y-2">
          {list.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
              <span className="font-medium text-zinc-800">{a.name}</span>
              <button onClick={() => handleDelete(a.id)} className="text-xs text-red-500 hover:text-red-700">Remover</button>
            </div>
          ))}
          {list.length === 0 && <p className="text-center text-zinc-400">Nenhum autor cadastrado.</p>}
        </div>
      </main>
    </div>
  );
}
