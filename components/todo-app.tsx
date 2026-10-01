"use client"

import { Plus, Trash2 } from "lucide-react"
import { useEffect, useMemo, useOptimistic, useState, useTransition } from "react"

import { addTodo, removeTodo, toggleTodo } from "@/lib/actions/todos"
import { NewTodoSchema, type Todo } from "@/lib/db/schema"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

type Filter = "open" | "completed" | "all"

type TodoView = Pick<Todo, "id" | "title" | "description" | "isCompleted">

type OptimisticAction =
  | { type: "add"; todo: TodoView }
  | { type: "toggle"; id: string }
  | { type: "remove"; id: string }

export function TodoApp({ initialTodos }: { initialTodos: TodoView[] }) {
  const [todos, applyOptimistic] = useOptimistic(
    initialTodos,
    (state: TodoView[], action: OptimisticAction) => {
      switch (action.type) {
        case "add":
          return [...state, action.todo]
        case "toggle":
          return state.map((t) =>
            t.id === action.id ? { ...t, isCompleted: !t.isCompleted } : t
          )
        case "remove":
          return state.filter((t) => t.id !== action.id)
      }
    }
  )
  const [, startTransition] = useTransition()
  const [filter, setFilter] = useState<Filter>("all")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({})
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedTodo = useMemo(
    () => todos.find((t) => t.id === selectedId) ?? null,
    [todos, selectedId]
  )

  const handleAdd = () => {
    const result = NewTodoSchema.safeParse({
      title: newTitle,
      description: newDescription.trim() || undefined,
    })

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      setErrors({
        title: fieldErrors.title?.[0],
        description: fieldErrors.description?.[0],
      })
      return
    }

    const { title, description } = result.data
    startTransition(async () => {
      applyOptimistic({
        type: "add",
        todo: {
          id: crypto.randomUUID(),
          title,
          description: description ?? null,
          isCompleted: false,
        },
      })
      await addTodo(title, description)
    })

    setNewTitle("")
    setNewDescription("")
    setErrors({})
    setIsAddOpen(false)
  }

  const handleToggle = (id: string) => {
    startTransition(async () => {
      applyOptimistic({ type: "toggle", id })
      await toggleTodo(id)
    })
  }

  const handleRemove = (id: string) => {
    startTransition(async () => {
      applyOptimistic({ type: "remove", id })
      await removeTodo(id)
    })
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
        e.preventDefault()
        setIsAddOpen(true)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const visible = useMemo(() => {
    if (filter === "open") return todos.filter((t) => !t.isCompleted)
    if (filter === "completed") return todos.filter((t) => t.isCompleted)
    return todos
  }, [todos, filter])

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
                          e.stopPropagation()
                          handleToggle(t.id)
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
                        e.stopPropagation()
                        handleRemove(t.id)
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
            e.preventDefault()
            handleAdd()
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
                  onClick={() => handleToggle(selectedTodo.id)}
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
                    handleRemove(selectedTodo.id)
                    setSelectedId(null)
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
