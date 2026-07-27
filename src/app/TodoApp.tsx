"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Priority = "basse" | "normale" | "haute";

type Todo = {
  id: string;
  text: string;
  done: boolean;
  priority: Priority;
  createdAt: number;
};

type Filter = "toutes" | "actives" | "terminees";

const STORAGE_KEY = "todo-app.items.v1";

const PRIORITY_STYLES: Record<Priority, { label: string; dot: string; ring: string }> = {
  haute: { label: "Haute", dot: "bg-rose-500", ring: "ring-rose-500/30" },
  normale: { label: "Normale", dot: "bg-amber-500", ring: "ring-amber-500/30" },
  basse: { label: "Basse", dot: "bg-emerald-500", ring: "ring-emerald-500/30" },
};

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState<Priority>("normale");
  const [filter, setFilter] = useState<Filter>("toutes");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // One-time hydration from localStorage on mount; no subscription API exists for this.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setTodos(JSON.parse(raw));
    } catch {
      // ignore corrupted storage
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos, hydrated]);

  useEffect(() => {
    if (editingId) editInputRef.current?.focus();
  }, [editingId]);

  const remaining = useMemo(() => todos.filter((t) => !t.done).length, [todos]);
  const total = todos.length;
  const progress = total === 0 ? 0 : Math.round(((total - remaining) / total) * 100);

  const visibleTodos = useMemo(() => {
    const filtered = todos.filter((t) => {
      if (filter === "actives") return !t.done;
      if (filter === "terminees") return t.done;
      return true;
    });
    const order: Record<Priority, number> = { haute: 0, normale: 1, basse: 2 };
    return [...filtered].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (order[a.priority] !== order[b.priority]) return order[a.priority] - order[b.priority];
      return b.createdAt - a.createdAt;
    });
  }, [todos, filter]);

  function addTodo() {
    const text = input.trim();
    if (!text) return;
    setTodos((prev) => [
      { id: uid(), text, done: false, priority, createdAt: Date.now() },
      ...prev,
    ]);
    setInput("");
  }

  function toggleTodo(id: string) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function deleteTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function startEditing(todo: Todo) {
    setEditingId(todo.id);
    setEditingText(todo.text);
  }

  function commitEditing() {
    const text = editingText.trim();
    if (editingId && text) {
      setTodos((prev) => prev.map((t) => (t.id === editingId ? { ...t, text } : t)));
    }
    setEditingId(null);
    setEditingText("");
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.done));
  }

  return (
    <div className="w-full max-w-xl">
      <header className="mb-8">
        <p className="text-sm font-medium tracking-wide text-accent uppercase">
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        <h1 className="mt-1 text-4xl font-bold tracking-tight">Ma liste de tâches</h1>

        <div className="mt-5 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="whitespace-nowrap text-sm text-muted">
            {total === 0 ? "0 tâche" : `${total - remaining}/${total} terminées`}
          </span>
        </div>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          addTodo();
        }}
        className="mb-6 flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ajouter une tâche…"
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-base outline-none placeholder:text-muted"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="shrink-0 rounded-xl border border-border bg-transparent px-2 py-2 text-sm text-muted outline-none"
          aria-label="Priorité"
        >
          <option value="basse">Basse</option>
          <option value="normale">Normale</option>
          <option value="haute">Haute</option>
        </select>
        <button
          type="submit"
          disabled={!input.trim()}
          className="shrink-0 rounded-xl bg-accent px-4 py-2.5 font-medium text-white transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Ajouter
        </button>
      </form>

      <div className="mb-4 flex gap-1 rounded-xl bg-border/60 p-1 text-sm font-medium">
        {(
          [
            ["toutes", "Toutes"],
            ["actives", "Actives"],
            ["terminees", "Terminées"],
          ] as [Filter, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`flex-1 rounded-lg px-3 py-1.5 transition-colors ${
              filter === value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-2">
        {visibleTodos.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">
            {filter === "terminees"
              ? "Aucune tâche terminée pour l'instant."
              : filter === "actives"
              ? "Rien à faire — profitez-en ✨"
              : "Votre liste est vide. Ajoutez votre première tâche !"}
          </li>
        )}

        {visibleTodos.map((todo) => (
          <li
            key={todo.id}
            className="todo-enter group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
          >
            <button
              onClick={() => toggleTodo(todo.id)}
              aria-label={todo.done ? "Marquer comme active" : "Marquer comme terminée"}
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                todo.done
                  ? "border-accent bg-accent text-white"
                  : "border-border text-transparent hover:border-accent"
              }`}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4L8.5 12l6.8-6.8a1 1 0 011.4 0z" />
              </svg>
            </button>

            <span
              className={`h-2 w-2 shrink-0 rounded-full ${PRIORITY_STYLES[todo.priority].dot}`}
              title={`Priorité ${PRIORITY_STYLES[todo.priority].label}`}
            />

            {editingId === todo.id ? (
              <input
                ref={editInputRef}
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onBlur={commitEditing}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitEditing();
                  if (e.key === "Escape") {
                    setEditingId(null);
                    setEditingText("");
                  }
                }}
                className="min-w-0 flex-1 rounded-lg border border-accent/40 bg-transparent px-2 py-1 outline-none"
              />
            ) : (
              <button
                onDoubleClick={() => startEditing(todo)}
                className={`min-w-0 flex-1 truncate text-left ${
                  todo.done ? "text-muted line-through decoration-2" : ""
                }`}
                title="Double-cliquez pour modifier"
              >
                {todo.text}
              </button>
            )}

            <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              <button
                onClick={() => startEditing(todo)}
                aria-label="Modifier"
                className="rounded-lg p-1.5 text-muted hover:bg-accent-soft hover:text-accent"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path d="M14.7 2.3a1 1 0 011.4 0l1.6 1.6a1 1 0 010 1.4L16 7l-3-3 1.7-1.7zM12 5l3 3-8.1 8.1a1 1 0 01-.5.27l-3 .7a.5.5 0 01-.6-.6l.7-3a1 1 0 01.27-.5L12 5z" />
                </svg>
              </button>
              <button
                onClick={() => deleteTodo(todo.id)}
                aria-label="Supprimer"
                className="rounded-lg p-1.5 text-muted hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path
                    fillRule="evenodd"
                    d="M8 2a1 1 0 00-1 1v1H4a1 1 0 000 2h.1l.8 10.1A2 2 0 006.9 18h6.2a2 2 0 002-1.9L16 6h.1a1 1 0 000-2H13V3a1 1 0 00-1-1H8zm1 5a1 1 0 012 0v7a1 1 0 01-2 0V7zm-3 1a1 1 0 011 1v6a1 1 0 01-2 0V8a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>

      {total > 0 && (
        <div className="mt-5 flex items-center justify-between text-sm text-muted">
          <span>{remaining} restante{remaining !== 1 ? "s" : ""}</span>
          <button
            onClick={clearCompleted}
            disabled={remaining === total}
            className="font-medium hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            Effacer les terminées
          </button>
        </div>
      )}
    </div>
  );
}
