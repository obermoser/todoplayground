import { get as idbGet, set as idbSet, del as idbDel } from "idb-keyval"
import { create } from "zustand"
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware"
import { TodoItem } from "../schemas"

const indexedDbStorage: StateStorage = {
  getItem: async (name) => (await idbGet(name)) ?? null,
  setItem: async (name, value) => idbSet(name, value),
  removeItem: async (name) => idbDel(name),
}

type TodoState = {
  todos: TodoItem[]
  addTodo: (title: string, description?: string) => void
  toggleTodo: (id: string) => void
  removeTodo: (id: string) => void
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set) => ({
      todos: [],
      addTodo: (title, description) =>
        set((state) => ({
          todos: [
            ...state.todos,
            { id: crypto.randomUUID(), title, description, isCompleted: false },
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
    }),
    {
      name: "todo-storage",
      storage: createJSONStorage(() => indexedDbStorage),
      partialize: (state) => ({ todos: state.todos }),
    }
  )
)
