import * as z from "zod"

export const TodoItemSchema = z.object({
  id: z.uuidv4(),
  title: z.string().min(3, "Minimum 3 Zeichen!"),
  isCompleted: z.boolean().default(false),
})

export type TodoItem = z.infer<typeof TodoItemSchema>
