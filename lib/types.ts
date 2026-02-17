export interface User {
  id: string
  name: string
  email: string
  password: string
}

export interface Transaction {
  id: string
  title: string
  amount: number
  date: string
  type: "income" | "expense"
  category: Category
  userId: string
}

export type Category =
  | "Food"
  | "Travel"
  | "Bills"
  | "Shopping"
  | "Health"
  | "Entertainment"
  | "Work"
  | "Other"

export const CATEGORIES: Category[] = [
  "Food",
  "Travel",
  "Bills",
  "Shopping",
  "Health",
  "Entertainment",
  "Work",
  "Other",
]

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: "hsl(38, 92%, 50%)",
  Travel: "hsl(199, 89%, 48%)",
  Bills: "hsl(0, 72%, 51%)",
  Shopping: "hsl(262, 52%, 47%)",
  Health: "hsl(152, 60%, 40%)",
  Entertainment: "hsl(328, 80%, 50%)",
  Work: "hsl(220, 70%, 50%)",
  Other: "hsl(220, 10%, 50%)",
}

export interface CategoryBudget {
  category: Category
  limit: number
  userId: string
  month: number
  year: number
}

export interface FinancialTodo {
  id: string
  userId: string
  title: string
  description?: string
  amount?: number
  dueDate?: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
  linkedTransactionId?: string
  createdAt: string
}

export const CATEGORY_ICONS: Record<Category, string> = {
  Food: "UtensilsCrossed",
  Travel: "Plane",
  Bills: "Receipt",
  Shopping: "ShoppingBag",
  Health: "Heart",
  Entertainment: "Gamepad2",
  Work: "Briefcase",
  Other: "MoreHorizontal",
}
