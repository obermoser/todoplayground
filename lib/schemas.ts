import * as z from "zod"

export const TodoItemSchema = z.object({
  id: z.uuidv4(),
  title: z.string().min(3, "Minimum 3 Zeichen!"),
  isCompleted: z.boolean().default(false),
  description: z.string().max(200, "Maximum 200 Zeichen!").optional()
})

export type TodoItem = z.infer<typeof TodoItemSchema>
