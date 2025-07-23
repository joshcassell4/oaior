import React, { useState, useEffect } from 'react'

/**
 * Reusable Alert component for displaying messages
 * Supports success, error, warning, and info variants
 * Can be dismissible and auto-hide after timeout
 */
function Alert({ 
  type = 'info', 
  message, 
  onDismiss, 
  dismissible = true,
  autoHide = false,
  autoHideDelay = 5000
}) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (autoHide && visible) {
      const timer = setTimeout(() => {
        setVisible(false)
        if (onDismiss) onDismiss()
      }, autoHideDelay)
      return () => clearTimeout(timer)
    }
  }, [autoHide, autoHideDelay, visible, onDismiss])

  if (!visible) return null

  const handleDismiss = () => {
    setVisible(false)
    if (onDismiss) onDismiss()
  }

  const alertIcons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }

  return (
    <div className={`alert alert-${type}`} role="alert">
      <span className="alert-icon" aria-hidden="true">
        {alertIcons[type]}
      </span>
      <span className="alert-message">{message}</span>
      {dismissible && (
        <button 
          className="alert-dismiss"
          onClick={handleDismiss}
          aria-label="Dismiss alert"
        >
          ×
        </button>
      )}
    </div>
  )
}

export default Alert