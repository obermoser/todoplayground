"use server"

import { auth } from "@clerk/nextjs/server"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { getDb } from "@/lib/db"
import { NewTodoSchema, todos } from "@/lib/db/schema"

async function requireOrgContext() {
  const { userId, orgId } = await auth()
  if (!userId) throw new Error("Unauthorized")
  if (!orgId) throw new Error("No active organization")
  return { userId, orgId }
}

export async function getTodos() {
  const { orgId } = await requireOrgContext()
  return getDb().select().from(todos).where(eq(todos.organizationId, orgId))
}

export async function addTodo(title: string, description?: string | null) {
  const { userId, orgId } = await requireOrgContext()
  const result = NewTodoSchema.parse({ title, description })

  await getDb().insert(todos).values({
    organizationId: orgId,
    userId,
    title: result.title,
    description: result.description,
  })

  revalidatePath("/")
}

export async function toggleTodo(id: string) {
  const { orgId } = await requireOrgContext()
  const db = getDb()

  const [existing] = await db
    .select({ isCompleted: todos.isCompleted })
    .from(todos)
    .where(and(eq(todos.id, id), eq(todos.organizationId, orgId)))

  if (!existing) throw new Error("Not found")

  await db
    .update(todos)
    .set({ isCompleted: !existing.isCompleted })
    .where(and(eq(todos.id, id), eq(todos.organizationId, orgId)))

  revalidatePath("/")
}

export async function removeTodo(id: string) {
  const { orgId } = await requireOrgContext()

  await getDb()
    .delete(todos)
    .where(and(eq(todos.id, id), eq(todos.organizationId, orgId)))

  revalidatePath("/")
}
