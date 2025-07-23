import React from 'react'

/**
 * Reusable Card component for content containers
 * Supports header, body, footer sections and different variants
 */
function Card({
  title,
  subtitle,
  children,
  footer,
  variant = 'default',
  hoverable = false,
  onClick,
  className = '',
  ...props
}) {
  const variantClasses = {
    default: 'card-default',
    bordered: 'card-bordered',
    elevated: 'card-elevated',
    compact: 'card-compact'
  }

  const cardClasses = `card ${variantClasses[variant]} ${hoverable ? 'card-hoverable' : ''} ${onClick ? 'card-clickable' : ''} ${className}`.trim()

  const handleClick = onClick ? () => onClick() : undefined
  const interactiveProps = onClick ? {
    onClick: handleClick,
    role: 'button',
    tabIndex: 0,
    onKeyPress: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleClick()
      }
    }
  } : {}

  return (
    <div 
      className={cardClasses}
      {...interactiveProps}
      {...props}
    >
      {(title || subtitle) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  )
}

export default Card