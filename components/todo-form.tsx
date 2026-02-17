'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FinancialTodo } from '@/lib/types'
import { format } from 'date-fns'

interface TodoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Omit<FinancialTodo, 'id' | 'createdAt'>) => void
  editTodo?: FinancialTodo | null
}

export function TodoForm({ open, onOpenChange, onSubmit, editTodo }: TodoFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [error, setError] = useState('')

  useEffect(() => {
    if (editTodo) {
      setTitle(editTodo.title)
      setDescription(editTodo.description || '')
      setAmount(editTodo.amount ? editTodo.amount.toString() : '')
      setDueDate(editTodo.dueDate || '')
      setPriority(editTodo.priority)
    } else {
      setTitle('')
      setDescription('')
      setAmount('')
      setDueDate('')
      setPriority('medium')
    }
    setError('')
  }, [editTodo, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    const numAmount = amount ? parseFloat(amount) : undefined
    if (amount && (isNaN(numAmount!) || numAmount! <= 0)) {
      setError('Amount must be a positive number')
      return
    }

    onSubmit({
      userId: '',
      title: title.trim(),
      description: description.trim() || undefined,
      amount: numAmount,
      dueDate: dueDate || undefined,
      priority,
      completed: editTodo?.completed || false,
      linkedTransactionId: editTodo?.linkedTransactionId,
    })

    setTitle('')
    setDescription('')
    setAmount('')
    setDueDate('')
    setPriority('medium')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {editTodo ? 'Edit Financial Task' : 'Add Financial Task'}
          </DialogTitle>
          <DialogDescription>
            {editTodo
              ? 'Update your financial task details'
              : 'Create a new financial task or reminder'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Pay electricity bill, Save ₹5000"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <textarea
              id="description"
              placeholder="Add notes or details about this task"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="amount">Amount (Optional)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="₹0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="dueDate">Due Date (Optional)</Label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as 'low' | 'medium' | 'high')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
              {editTodo ? 'Update Task' : 'Add Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
