import { auth } from "@clerk/nextjs/server"
import { OrganizationSwitcher } from "@clerk/nextjs"

import { TodoApp } from "@/components/todo-app"
import { getTodos } from "@/lib/actions/todos"

export default async function Page() {
  const { orgId } = await auth()

  if (!orgId) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-lg font-bold">Wähle eine Organisation, um loszulegen.</p>
        <OrganizationSwitcher hidePersonal />
      </div>
    )
  }

  const todos = await getTodos()

  return <TodoApp initialTodos={todos} />
}
