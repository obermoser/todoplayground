import { create } from "zustand"
import { mockTodos } from "../mockdata"
import { TodoItem } from "../schemas"

const mockTodoData: TodoItem[] = mockTodos

type TodoState = {
  todos: TodoItem[]
  addTodo: (title: string) => void
  toggleTodo: (id: string) => void
  removeTodo: (id: string) => void
}

export const useTodoStore = create<TodoState>((set) => ({
  todos: mockTodoData,
  addTodo: (title) =>
    set((state) => ({
      todos: [
        ...state.todos,
        { id: crypto.randomUUID(), title, isCompleted: false },
      ],
    })),

  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
      ),
    })),
  removeTodo: (id) =>
    set((state) => ({ todos: state.todos.filter((t) => t.id !== id) })),
}))
