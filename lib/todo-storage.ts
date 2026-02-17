import type { FinancialTodo } from './types'

const TODO_STORAGE_KEY = 'expense_tracker_financial_todos'

export function getTodos(userId: string): FinancialTodo[] {
  try {
    const data = localStorage.getItem(TODO_STORAGE_KEY)
    const all: FinancialTodo[] = data ? JSON.parse(data) : []
    return all.filter((todo) => todo.userId === userId).sort((a, b) => {
      // Sort by: incomplete first, then by priority (high -> low), then by due date
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  } catch {
    return []
  }
}

export function addTodo(todo: Omit<FinancialTodo, 'id' | 'createdAt'>): FinancialTodo {
  const data = localStorage.getItem(TODO_STORAGE_KEY)
  const all: FinancialTodo[] = data ? JSON.parse(data) : []

  const newTodo: FinancialTodo = {
    ...todo,
    id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  }

  all.push(newTodo)
  localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(all))
  return newTodo
}

export function updateTodo(id: string, updates: Partial<FinancialTodo>): FinancialTodo | null {
  const data = localStorage.getItem(TODO_STORAGE_KEY)
  const all: FinancialTodo[] = data ? JSON.parse(data) : []

  const index = all.findIndex((todo) => todo.id === id)
  if (index === -1) return null

  all[index] = { ...all[index], ...updates }
  localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(all))
  return all[index]
}

export function deleteTodo(id: string): boolean {
  const data = localStorage.getItem(TODO_STORAGE_KEY)
  const all: FinancialTodo[] = data ? JSON.parse(data) : []

  const filtered = all.filter((todo) => todo.id !== id)
  if (filtered.length === all.length) return false

  localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(filtered))
  return true
}

export function toggleTodoComplete(id: string): FinancialTodo | null {
  const data = localStorage.getItem(TODO_STORAGE_KEY)
  const all: FinancialTodo[] = data ? JSON.parse(data) : []

  const index = all.findIndex((todo) => todo.id === id)
  if (index === -1) return null

  all[index].completed = !all[index].completed
  localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(all))
  return all[index]
}
