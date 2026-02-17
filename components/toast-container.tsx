'use client'

import { useNotification } from '@/lib/notification-context'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export function ToastContainer() {
  const { notifications, removeNotification } = useNotification()

  const getStyles = (type: string) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          text: 'text-green-800 dark:text-green-200',
        }
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          icon: <AlertCircle className="w-5 h-5 text-red-600" />,
          text: 'text-red-800 dark:text-red-200',
        }
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
          text: 'text-yellow-800 dark:text-yellow-200',
        }
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          icon: <Info className="w-5 h-5 text-blue-600" />,
          text: 'text-blue-800 dark:text-blue-200',
        }
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {notifications.map((notification) => {
        const styles = getStyles(notification.type)
        return (
          <div
            key={notification.id}
            className={`${styles.bg} ${styles.border} border rounded-lg p-4 shadow-lg flex gap-3 max-w-sm pointer-events-auto animate-in slide-in-from-top-2 fade-in duration-200`}
          >
            <div className="flex-shrink-0">{styles.icon}</div>
            <div className="flex-1">
              <h3 className={`font-semibold text-sm ${styles.text}`}>
                {notification.title}
              </h3>
              {notification.message && (
                <p className={`text-sm mt-1 ${styles.text} opacity-90`}>
                  {notification.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className={`flex-shrink-0 ${styles.text} opacity-50 hover:opacity-100`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
