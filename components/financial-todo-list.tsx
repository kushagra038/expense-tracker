'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TodoForm } from '@/components/todo-form'
import { CheckCircle2, Circle, Trash2, Edit2, Plus, AlertCircle } from 'lucide-react'
import type { FinancialTodo } from '@/lib/types'
import { getTodos, addTodo, updateTodo, deleteTodo, toggleTodoComplete } from '@/lib/todo-storage'
import { format } from 'date-fns'

interface FinancialTodoListProps {
  userId: string
}

export function FinancialTodoList({ userId }: FinancialTodoListProps) {
  const [todos, setTodos] = useState<FinancialTodo[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<FinancialTodo | null>(null)

  const refreshTodos = () => {
    setTodos(getTodos(userId))
  }

  useEffect(() => {
    refreshTodos()
  }, [userId])

  const handleAddTodo = (data: Omit<FinancialTodo, 'id' | 'createdAt'>) => {
    const todoData = { ...data, userId }
    addTodo(todoData)
    refreshTodos()
    setEditingTodo(null)
  }

  const handleUpdateTodo = (id: string, updates: Partial<FinancialTodo>) => {
    updateTodo(id, updates)
    refreshTodos()
    setEditingTodo(null)
  }

  const handleDeleteTodo = (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTodo(id)
      refreshTodos()
    }
  }

  const handleToggleTodo = (id: string) => {
    toggleTodoComplete(id)
    refreshTodos()
  }

  const handleEditTodo = (todo: FinancialTodo) => {
    setEditingTodo(todo)
    setFormOpen(true)
  }

  const handleFormSubmit = (data: Omit<FinancialTodo, 'id' | 'createdAt'>) => {
    if (editingTodo) {
      handleUpdateTodo(editingTodo.id, data)
    } else {
      handleAddTodo(data)
    }
    setFormOpen(false)
  }

  const completedCount = todos.filter((t) => t.completed).length
  const totalCount = todos.length

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'medium':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
      case 'low':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      default:
        return ''
    }
  }

  const isOverdue = (dueDate: string | undefined) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date() && new Date().setHours(0, 0, 0, 0) > new Date(dueDate).setHours(0, 0, 0, 0)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex-1">
            <CardTitle>Financial To-Do List</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {completedCount} of {totalCount} tasks completed
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingTodo(null)
              setFormOpen(true)
            }}
            className="bg-green-600 hover:bg-green-700 gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Task</span>
          </Button>
        </CardHeader>

        <CardContent className="space-y-3">
          {totalCount === 0 ? (
            <div className="py-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                No tasks yet. Add one to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                    todo.completed
                      ? 'bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700'
                  }`}
                >
                  <button
                    onClick={() => handleToggleTodo(todo.id)}
                    className="flex-shrink-0 mt-1 hover:opacity-70 transition-opacity"
                    aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {todo.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p
                          className={`font-medium ${
                            todo.completed
                              ? 'line-through text-gray-500 dark:text-gray-400'
                              : 'text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          {todo.title}
                        </p>
                        {todo.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {todo.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border capitalize ${getPriorityColor(
                          todo.priority
                        )}`}
                      >
                        {todo.priority}
                      </span>

                      {todo.amount && (
                        <span className="text-xs font-semibold text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded border border-green-200 dark:border-green-800">
                          ₹{todo.amount.toLocaleString('en-IN')}
                        </span>
                      )}

                      {todo.dueDate && (
                        <span
                          className={`text-xs px-2 py-1 rounded border ${
                            isOverdue(todo.dueDate)
                              ? 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                              : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          {format(new Date(todo.dueDate), 'MMM dd, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTodo(todo)}
                      className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                      aria-label="Edit task"
                    >
                      <Edit2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30"
                      aria-label="Delete task"
                    >
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TodoForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        editTodo={editingTodo}
      />
    </div>
  )
}
