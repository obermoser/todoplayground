import { TodoApp } from "@/components/todo-app"
import { getTodos } from "@/lib/actions/todos"

export default async function Page() {
  const todos = await getTodos()

  return <TodoApp initialTodos={todos} />
}
