"use client"

import React from "react"

import { useState } from "react"
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
  Search,
  Download,
  FileText,
  Plus,
  Pencil,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUpDown,
  UtensilsCrossed,
  Plane,
  Receipt,
  ShoppingBag,
  Heart,
  Gamepad2,
  Briefcase,
  MoreHorizontal,
} from "lucide-react"
import type { Transaction, Category } from "@/lib/types"
import { CATEGORIES, CATEGORY_COLORS } from "@/lib/types"
import { exportToCSV, exportToPDF } from "@/lib/transactions"
import { format, parseISO } from "date-fns"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  UtensilsCrossed,
  Plane,
  Receipt,
  ShoppingBag,
  Heart,
  Gamepad2,
  Briefcase,
  MoreHorizontal,
}

const CATEGORY_ICON_MAP: Record<Category, string> = {
  Food: "UtensilsCrossed",
  Travel: "Plane",
  Bills: "Receipt",
  Shopping: "ShoppingBag",
  Health: "Heart",
  Entertainment: "Gamepad2",
  Work: "Briefcase",
  Other: "MoreHorizontal",
}

type SortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc"

interface TransactionTableProps {
  transactions: Transaction[]
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
  onAdd: () => void
}

export function TransactionTable({
  transactions,
  onEdit,
  onDelete,
  onAdd,
}: TransactionTableProps) {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<SortOption>("date-desc")
  const [isExportingPDF, setIsExportingPDF] = useState(false)

  const filtered = transactions
    .filter((t) => {
      const matchSearch = t.title
        .toLowerCase()
        .includes(search.toLowerCase())
      const matchCategory =
        categoryFilter === "all" || t.category === categoryFilter
      return matchSearch && matchCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "amount-desc":
          return b.amount - a.amount
        case "amount-asc":
          return a.amount - b.amount
        default:
          return 0
      }
    })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleExportPDF = async () => {
    setIsExportingPDF(true)
    try {
      await exportToPDF(filtered)
    } finally {
      setIsExportingPDF(false)
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base font-semibold">
            Transaction History
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={onAdd} size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add New</span>
            </Button>
            <Button
              onClick={() => exportToCSV(filtered)}
              size="sm"
              variant="outline"
              className="gap-1.5"
              disabled={filtered.length === 0}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">CSV</span>
            </Button>
            <Button
              onClick={handleExportPDF}
              size="sm"
              variant="outline"
              className="gap-1.5 bg-transparent"
              disabled={filtered.length === 0 || isExportingPDF}
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isExportingPDF ? "Exporting..." : "PDF"}
              </span>
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={sortBy}
              onValueChange={(v) => setSortBy(v as SortOption)}
            >
              <SelectTrigger className="w-full sm:w-[170px]">
                <div className="flex items-center gap-1.5">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">
                  Date (Latest)
                </SelectItem>
                <SelectItem value="date-asc">
                  Date (Oldest)
                </SelectItem>
                <SelectItem value="amount-desc">
                  Amount (High)
                </SelectItem>
                <SelectItem value="amount-asc">
                  Amount (Low)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-2 sm:px-6 sm:pb-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
            <Receipt className="h-10 w-10 opacity-40" />
            <p className="text-sm">No transactions found</p>
            <Button
              onClick={onAdd}
              variant="outline"
              size="sm"
              className="mt-2 gap-1.5 bg-transparent"
            >
              <Plus className="h-4 w-4" />
              Add your first transaction
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-hidden rounded-lg border border-border sm:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Date
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((t) => {
                    const IconComp =
                      ICON_MAP[CATEGORY_ICON_MAP[t.category]] ||
                      MoreHorizontal
                    return (
                      <tr
                        key={t.id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                              style={{
                                backgroundColor: `${CATEGORY_COLORS[t.category]}15`,
                                color:
                                  CATEGORY_COLORS[t.category],
                              }}
                            >
                              <IconComp className="h-4 w-4" />
                            </div>
                            <span className="font-medium">
                              {t.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                            style={{
                              backgroundColor: `${CATEGORY_COLORS[t.category]}15`,
                              color:
                                CATEGORY_COLORS[t.category],
                            }}
                          >
                            {t.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {format(
                            parseISO(t.date),
                            "MMM dd, yyyy"
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {t.type === "income" ? (
                              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-red-500" />
                            )}
                            <span
                              className={`font-semibold ${
                                t.type === "income"
                                  ? "text-emerald-500"
                                  : "text-red-500"
                              }`}
                            >
                              {t.type === "income"
                                ? "+"
                                : "-"}
                              {formatCurrency(t.amount)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(t)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                              aria-label={`Edit ${t.title}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                onDelete(t.id)
                              }
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                              aria-label={`Delete ${t.title}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="flex flex-col gap-2 sm:hidden">
              {filtered.map((t) => {
                const IconComp =
                  ICON_MAP[CATEGORY_ICON_MAP[t.category]] ||
                  MoreHorizontal
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/30"
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: `${CATEGORY_COLORS[t.category]}15`,
                        color: CATEGORY_COLORS[t.category],
                      }}
                    >
                      <IconComp className="h-5 w-5" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-sm font-medium">
                        {t.title}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{t.category}</span>
                        <span>{"/"}</span>
                        <span>
                          {format(parseISO(t.date), "MMM dd")}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-sm font-semibold ${
                          t.type === "income"
                            ? "text-emerald-500"
                            : "text-red-500"
                        }`}
                      >
                        {t.type === "income" ? "+" : "-"}
                        {formatCurrency(t.amount)}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(t)}
                          className="h-7 w-7 p-0 text-muted-foreground"
                          aria-label={`Edit ${t.title}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(t.id)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          aria-label={`Delete ${t.title}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
