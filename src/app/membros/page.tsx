"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getToken } from "@/lib/api";
import Nav from "@/components/Nav";

type Member = { id: string; name: string; email?: string; phone?: string };

export default function MembrosPage() {
  const router = useRouter();
  const [list, setList] = useState<Member[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getToken()) { router.push("/login"); return; }
    apiFetch("/members").then(setList).catch(() => router.push("/login"));
  }, [router]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault(); setError("");
    try {
      await apiFetch("/members", { method: "POST", body: JSON.stringify({ name, email: email || undefined, phone: phone || undefined }) });
      setName(""); setEmail(""); setPhone("");
      setList(await apiFetch("/members"));
    } catch (err) { setError(err instanceof Error ? err.message : "Erro"); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover membro?")) return;
    await apiFetch(`/members/${id}`, { method: "DELETE" });
    setList((p) => p.filter((m) => m.id !== id));
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Nav />
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="mb-4 text-xl font-bold text-zinc-800">Membros</h1>
        <form onSubmit={handleAdd} className="mb-4 flex flex-wrap gap-2">
          <input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} required
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-violet-500" />
          <input placeholder="E-mail (opcional)" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-48 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-violet-500" />
          <input placeholder="Telefone (opcional)" value={phone} onChange={(e) => setPhone(e.target.value)}
            className="w-40 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-violet-500" />
          <button type="submit" className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-medium text-white hover:bg-violet-800">
            Adicionar
          </button>
        </form>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <div className="space-y-2">
          {list.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
              <div>
                <p className="font-medium text-zinc-800">{m.name}</p>
                <p className="text-sm text-zinc-500">{[m.email, m.phone].filter(Boolean).join(" · ") || "Sem contato"}</p>
              </div>
              <button onClick={() => handleDelete(m.id)} className="text-xs text-red-500 hover:text-red-700">Remover</button>
            </div>
          ))}
          {list.length === 0 && <p className="text-center text-zinc-400">Nenhum membro cadastrado.</p>}
        </div>
      </main>
    </div>
  );
}
