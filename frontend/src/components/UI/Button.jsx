import React from 'react'

/**
 * Reusable Button component with consistent styling
 * Supports primary, secondary, and danger variants
 */
function Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  disabled = false,
  className = '',
  ...props 
}) {
  const baseClasses = 'btn'
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-delete',
    small: 'btn-small'
  }

  const classes = `${baseClasses} ${variantClasses[variant] || ''} ${className}`.trim()

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button