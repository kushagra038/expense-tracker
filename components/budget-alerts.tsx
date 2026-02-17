'use client'

import { useEffect, useRef } from 'react'
import type { Transaction, CategoryBudget } from '@/lib/types'
import { checkBudgetStatus } from '@/lib/transactions'
import { useNotification } from '@/lib/notification-context'

interface BudgetAlertsProps {
  userId: string
  transactions: Transaction[]
  budgets: CategoryBudget[]
}

export function BudgetAlerts({
  userId,
  transactions,
  budgets,
}: BudgetAlertsProps) {
  const { addNotification } = useNotification()
  const notifiedCategoriesRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const budgetStatuses = checkBudgetStatus(userId, transactions, budgets)
    const currentOverBudgetCategories = new Set<string>()

    budgetStatuses.forEach((status) => {
      if (status.isOverBudget) {
        currentOverBudgetCategories.add(status.category)
        
        // Only notify if this is a new over-budget situation
        if (!notifiedCategoriesRef.current.has(status.category)) {
          addNotification({
            type: 'error',
            title: `Over Budget: ${status.category}`,
            message: `You've exceeded your ${status.category} budget by ${formatCurrency(status.spent - status.limit)}`,
            duration: 0,
          })
          notifiedCategoriesRef.current.add(status.category)
        }
      } else if (status.isNearBudget) {
        // Only notify if approaching the limit and not already over
        if (!notifiedCategoriesRef.current.has(`near-${status.category}`)) {
          addNotification({
            type: 'warning',
            title: `Near Budget Limit: ${status.category}`,
            message: `You've used ${status.percentageUsed.toFixed(0)}% of your ${status.category} budget`,
          })
          notifiedCategoriesRef.current.add(`near-${status.category}`)
        }
      } else {
        // Clear notification flags if no longer over/near budget
        notifiedCategoriesRef.current.delete(status.category)
        notifiedCategoriesRef.current.delete(`near-${status.category}`)
      }
    })

    // Clear flags for categories no longer in budget list
    budgets.forEach((budget) => {
      const hasStatus = budgetStatuses.some((s) => s.category === budget.category)
      if (!hasStatus) {
        notifiedCategoriesRef.current.delete(budget.category)
        notifiedCategoriesRef.current.delete(`near-${budget.category}`)
      }
    })
  }, [userId, transactions, budgets, addNotification])

  return null
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}
