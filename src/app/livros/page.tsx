"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getToken } from "@/lib/api";
import Nav from "@/components/Nav";

type Author = { id: string; name: string };
type Book = { id: string; title: string; isbn?: string; year?: number; author: Author };

export default function LivrosPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [title, setTitle] = useState("");
  const [isbn, setIsbn] = useState("");
  const [year, setYear] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!getToken()) { router.push("/login"); return; }
    Promise.all([apiFetch("/books"), apiFetch("/authors")])
      .then(([b, a]) => { setBooks(b); setAuthors(a); })
      .catch(() => router.push("/login"));
  }, [router]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      await apiFetch("/books", {
        method: "POST",
        body: JSON.stringify({ title, isbn: isbn || undefined, year: year ? Number(year) : undefined, authorId }),
      });
      setTitle(""); setIsbn(""); setYear(""); setAuthorId("");
      setBooks(await apiFetch("/books"));
    } catch (err) { setError(err instanceof Error ? err.message : "Erro ao salvar"); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover livro?")) return;
    await apiFetch(`/books/${id}`, { method: "DELETE" });
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Nav />
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="mb-4 text-xl font-bold text-zinc-800">Livros</h1>

        <form onSubmit={handleAdd} className="mb-6 rounded-xl bg-white p-4 shadow-sm">
          <p className="mb-3 font-medium text-zinc-700">Novo livro</p>
          {error && <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} required
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-violet-500" />
            <select value={authorId} onChange={(e) => setAuthorId(e.target.value)} required
              className="w-48 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-violet-500">
              <option value="">Autor...</option>
              {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <input placeholder="ISBN" value={isbn} onChange={(e) => setIsbn(e.target.value)}
              className="w-36 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-violet-500" />
            <input placeholder="Ano" type="number" value={year} onChange={(e) => setYear(e.target.value)}
              className="w-24 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-violet-500" />
            <button type="submit" disabled={loading}
              className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-medium text-white hover:bg-violet-800 disabled:opacity-50">
              {loading ? "..." : "Adicionar"}
            </button>
          </div>
        </form>

        <div className="space-y-2">
          {books.map((book) => (
            <div key={book.id} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
              <div>
                <p className="font-medium text-zinc-800">{book.title}</p>
                <p className="text-sm text-zinc-500">
                  {book.author.name}
                  {book.year && ` · ${book.year}`}
                  {book.isbn && ` · ISBN ${book.isbn}`}
                </p>
              </div>
              <button onClick={() => handleDelete(book.id)} className="text-xs text-red-500 hover:text-red-700">Remover</button>
            </div>
          ))}
          {books.length === 0 && <p className="text-center text-zinc-400">Nenhum livro cadastrado.</p>}
        </div>
      </main>
    </div>
  );
}
