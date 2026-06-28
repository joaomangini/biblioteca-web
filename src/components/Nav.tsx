"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearTokens } from "@/lib/api";

export default function Nav() {
  const router = useRouter();
  function logout() { clearTokens(); router.push("/login"); }

  return (
    <nav className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3">
      <div className="flex items-center gap-6">
        <Link href="/livros" className="font-bold text-violet-700">
          📚 Biblioteca
        </Link>
        <Link href="/livros" className="text-sm text-zinc-600 hover:text-violet-700">Livros</Link>
        <Link href="/autores" className="text-sm text-zinc-600 hover:text-violet-700">Autores</Link>
        <Link href="/membros" className="text-sm text-zinc-600 hover:text-violet-700">Membros</Link>
        <Link href="/emprestimos" className="text-sm text-zinc-600 hover:text-violet-700">Empréstimos</Link>
      </div>
      <button onClick={logout} className="text-sm text-zinc-500 hover:text-zinc-800">Sair</button>
    </nav>
  );
}
