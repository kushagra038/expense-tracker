import type { Transaction } from './types'

export interface ReportData {
  title: string
  period: string
  totalIncome: number
  totalExpense: number
  balance: number
  transactions: Transaction[]
  categoryBreakdown: Record<string, number>
  dailyBreakdown?: Record<string, { income: number; expense: number }>
  weeklyBreakdown?: Record<string, { income: number; expense: number }>
}

function getDateRange(type: 'weekly' | 'monthly' | 'yearly', date: Date = new Date()) {
  const start = new Date(date)
  const end = new Date(date)

  if (type === 'weekly') {
    const day = start.getDay()
    const diff = start.getDate() - day
    start.setDate(diff)
    start.setHours(0, 0, 0, 0)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)
  } else if (type === 'monthly') {
    start.setDate(1)
    start.setHours(0, 0, 0, 0)
    end.setMonth(end.getMonth() + 1)
    end.setDate(0)
    end.setHours(23, 59, 59, 999)
  } else {
    start.setMonth(0)
    start.setDate(1)
    start.setHours(0, 0, 0, 0)
    end.setMonth(11)
    end.setDate(31)
    end.setHours(23, 59, 59, 999)
  }

  return { start, end }
}

export function generateWeeklyReport(transactions: Transaction[], date?: Date): ReportData {
  const { start, end } = getDateRange('weekly', date)

  const filtered = transactions.filter((t) => {
    const tDate = new Date(t.date)
    return tDate >= start && tDate <= end
  })

  const totalIncome = filtered
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = filtered
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const categoryBreakdown: Record<string, number> = {}
  filtered.forEach((t) => {
    if (t.type === 'expense') {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount
    }
  })

  const weeklyBreakdown: Record<string, { income: number; expense: number }> = {}
  filtered.forEach((t) => {
    const tDate = new Date(t.date)
    const dayName = tDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
    if (!weeklyBreakdown[dayName]) {
      weeklyBreakdown[dayName] = { income: 0, expense: 0 }
    }
    if (t.type === 'income') {
      weeklyBreakdown[dayName].income += t.amount
    } else {
      weeklyBreakdown[dayName].expense += t.amount
    }
  })

  return {
    title: 'Weekly Report',
    period: `${start.toLocaleDateString('en-IN')} - ${end.toLocaleDateString('en-IN')}`,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    transactions: filtered,
    categoryBreakdown,
    weeklyBreakdown,
  }
}

export function generateMonthlyReport(transactions: Transaction[], date?: Date): ReportData {
  const { start, end } = getDateRange('monthly', date)

  const filtered = transactions.filter((t) => {
    const tDate = new Date(t.date)
    return tDate >= start && tDate <= end
  })

  const totalIncome = filtered
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = filtered
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const categoryBreakdown: Record<string, number> = {}
  filtered.forEach((t) => {
    if (t.type === 'expense') {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount
    }
  })

  const dailyBreakdown: Record<string, { income: number; expense: number }> = {}
  filtered.forEach((t) => {
    const dayStr = new Date(t.date).toLocaleDateString('en-IN')
    if (!dailyBreakdown[dayStr]) {
      dailyBreakdown[dayStr] = { income: 0, expense: 0 }
    }
    if (t.type === 'income') {
      dailyBreakdown[dayStr].income += t.amount
    } else {
      dailyBreakdown[dayStr].expense += t.amount
    }
  })

  return {
    title: 'Monthly Report',
    period: `${start.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    transactions: filtered,
    categoryBreakdown,
    dailyBreakdown,
  }
}

export function generateYearlyReport(transactions: Transaction[], date?: Date): ReportData {
  const { start, end } = getDateRange('yearly', date)

  const filtered = transactions.filter((t) => {
    const tDate = new Date(t.date)
    return tDate >= start && tDate <= end
  })

  const totalIncome = filtered
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = filtered
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const categoryBreakdown: Record<string, number> = {}
  filtered.forEach((t) => {
    if (t.type === 'expense') {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount
    }
  })

  const dailyBreakdown: Record<string, { income: number; expense: number }> = {}
  filtered.forEach((t) => {
    const monthStr = new Date(t.date).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
    if (!dailyBreakdown[monthStr]) {
      dailyBreakdown[monthStr] = { income: 0, expense: 0 }
    }
    if (t.type === 'income') {
      dailyBreakdown[monthStr].income += t.amount
    } else {
      dailyBreakdown[monthStr].expense += t.amount
    }
  })

  return {
    title: 'Yearly Report',
    period: `${start.getFullYear()}`,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    transactions: filtered,
    categoryBreakdown,
    dailyBreakdown,
  }
}

export function generateCustomDateRangeReport(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): ReportData {
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)

  const filtered = transactions.filter((t) => {
    const tDate = new Date(t.date)
    return tDate >= start && tDate <= end
  })

  const totalIncome = filtered
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = filtered
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const categoryBreakdown: Record<string, number> = {}
  filtered.forEach((t) => {
    if (t.type === 'expense') {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount
    }
  })

  const dailyBreakdown: Record<string, { income: number; expense: number }> = {}
  filtered.forEach((t) => {
    const dayStr = new Date(t.date).toLocaleDateString('en-IN')
    if (!dailyBreakdown[dayStr]) {
      dailyBreakdown[dayStr] = { income: 0, expense: 0 }
    }
    if (t.type === 'income') {
      dailyBreakdown[dayStr].income += t.amount
    } else {
      dailyBreakdown[dayStr].expense += t.amount
    }
  })

  return {
    title: 'Custom Date Range Report',
    period: `${start.toLocaleDateString('en-IN')} - ${end.toLocaleDateString('en-IN')}`,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    transactions: filtered,
    categoryBreakdown,
    dailyBreakdown,
  }
}

export async function downloadReportPDF(reportData: ReportData, reportType: string): Promise<void> {
  const jsPDFModule = await import('jspdf')
  const jsPDF = jsPDFModule.default
  await import('jspdf-autotable')

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPosition = 15

  // Header
  doc.setFontSize(20)
  doc.setTextColor(39, 125, 76)
  doc.text('ExpenseTracker', 14, yPosition)
  yPosition += 8

  // Report Title and Period
  doc.setFontSize(14)
  doc.setTextColor(60, 60, 60)
  doc.text(reportData.title, 14, yPosition)
  yPosition += 6

  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Period: ${reportData.period}`, 14, yPosition)
  yPosition += 8

  // Summary Section
  doc.setFontSize(11)
  doc.setTextColor(39, 125, 76)
  doc.text('Summary', 14, yPosition)
  yPosition += 6

  const summaryBoxes = [
    {
      label: 'Total Income',
      value: formatCurrency(reportData.totalIncome),
      x: 14,
      color: [39, 125, 76],
    },
    {
      label: 'Total Expense',
      value: formatCurrency(reportData.totalExpense),
      x: 90,
      color: [220, 53, 69],
    },
    {
      label: 'Balance',
      value: formatCurrency(reportData.balance),
      x: 166,
      color: reportData.balance >= 0 ? [39, 125, 76] : [220, 53, 69],
    },
  ]

  summaryBoxes.forEach((box) => {
    doc.setDrawColor(200, 200, 200)
    doc.rect(box.x, yPosition - 4, 30, 16)

    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text(box.label, box.x + 2, yPosition)

    doc.setFontSize(10)
    doc.setTextColor(...box.color)
    doc.text(box.value, box.x + 2, yPosition + 8)
  })

  yPosition += 22

  // Category Breakdown
  if (Object.keys(reportData.categoryBreakdown).length > 0) {
    doc.setFontSize(11)
    doc.setTextColor(39, 125, 76)
    doc.text('Expense by Category', 14, yPosition)
    yPosition += 6

    const categoryData = Object.entries(reportData.categoryBreakdown).map(
      ([category, amount]) => [category, formatCurrency(amount)]
    )

    ;(doc as unknown as { autoTable: (options: Record<string, unknown>) => void }).autoTable({
      startY: yPosition,
      head: [['Category', 'Amount']],
      body: categoryData,
      theme: 'striped',
      headStyles: {
        fillColor: [39, 125, 76],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        1: { halign: 'right' },
      },
      styles: {
        fontSize: 9,
      },
    })

    const lastY = (doc as any).lastAutoTable.finalY
    yPosition = lastY + 8
  }

  // Add page break if needed
  if (yPosition > pageHeight - 40) {
    doc.addPage()
    yPosition = 15
  }

  // Transactions Table
  doc.setFontSize(11)
  doc.setTextColor(39, 125, 76)
  doc.text('Transactions', 14, yPosition)
  yPosition += 6

  const tableData = reportData.transactions.map((t) => [
    t.date,
    t.title,
    t.category,
    t.type.charAt(0).toUpperCase() + t.type.slice(1),
    formatCurrency(t.amount),
  ])

  ;(doc as unknown as { autoTable: (options: Record<string, unknown>) => void }).autoTable({
    startY: yPosition,
    head: [['Date', 'Title', 'Category', 'Type', 'Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [39, 125, 76],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      4: { halign: 'right' },
    },
    styles: {
      fontSize: 8,
    },
    didDrawPage: (data) => {
      const page = doc.internal.pages.length
      const text = `Page ${page}`
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(
        text,
        pageWidth - 20,
        pageHeight - 10,
        { align: 'right' }
      )
    },
  })

  const fileName = `${reportType.toLowerCase()}_report_${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(fileName)
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}
