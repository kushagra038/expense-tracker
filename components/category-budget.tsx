"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Target,
  Plus,
  AlertTriangle,
  CheckCircle,
  Trash2,
} from "lucide-react"
import type { Transaction, Category, CategoryBudget as CategoryBudgetType } from "@/lib/types"
import { CATEGORIES, CATEGORY_COLORS } from "@/lib/types"
import { getBudgets, setBudget, removeBudget } from "@/lib/transactions"

interface CategoryBudgetProps {
  transactions: Transaction[]
  userId: string
  selectedMonth: number
  selectedYear: number
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function CategoryBudget({
  transactions,
  userId,
  selectedMonth,
  selectedYear,
}: CategoryBudgetProps) {
  const [budgets, setBudgets] = useState<CategoryBudgetType[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category>("Food")
  const [limitAmount, setLimitAmount] = useState("")
  const [formError, setFormError] = useState("")

  const loadBudgets = useCallback(() => {
    setBudgets(getBudgets(userId, selectedMonth, selectedYear))
  }, [userId, selectedMonth, selectedYear])

  useEffect(() => {
    loadBudgets()
  }, [loadBudgets])

  const monthlyExpenses = useMemo(() => {
    return transactions
      .filter((t) => {
        const d = new Date(t.date)
        return (
          t.type === "expense" &&
          d.getMonth() === selectedMonth &&
          d.getFullYear() === selectedYear
        )
      })
      .reduce(
        (acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount
          return acc
        },
        {} as Record<string, number>
      )
  }, [transactions, selectedMonth, selectedYear])

  const handleSaveBudget = () => {
    setFormError("")
    const num = parseFloat(limitAmount)
    if (isNaN(num) || num <= 0) {
      setFormError("Please enter a valid positive amount")
      return
    }
    setBudget({
      category: selectedCategory,
      limit: num,
      userId,
      month: selectedMonth,
      year: selectedYear,
    })
    loadBudgets()
    setDialogOpen(false)
    setLimitAmount("")
  }

  const handleRemoveBudget = (category: string) => {
    removeBudget(userId, category, selectedMonth, selectedYear)
    loadBudgets()
  }

  const categoriesWithoutBudget = CATEGORIES.filter(
    (c) => !budgets.find((b) => b.category === c)
  )

  const fmt = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)

  return (
    <>
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-semibold">
                Budget Tracker -{" "}
                <span className="text-primary">
                  {MONTHS[selectedMonth]} {selectedYear}
                </span>
              </CardTitle>
            </div>
            {categoriesWithoutBudget.length > 0 && (
              <Button
                size="sm"
                onClick={() => {
                  setSelectedCategory(categoriesWithoutBudget[0])
                  setLimitAmount("")
                  setFormError("")
                  setDialogOpen(true)
                }}
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Set Budget</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {budgets.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <Target className="h-10 w-10 opacity-40" />
              <p className="text-sm">No budgets set for this month</p>
              {categoriesWithoutBudget.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedCategory(categoriesWithoutBudget[0])
                    setLimitAmount("")
                    setFormError("")
                    setDialogOpen(true)
                  }}
                  className="mt-1 gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  Set your first budget
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {budgets.map((budget) => {
                const spent = monthlyExpenses[budget.category] || 0
                const percentage = Math.min(
                  Math.round((spent / budget.limit) * 100),
                  100
                )
                const isOverBudget = spent > budget.limit
                const isNearBudget = percentage >= 80 && !isOverBudget

                return (
                  <div
                    key={budget.category}
                    className={`rounded-xl border p-4 transition-colors ${
                      isOverBudget
                        ? "border-red-500/30 bg-red-500/5"
                        : isNearBudget
                          ? "border-yellow-500/30 bg-yellow-500/5"
                          : "border-border/50 bg-card"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor:
                              CATEGORY_COLORS[budget.category],
                          }}
                        />
                        <span className="text-sm font-semibold text-foreground">
                          {budget.category}
                        </span>
                        {isOverBudget && (
                          <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-500">
                            <AlertTriangle className="h-3 w-3" />
                            Over budget
                          </span>
                        )}
                        {isNearBudget && (
                          <span className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-400">
                            <AlertTriangle className="h-3 w-3" />
                            Near limit
                          </span>
                        )}
                        {!isOverBudget && !isNearBudget && spent > 0 && (
                          <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500">
                            <CheckCircle className="h-3 w-3" />
                            On track
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleRemoveBudget(budget.category)
                        }
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        aria-label={`Remove ${budget.category} budget`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="mb-2">
                      <Progress
                        value={percentage}
                        className={`h-2.5 ${
                          isOverBudget
                            ? "[&>div]:bg-red-500"
                            : isNearBudget
                              ? "[&>div]:bg-yellow-500"
                              : "[&>div]:bg-emerald-500"
                        }`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Spent:{" "}
                        <span className="font-semibold text-foreground">
                          {fmt(spent)}
                        </span>
                      </span>
                      <span className="text-muted-foreground">
                        Limit:{" "}
                        <span className="font-semibold text-foreground">
                          {fmt(budget.limit)}
                        </span>
                      </span>
                      <span
                        className={`font-bold ${
                          isOverBudget
                            ? "text-red-500"
                            : isNearBudget
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-emerald-500"
                        }`}
                      >
                        {percentage}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Set Category Budget</DialogTitle>
            <DialogDescription>
              Set a spending limit for {MONTHS[selectedMonth]}{" "}
              {selectedYear}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {formError && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {formError}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label>Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={(v) => setSelectedCategory(v as Category)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoriesWithoutBudget.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Budget Limit (INR)</Label>
              <Input
                type="number"
                min="0"
                step="100"
                placeholder="e.g. 5000"
                value={limitAmount}
                onChange={(e) => setLimitAmount(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveBudget}>Save Budget</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
