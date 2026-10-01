"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { TodoItemSchema } from "@/lib/schemas";
import { useTodoStore } from "@/lib/stores/todoStore";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
type Filter = "open" | "completed" | "all";

const NewTodoSchema = TodoItemSchema.pick({ title: true, description: true });

export default function Page() {
  const todos = useTodoStore((s) => s.todos);
  const addTodoItem = useTodoStore((s) => s.addTodo);
  const toggleTodo = useTodoStore((s) => s.toggleTodo);
  const removeTodo = useTodoStore((s) => s.removeTodo);
  const [filter, setFilter] = useState<Filter>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedTodo = useMemo(
    () => todos.find((t) => t.id === selectedId) ?? null,
    [todos, selectedId]
  );

  const handleAdd = () => {
    const result = NewTodoSchema.safeParse({
      title: newTitle,
      description: newDescription.trim() || undefined,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        title: fieldErrors.title?.[0],
        description: fieldErrors.description?.[0],
      });
      return;
    }

    addTodoItem(result.data.title, result.data.description);
    setNewTitle("");
    setNewDescription("");
    setErrors({});
    setIsAddOpen(false);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setIsAddOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const visible = useMemo(() => {
    if (filter === "open") return todos.filter((t) => !t.isCompleted);
    if (filter === "completed") return todos.filter((t) => t.isCompleted);
    return todos;
  }, [todos, filter]);
  return (
    <div className="flex min-h-svh p-6 flex-col mx-auto max-w-xl gap-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-black uppercase tracking-tight">
            Todos
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <TabsList className="h-14">
              <TabsTrigger className="text-xl font-black" value="all">Alle</TabsTrigger>
              <TabsTrigger className="text-xl font-black" value="open">Offen</TabsTrigger>
              <TabsTrigger className="text-xl font-black" value="completed">Erledigt</TabsTrigger>
            </TabsList>

            <TabsContent value={filter}>
              <ul>
                {visible.map((t) => (
                  <li
                    key={t.id}
                    className="flex cursor-pointer items-center justify-between gap-2"
                    onClick={() => setSelectedId(t.id)}
                  >
                    <span className="flex items-center gap-2 text-lg font-bold">
                      <span
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTodo(t.id);
                        }}
                      >
                        {t.isCompleted ? "✅" : "⬜"}
                      </span>
                      {t.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTodo(t.id);
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </li>
                ))}
              </ul>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Button
        className="h-14 text-xl font-black uppercase"
        onClick={() => setIsAddOpen(true)}
      >
        <Plus /> neu
      </Button>

      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent
          side="bottom"
          onSubmit={(e) => {
            e.preventDefault();
            handleAdd();
          }}
          render={<form />}
        >
          <SheetHeader>
            <SheetTitle className="text-3xl font-black uppercase tracking-tight">
              Neues Todo
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-3 px-4">
            <div className="flex flex-col gap-1">
              <Input
                autoFocus
                className="h-14 text-xl font-bold"
                placeholder="Was gibt es zu tun?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              {errors.title && (
                <span className="text-sm text-destructive">{errors.title}</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Textarea
                placeholder="Beschreibung (optional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
              {errors.description && (
                <span className="text-sm text-destructive">{errors.description}</span>
              )}
            </div>
          </div>

          <SheetFooter>
            <Button
              className="h-14 text-xl font-black uppercase"
              type="submit"
              disabled={!newTitle.trim()}
            >
              Hinzufügen
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet
        open={!!selectedTodo}
        onOpenChange={(open) => !open && setSelectedId(null)}
      >
        <SheetContent side="bottom">
          {selectedTodo && (
            <>
              <SheetHeader>
                <SheetTitle className="text-3xl font-black uppercase tracking-tight">
                  {selectedTodo.title}
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-3 px-4">
                <span
                  className="w-fit cursor-pointer text-lg font-black uppercase tracking-tight"
                  onClick={() => toggleTodo(selectedTodo.id)}
                >
                  {selectedTodo.isCompleted ? "✅ Erledigt" : "⬜ Offen"}
                </span>

                {selectedTodo.description && (
                  <p className="text-base font-semibold whitespace-pre-wrap">
                    {selectedTodo.description}
                  </p>
                )}
              </div>

              <SheetFooter>
                <Button
                  className="h-14 text-xl font-black uppercase"
                  variant="destructive"
                  onClick={() => {
                    removeTodo(selectedTodo.id);
                    setSelectedId(null);
                  }}
                >
                  <Trash2 /> Löschen
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
