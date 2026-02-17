"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CATEGORIES, type Transaction, type Category, type CategoryBudget } from "@/lib/types"
import { format } from "date-fns"
import { AlertTriangle } from "lucide-react"

interface TransactionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Omit<Transaction, "id" | "userId">) => void
  editTransaction?: Transaction | null
  budgets?: CategoryBudget[]
  userId?: string
}

export function TransactionForm({ 
  open, 
  onOpenChange, 
  onSubmit, 
  editTransaction,
  budgets = [],
  userId = "",
}: TransactionFormProps) {
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [type, setType] = useState<"income" | "expense">("expense")
  const [category, setCategory] = useState<Category>("Other")
  const [error, setError] = useState("")
  const [budgetWarning, setBudgetWarning] = useState<{ message: string; wouldExceed: boolean } | null>(null)

  useEffect(() => {
    if (editTransaction) {
      setTitle(editTransaction.title)
      setAmount(editTransaction.amount.toString())
      setDate(editTransaction.date)
      setType(editTransaction.type)
      setCategory(editTransaction.category)
    } else {
      setTitle("")
      setAmount("")
      setDate(format(new Date(), "yyyy-MM-dd"))
      setType("expense")
      setCategory("Other")
    }
    setError("")
    setBudgetWarning(null)
  }, [editTransaction, open])

  // Check budget warning when amount or category changes
  useEffect(() => {
    if (type !== "expense" || !amount || !category) {
      setBudgetWarning(null)
      return
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setBudgetWarning(null)
      return
    }

    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    const budget = budgets.find(
      (b) => b.category === category && b.month === currentMonth && b.year === currentYear
    )

    if (!budget) {
      setBudgetWarning(null)
      return
    }

    // Note: In a real app, you'd calculate current spending from transactions
    // For now, we just check if this single transaction would exceed the budget
    const wouldExceed = numAmount > budget.limit
    
    if (wouldExceed) {
      setBudgetWarning({
        message: `This transaction (₹${numAmount.toLocaleString('en-IN')}) exceeds your ${category} budget limit of ₹${budget.limit.toLocaleString('en-IN')}`,
        wouldExceed: true,
      })
    } else {
      setBudgetWarning(null)
    }
  }, [amount, category, type, budgets])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title.trim()) {
      setError("Please enter a title")
      return
    }
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid positive amount")
      return
    }
    if (!date) {
      setError("Please select a date")
      return
    }

    onSubmit({
      title: title.trim(),
      amount: numAmount,
      date,
      type,
      category,
    })

    setTitle("")
    setAmount("")
    setDate(format(new Date(), "yyyy-MM-dd"))
    setType("expense")
    setCategory("Other")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editTransaction ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
          <DialogDescription>
            {editTransaction ? "Update the transaction details below." : "Fill in the details to add a new transaction."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {budgetWarning && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 flex gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Budget Warning</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">{budgetWarning.message}</p>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g. Grocery shopping"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="amount">Amount (INR)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as "income" | "expense")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editTransaction ? "Update" : "Add Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
