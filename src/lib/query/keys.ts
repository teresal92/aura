export const taskKeys = {
  all: ['tasks'] as const,
  user: (userId: string) => [...taskKeys.all, userId] as const,
}
