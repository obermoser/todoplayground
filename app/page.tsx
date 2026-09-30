"use client"
import { Button } from "@/components/ui/button";
import { useTodoStore } from "@/lib/stores/todoStore";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

type Filter = "open" | "completed" | "all";

export default function Page() {
  const todos = useTodoStore((s) => s.todos);
  const addTodoItem = useTodoStore((s) => s.addTodo);
  const toggleTodo = useTodoStore((s) => s.toggleTodo);
  const [filter, setFilter] = useState<Filter>("completed");

  const visible = useMemo(() => {
    if (filter === "open") return todos.filter((t) => !t.isCompleted);
    if (filter === "completed") return todos.filter((t) => t.isCompleted);
    return todos;
  }, [todos, filter]);
  return (
    <div className="flex min-h-svh p-6 flex-col mx-auto max-w-md gap-3">
      <div className="flex gap-2">
        <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>Alle</Button>
        <Button variant={filter === "open" ? "default" : "outline"} onClick={() => setFilter("open")}>Offen</Button>
        <Button variant={filter === "completed" ? "default" : "outline"} onClick={() => setFilter("completed")}>Erledigt</Button>
      </div>

      <ul>
        {visible.map((t) => (
          <li key={t.id} onClick={() => toggleTodo(t.id)}>
            {t.isCompleted ? "✅" : "⬜"} {t.title}
          </li>
        ))}
      </ul>

      <Button onClick={() => addTodoItem("Barni ficken")}>
        <Plus /> add
      </Button>
    </div>
  )
}
