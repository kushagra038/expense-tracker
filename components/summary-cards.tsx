"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react"
import type { Transaction } from "@/lib/types"

interface SummaryCardsProps {
  transactions: Transaction[]
}

export function SummaryCards({ transactions }: SummaryCardsProps) {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const cards = [
    {
      title: "Total Balance",
      value: formatCurrency(balance),
      icon: Wallet,
      trend: balance >= 0 ? "positive" : "negative",
      trendIcon: balance >= 0 ? ArrowUpRight : ArrowDownRight,
      className: "bg-primary text-primary-foreground",
      iconBg: "bg-primary-foreground/20",
    },
    {
      title: "Total Income",
      value: formatCurrency(totalIncome),
      icon: TrendingUp,
      trend: "positive" as const,
      trendIcon: ArrowUpRight,
      className: "bg-card text-card-foreground",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
    },
    {
      title: "Total Expenses",
      value: formatCurrency(totalExpense),
      icon: TrendingDown,
      trend: "negative" as const,
      trendIcon: ArrowDownRight,
      className: "bg-card text-card-foreground",
      iconBg: "bg-red-500/10",
      iconColor: "text-red-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <Card
          key={card.title}
          className={`${card.className} border-border/50 transition-all duration-200 hover:shadow-md`}
        >
          <CardContent className="flex items-center gap-4 p-6">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}>
              <card.icon className={`h-6 w-6 ${card.iconColor || ""}`} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium opacity-80">{card.title}</p>
              <p className="text-2xl font-bold tracking-tight">{card.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
