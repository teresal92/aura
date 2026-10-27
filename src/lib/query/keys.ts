export const taskKeys = {
  all: ['tasks'] as const,
  user: (userId: string) => [...taskKeys.all, userId] as const,
}

// Completing and deleting share a prefix, so a card can find the latest change to its task.
export const taskMutationKeys = {
  change: ['tasks', 'change'] as const,
  setCompleted: ['tasks', 'change', 'setCompleted'] as const,
  delete: ['tasks', 'change', 'delete'] as const,
}
