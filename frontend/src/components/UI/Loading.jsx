import React from 'react'

/**
 * Reusable Loading component with spinner and optional message
 * Supports inline and overlay variants
 */
function Loading({ 
  message = 'Loading...', 
  size = 'medium',
  overlay = false,
  inline = false 
}) {
  const sizeClasses = {
    small: 'loading-small',
    medium: 'loading-medium',
    large: 'loading-large'
  }

  const loadingContent = (
    <div className={`loading ${sizeClasses[size]} ${inline ? 'loading-inline' : ''}`}>
      <div className="loading-spinner" aria-hidden="true">
        <div className="spinner-ring"></div>
      </div>
      {message && (
        <p className="loading-message">{message}</p>
      )}
    </div>
  )

  if (overlay) {
    return (
      <div className="loading-overlay">
        {loadingContent}
      </div>
    )
  }

  return loadingContent
}

export default Loading