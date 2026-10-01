import { boolean, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import * as z from "zod"

export const todos = pgTable("todos", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: varchar("organization_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  isCompleted: boolean("is_completed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const TodoSchema = createSelectSchema(todos)
export type Todo = z.infer<typeof TodoSchema>

export const NewTodoSchema = createInsertSchema(todos, {
  title: (schema) => schema.min(3, "Minimum 3 Zeichen!"),
  description: (schema) => schema.max(200, "Maximum 200 Zeichen!"),
}).pick({ title: true, description: true })
