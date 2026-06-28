"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, setTokens } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    const t = setTimeout(() => setSlow(true), 4000);
    try {
      const data = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      setTokens(data.accessToken, data.refreshToken);
      router.push("/livros");
    } catch (err) { setError(err instanceof Error ? err.message : "Erro ao entrar"); }
    finally { clearTimeout(t); setLoading(false); setSlow(false); }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-8">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-violet-700">📚 Entrar</h1>
        {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
        <label className="mb-1 block text-sm font-medium text-zinc-700">E-mail</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
          className="mb-4 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-violet-500" />
        <label className="mb-1 block text-sm font-medium text-zinc-700">Senha</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
          className="mb-6 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-violet-500" />
        <button type="submit" disabled={loading}
          className="w-full rounded-lg bg-violet-700 px-4 py-2 font-medium text-white hover:bg-violet-800 disabled:opacity-50">
          {loading ? "Entrando..." : "Entrar"}
        </button>
        {slow && <p className="mt-3 text-center text-xs text-zinc-500">⏳ Servidor acordando — pode levar ~1 min...</p>}
        <p className="mt-4 text-center text-sm text-zinc-500">
          Não tem conta?{" "}<Link href="/cadastro" className="font-medium text-violet-700">Cadastre-se</Link>
        </p>
      </form>
    </main>
  );
}
