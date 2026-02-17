"use client"

import { useState, useCallback, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { AppHeader } from "@/components/app-header"
import { SummaryCards } from "@/components/summary-cards"
import { ExpenseCharts } from "@/components/expense-charts"
import { TransactionTable } from "@/components/transaction-table"
import { TransactionForm } from "@/components/transaction-form"
import { MonthlySummary } from "@/components/monthly-summary"
import { CategoryBudget } from "@/components/category-budget"
import { ReportsModal } from "@/components/reports-modal"
import { BudgetAlerts } from "@/components/budget-alerts"
import { FinancialTodoList } from "@/components/financial-todo-list"
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getBudgets,
} from "@/lib/transactions"
import type { Transaction } from "@/lib/types"

export function Dashboard() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [reportsOpen, setReportsOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null)

  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth())
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())

  const [budgets, setBudgets] = useState<typeof import("@/lib/types").CategoryBudget[]>([])

  const refreshTransactions = useCallback(() => {
    if (user) {
      setTransactions(getTransactions(user.id))
      setBudgets(getBudgets(user.id, selectedMonth + 1, selectedYear))
    }
  }, [user, selectedMonth, selectedYear])

  useEffect(() => {
    refreshTransactions()
  }, [refreshTransactions])

  const handleAdd = useCallback(
    (data: Omit<Transaction, "id" | "userId">) => {
      if (!user) return
      if (editingTransaction) {
        updateTransaction({
          ...data,
          id: editingTransaction.id,
          userId: user.id,
        })
      } else {
        addTransaction({
          ...data,
          id: crypto.randomUUID(),
          userId: user.id,
        })
      }
      setEditingTransaction(null)
      refreshTransactions()
    },
    [user, editingTransaction, refreshTransactions]
  )

  const handleEdit = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormOpen(true)
  }, [])

  const handleDelete = useCallback(
    (id: string) => {
      deleteTransaction(id)
      refreshTransactions()
    },
    [refreshTransactions]
  )

  const handleOpenForm = useCallback(() => {
    setEditingTransaction(null)
    setFormOpen(true)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <BudgetAlerts
        userId={user?.id || ""}
        transactions={transactions}
        budgets={budgets}
      />
      <AppHeader onReportsClick={() => setReportsOpen(true)} />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            Welcome back, {user?.name?.split(" ")[0]}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {"Here's an overview of your finances"}
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <SummaryCards transactions={transactions} />

          <MonthlySummary
            transactions={transactions}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
          />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <ExpenseCharts transactions={transactions} />
            </div>
            <div>
              <CategoryBudget
                transactions={transactions}
                userId={user?.id || ""}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
              />
            </div>
          </div>

          <FinancialTodoList userId={user?.id || ""} />

          <TransactionTable
            transactions={transactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={handleOpenForm}
          />
        </div>
      </main>

      <TransactionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleAdd}
        editTransaction={editingTransaction}
        budgets={budgets}
        userId={user?.id}
      />

      <ReportsModal
        open={reportsOpen}
        onOpenChange={setReportsOpen}
        transactions={transactions}
      />
    </div>
  )
}
