"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import type { Transaction } from "@/lib/types"
import { CATEGORY_COLORS, type Category } from "@/lib/types"
import { format, subDays, startOfDay } from "date-fns"

interface ExpenseChartsProps {
  transactions: Transaction[]
}

export function ExpenseCharts({ transactions }: ExpenseChartsProps) {
  const expensesByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      },
      {} as Record<string, number>
    )

  const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
    color: CATEGORY_COLORS[name as Category] || "hsl(220, 10%, 50%)",
  }))

  const today = startOfDay(new Date())
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i)
    const dateStr = format(date, "yyyy-MM-dd")
    const dayLabel = format(date, "EEE")

    const dayIncome = transactions
      .filter((t) => t.type === "income" && t.date === dateStr)
      .reduce((sum, t) => sum + t.amount, 0)

    const dayExpense = transactions
      .filter((t) => t.type === "expense" && t.date === dateStr)
      .reduce((sum, t) => sum + t.amount, 0)

    return { name: dayLabel, Income: dayIncome, Expense: dayExpense }
  })

  const formatCurrency = (value: number) => {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
    return value.toString()
  }

  const CustomTooltipContent = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
        <p className="mb-1 text-sm font-medium text-card-foreground">{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(entry.value)}
          </p>
        ))}
      </div>
    )
  }

  const PieTooltipContent = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) => {
    if (!active || !payload?.length) return null
    const entry = payload[0]
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
        <p className="text-sm font-medium text-card-foreground">{entry.name}</p>
        <p className="text-sm" style={{ color: entry.payload.color }}>
          {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(entry.value)}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Income vs Expenses (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last7Days} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tickFormatter={formatCurrency} className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip content={<CustomTooltipContent />} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Line
                  type="monotone"
                  dataKey="Income"
                  stroke="hsl(152, 60%, 40%)"
                  strokeWidth={2.5}
                  dot={{ fill: "hsl(152, 60%, 40%)", r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Expense"
                  stroke="hsl(0, 72%, 51%)"
                  strokeWidth={2.5}
                  dot={{ fill: "hsl(0, 72%, 51%)", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Expense Distribution by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {pieData.length === 0 ? (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
              No expense data to display
            </div>
          ) : (
            <div className="flex h-[280px] items-center gap-4">
              <div className="h-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      dataKey="value"
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs text-muted-foreground">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
