import type { Transaction, CategoryBudget } from "./types"

const STORAGE_KEY = "expense_tracker_transactions"
const BUDGET_STORAGE_KEY = "expense_tracker_budgets"

export function getTransactions(userId: string): Transaction[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    const all: Transaction[] = data ? JSON.parse(data) : []
    return all.filter((t) => t.userId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch {
    return []
  }
}

export function addTransaction(transaction: Transaction): void {
  const data = localStorage.getItem(STORAGE_KEY)
  const all: Transaction[] = data ? JSON.parse(data) : []
  all.push(transaction)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function updateTransaction(transaction: Transaction): void {
  const data = localStorage.getItem(STORAGE_KEY)
  const all: Transaction[] = data ? JSON.parse(data) : []
  const index = all.findIndex((t) => t.id === transaction.id)
  if (index !== -1) {
    all[index] = transaction
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  }
}

export function deleteTransaction(id: string): void {
  const data = localStorage.getItem(STORAGE_KEY)
  const all: Transaction[] = data ? JSON.parse(data) : []
  const filtered = all.filter((t) => t.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

export function exportToCSV(transactions: Transaction[]): void {
  const headers = ["Title", "Amount", "Date", "Type", "Category"]
  const rows = transactions.map((t) => [
    t.title,
    t.amount.toString(),
    t.date,
    t.type,
    t.category,
  ])
  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `expenses_${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function getBudgets(userId: string, month: number, year: number): CategoryBudget[] {
  try {
    const data = localStorage.getItem(BUDGET_STORAGE_KEY)
    const all: CategoryBudget[] = data ? JSON.parse(data) : []
    return all.filter(
      (b) => b.userId === userId && b.month === month && b.year === year
    )
  } catch {
    return []
  }
}

export function setBudget(budget: CategoryBudget): void {
  const data = localStorage.getItem(BUDGET_STORAGE_KEY)
  const all: CategoryBudget[] = data ? JSON.parse(data) : []
  const index = all.findIndex(
    (b) =>
      b.userId === budget.userId &&
      b.category === budget.category &&
      b.month === budget.month &&
      b.year === budget.year
  )
  if (index !== -1) {
    all[index] = budget
  } else {
    all.push(budget)
  }
  localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(all))
}

export function removeBudget(
  userId: string,
  category: string,
  month: number,
  year: number
): void {
  const data = localStorage.getItem(BUDGET_STORAGE_KEY)
  const all: CategoryBudget[] = data ? JSON.parse(data) : []
  const filtered = all.filter(
    (b) =>
      !(
        b.userId === userId &&
        b.category === category &&
        b.month === month &&
        b.year === year
      )
  )
  localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(filtered))
}

export async function exportToPDF(transactions: Transaction[]): Promise<void> {
  const jsPDFModule = await import("jspdf")
  const jsPDF = jsPDFModule.default
  await import("jspdf-autotable")

  const doc = new jsPDF()

  doc.setFontSize(20)
  doc.setTextColor(39, 125, 76)
  doc.text("ExpenseTracker", 14, 20)

  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Generated on ${new Date().toLocaleDateString("en-IN")}`, 14, 28)
  doc.text(`Total transactions: ${transactions.length}`, 14, 34)

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  doc.setFontSize(11)
  doc.setTextColor(39, 125, 76)
  doc.text(
    `Total Income: ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(totalIncome)}`,
    14,
    42
  )
  doc.setTextColor(200, 50, 50)
  doc.text(
    `Total Expense: ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(totalExpense)}`,
    14,
    48
  )
  doc.setTextColor(30, 30, 30)
  doc.text(
    `Balance: ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(totalIncome - totalExpense)}`,
    14,
    54
  )

  const tableData = transactions.map((t) => [
    t.date,
    t.title,
    t.category,
    t.type.charAt(0).toUpperCase() + t.type.slice(1),
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(t.amount),
  ])

  ;(doc as unknown as { autoTable: (options: Record<string, unknown>) => void }).autoTable({
    startY: 62,
    head: [["Date", "Title", "Category", "Type", "Amount"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [39, 125, 76],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  })

  doc.save(`expense_report_${new Date().toISOString().slice(0, 10)}.pdf`)
}

export interface BudgetStatus {
  category: string
  limit: number
  spent: number
  remaining: number
  percentageUsed: number
  isOverBudget: boolean
  isNearBudget: boolean
}

export function checkBudgetStatus(
  userId: string,
  transactions: Transaction[],
  budgets: CategoryBudget[]
): BudgetStatus[] {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const statusList: BudgetStatus[] = []

  budgets
    .filter((b) => b.userId === userId && b.month === currentMonth && b.year === currentYear)
    .forEach((budget) => {
      const spent = transactions
        .filter(
          (t) =>
            t.userId === userId &&
            t.type === 'expense' &&
            t.category === budget.category &&
            new Date(t.date).getMonth() + 1 === currentMonth &&
            new Date(t.date).getFullYear() === currentYear
        )
        .reduce((sum, t) => sum + t.amount, 0)

      const percentageUsed = (spent / budget.limit) * 100
      const remaining = Math.max(0, budget.limit - spent)

      statusList.push({
        category: budget.category,
        limit: budget.limit,
        spent,
        remaining,
        percentageUsed,
        isOverBudget: spent > budget.limit,
        isNearBudget: percentageUsed >= 80 && percentageUsed <= 100,
      })
    })

  return statusList
}
