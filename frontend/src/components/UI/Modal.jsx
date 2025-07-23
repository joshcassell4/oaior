import React, { useEffect } from 'react'
import Button from './Button'

/**
 * Reusable Modal component for dialogs and forms
 * Handles backdrop clicks and ESC key press
 */
function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'medium',
  closeOnBackdrop = true,
  closeOnEsc = true
}) {
  useEffect(() => {
    if (isOpen && closeOnEsc) {
      const handleEsc = (event) => {
        if (event.key === 'Escape') {
          onClose()
        }
      }
      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, onClose, closeOnEsc])

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose()
    }
  }

  const sizeClasses = {
    small: 'modal-small',
    medium: 'modal-medium',
    large: 'modal-large'
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className={`modal ${sizeClasses[size]}`}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button 
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal