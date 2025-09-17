import { z } from 'zod';

export const taskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  done: z.boolean().default(false),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

export const tasksResponseSchema = z.object({
  tasks: z.array(taskSchema),
});

export type Task = z.infer<typeof taskSchema>;
