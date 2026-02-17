'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, Loader2, AlertCircle } from 'lucide-react'
import type { Transaction } from '@/lib/types'
import {
  generateWeeklyReport,
  generateMonthlyReport,
  generateYearlyReport,
  generateCustomDateRangeReport,
  downloadReportPDF,
} from '@/lib/report-generator'
import { useNotification } from '@/lib/notification-context'

interface ReportsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transactions: Transaction[]
}

export function ReportsModal({
  open,
  onOpenChange,
  transactions,
}: ReportsModalProps) {
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const { addNotification } = useNotification()

  const today = new Date().toISOString().split('T')[0]

  const handleDownloadWeekly = async () => {
    try {
      setLoading(true)
      const report = generateWeeklyReport(transactions)
      await downloadReportPDF(report, 'Weekly')
      addNotification({
        type: 'success',
        title: 'Report Downloaded',
        message: 'Weekly report downloaded successfully',
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Download Failed',
        message: 'Failed to download weekly report',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadMonthly = async () => {
    try {
      setLoading(true)
      const report = generateMonthlyReport(transactions)
      await downloadReportPDF(report, 'Monthly')
      addNotification({
        type: 'success',
        title: 'Report Downloaded',
        message: 'Monthly report downloaded successfully',
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Download Failed',
        message: 'Failed to download monthly report',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadYearly = async () => {
    try {
      setLoading(true)
      const report = generateYearlyReport(transactions)
      await downloadReportPDF(report, 'Yearly')
      addNotification({
        type: 'success',
        title: 'Report Downloaded',
        message: 'Yearly report downloaded successfully',
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Download Failed',
        message: 'Failed to download yearly report',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadCustom = async () => {
    if (!startDate || !endDate) {
      addNotification({
        type: 'error',
        title: 'Invalid Dates',
        message: 'Please select both start and end dates',
      })
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start > end) {
      addNotification({
        type: 'error',
        title: 'Invalid Date Range',
        message: 'Start date must be before end date',
      })
      return
    }

    try {
      setLoading(true)
      const report = generateCustomDateRangeReport(transactions, start, end)
      if (report.transactions.length === 0) {
        addNotification({
          type: 'warning',
          title: 'No Data',
          message: 'No transactions found in the selected date range',
        })
        return
      }
      await downloadReportPDF(report, 'Custom')
      addNotification({
        type: 'success',
        title: 'Report Downloaded',
        message: 'Custom date range report downloaded successfully',
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Download Failed',
        message: 'Failed to download custom date range report',
      })
    } finally {
      setLoading(false)
    }
  }

  const weeklyReport = generateWeeklyReport(transactions)
  const monthlyReport = generateMonthlyReport(transactions)
  const yearlyReport = generateYearlyReport(transactions)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Download Reports</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-4">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Income</p>
                  <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                    {formatCurrency(weeklyReport.totalIncome)}
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Expense</p>
                  <p className="text-lg font-semibold text-red-700 dark:text-red-300">
                    {formatCurrency(weeklyReport.totalExpense)}
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Balance</p>
                  <p className={`text-lg font-semibold ${
                    weeklyReport.balance >= 0
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    {formatCurrency(weeklyReport.balance)}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <p className="text-sm font-semibold mb-2">Period</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {weeklyReport.period}
                </p>
              </div>
              <Button
                onClick={handleDownloadWeekly}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download Weekly Report PDF
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Income</p>
                  <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                    {formatCurrency(monthlyReport.totalIncome)}
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Expense</p>
                  <p className="text-lg font-semibold text-red-700 dark:text-red-300">
                    {formatCurrency(monthlyReport.totalExpense)}
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Balance</p>
                  <p className={`text-lg font-semibold ${
                    monthlyReport.balance >= 0
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    {formatCurrency(monthlyReport.balance)}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <p className="text-sm font-semibold mb-2">Period</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {monthlyReport.period}
                </p>
              </div>
              <Button
                onClick={handleDownloadMonthly}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download Monthly Report PDF
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="yearly" className="space-y-4">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Income</p>
                  <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                    {formatCurrency(yearlyReport.totalIncome)}
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Expense</p>
                  <p className="text-lg font-semibold text-red-700 dark:text-red-300">
                    {formatCurrency(yearlyReport.totalExpense)}
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Balance</p>
                  <p className={`text-lg font-semibold ${
                    yearlyReport.balance >= 0
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    {formatCurrency(yearlyReport.balance)}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <p className="text-sm font-semibold mb-2">Period</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {yearlyReport.period}
                </p>
              </div>
              <Button
                onClick={handleDownloadYearly}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download Yearly Report PDF
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Select a date range to generate a custom report for that specific period.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={endDate || today}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    max={today}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              {startDate && endDate && (
                <div className="space-y-3">
                  {(() => {
                    const customReport = generateCustomDateRangeReport(
                      transactions,
                      new Date(startDate),
                      new Date(endDate)
                    )
                    return (
                      <>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Income</p>
                            <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                              {formatCurrency(customReport.totalIncome)}
                            </p>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Expense</p>
                            <p className="text-lg font-semibold text-red-700 dark:text-red-300">
                              {formatCurrency(customReport.totalExpense)}
                            </p>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Balance</p>
                            <p className={`text-lg font-semibold ${
                              customReport.balance >= 0
                                ? 'text-green-700 dark:text-green-300'
                                : 'text-red-700 dark:text-red-300'
                            }`}>
                              {formatCurrency(customReport.balance)}
                            </p>
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                          <p className="text-sm font-semibold mb-2">Period</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {customReport.period}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Transactions: {customReport.transactions.length}
                          </p>
                        </div>
                      </>
                    )
                  })()}
                  <Button
                    onClick={handleDownloadCustom}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download Custom Report PDF
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}
