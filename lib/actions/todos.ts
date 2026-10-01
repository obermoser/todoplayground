"use server"

import { auth } from "@clerk/nextjs/server"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { getDb } from "@/lib/db"
import { todos } from "@/lib/db/schema"
import { TodoItemSchema } from "@/lib/schemas"

const NewTodoSchema = TodoItemSchema.pick({ title: true, description: true })

async function requireUserId() {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")
  return userId
}

export async function getTodos() {
  const userId = await requireUserId()
  return getDb().select().from(todos).where(eq(todos.userId, userId))
}

export async function addTodo(title: string, description?: string) {
  const userId = await requireUserId()
  const result = NewTodoSchema.parse({ title, description })

  await getDb().insert(todos).values({
    userId,
    title: result.title,
    description: result.description,
  })

  revalidatePath("/")
}

export async function toggleTodo(id: string) {
  const userId = await requireUserId()
  const db = getDb()

  const [existing] = await db
    .select({ isCompleted: todos.isCompleted })
    .from(todos)
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))

  if (!existing) throw new Error("Not found")

  await db
    .update(todos)
    .set({ isCompleted: !existing.isCompleted })
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))

  revalidatePath("/")
}

export async function removeTodo(id: string) {
  const userId = await requireUserId()

  await getDb()
    .delete(todos)
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))

  revalidatePath("/")
}
