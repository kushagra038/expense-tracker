"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TrendingUp, TrendingDown, Wallet, CalendarDays } from "lucide-react"
import type { Transaction } from "@/lib/types"

interface MonthlySummaryProps {
  transactions: Transaction[]
  selectedMonth: number
  selectedYear: number
  onMonthChange: (month: number) => void
  onYearChange: (year: number) => void
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

export function MonthlySummary({
  transactions,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}: MonthlySummaryProps) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 3 + i)

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const d = new Date(t.date)
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
    })
  }, [transactions, selectedMonth, selectedYear])

  const income = filtered
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0)

  const expense = filtered
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0)

  const balance = income - expense

  const fmt = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold">
              Monthly Summary
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={selectedMonth.toString()}
              onValueChange={(v) => onMonthChange(parseInt(v))}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => (
                  <SelectItem key={m} value={i.toString()}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedYear.toString()}
              onValueChange={(v) => onYearChange(parseInt(v))}
            >
              <SelectTrigger className="w-[90px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl bg-primary/5 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground">
                Income
              </span>
              <span className="text-lg font-bold text-emerald-500">
                {fmt(income)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-destructive/5 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground">
                Expenses
              </span>
              <span className="text-lg font-bold text-red-500">
                {fmt(expense)}
              </span>
            </div>
          </div>
          <div
            className={`flex items-center gap-3 rounded-xl p-4 ${
              balance >= 0 ? "bg-primary/5" : "bg-destructive/5"
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                balance >= 0 ? "bg-primary/10" : "bg-destructive/10"
              }`}
            >
              <Wallet
                className={`h-5 w-5 ${
                  balance >= 0 ? "text-primary" : "text-red-500"
                }`}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground">
                Balance
              </span>
              <span
                className={`text-lg font-bold ${
                  balance >= 0 ? "text-primary" : "text-red-500"
                }`}
              >
                {fmt(balance)}
              </span>
            </div>
          </div>
        </div>
        {filtered.length === 0 && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No transactions for {MONTHS[selectedMonth]} {selectedYear}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
