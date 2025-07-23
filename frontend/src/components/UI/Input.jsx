import React from 'react'

/**
 * Reusable Input component with consistent styling and validation
 * Supports text, email, password, textarea, and select types
 */
function Input({
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  label,
  error,
  required = false,
  disabled = false,
  options = [], // for select type
  rows = 4, // for textarea
  className = '',
  ...props
}) {
  const inputId = `input-${name}`
  
  const renderInput = () => {
    const baseClasses = `form-control ${error ? 'form-control-error' : ''} ${className}`.trim()

    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            rows={rows}
            className={baseClasses}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
        )
      
      case 'select':
        return (
          <select
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={baseClasses}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          >
            <option value="">Select an option</option>
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        )
      
      default:
        return (
          <input
            id={inputId}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={baseClasses}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
        )
    }
  }

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="form-required" aria-label="required">*</span>}
        </label>
      )}
      {renderInput()}
      {error && (
        <span id={`${inputId}-error`} className="form-error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

export default Input