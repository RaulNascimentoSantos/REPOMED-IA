import React from 'react'
import { RefreshCw } from 'lucide-react'

// ⚡ Componente de Loading Otimizado com TanStack Query

export const LoadingSpinner = ({ 
  size = 'medium', 
  message = 'Carregando...', 
  overlay = false 
}) => {
  const sizes = {
    small: 16,
    medium: 24,
    large: 32,
    xlarge: 48
  }

  const spinnerSize = sizes[size] || sizes.medium

  const spinnerStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: overlay ? '20px' : '0',
    fontSize: '14px',
    color: '#6b7280'
  }

  const overlayStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 255, 255, 0.8)',
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }

  const Spinner = () => (
    <div style={spinnerStyles}>
      <RefreshCw size={spinnerSize} className="animate-spin" color="#6366f1" />
      {message && <span>{message}</span>}
    </div>
  )

  if (overlay) {
    return (
      <div style={overlayStyles}>
        <Spinner />
      </div>
    )
  }

  return <Spinner />
}

export const InlineLoadingSpinner = ({ message = 'Carregando...', color = '#6366f1' }) => (
  <div style={{ 
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: '6px',
    fontSize: '14px',
    color: '#6b7280'
  }}>
    <RefreshCw size={14} className="animate-spin" color={color} />
    {message}
  </div>
)

export const SkeletonLoader = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '4px',
  className = ''
}) => (
  <div 
    className={`animate-pulse bg-gray-200 ${className}`}
    style={{
      width,
      height,
      borderRadius,
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'loading 1.5s infinite'
    }}
  />
)

export const CardSkeleton = ({ lines = 3 }) => (
  <div style={{ 
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px'
  }}>
    <SkeletonLoader height="24px" width="70%" style={{ marginBottom: '12px' }} />
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonLoader 
        key={i}
        height="16px" 
        width={i === lines - 1 ? '40%' : '90%'} 
        style={{ marginBottom: '8px' }}
      />
    ))}
  </div>
)

export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div>
    {/* Header */}
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: `repeat(${columns}, 1fr)`, 
      gap: '12px',
      marginBottom: '16px',
      padding: '12px 0',
      borderBottom: '1px solid #e5e7eb'
    }}>
      {Array.from({ length: columns }).map((_, i) => (
        <SkeletonLoader key={`header-${i}`} height="20px" width="80%" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div 
        key={`row-${rowIndex}`}
        style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${columns}, 1fr)`, 
          gap: '12px',
          marginBottom: '12px',
          padding: '8px 0'
        }}
      >
        {Array.from({ length: columns }).map((_, colIndex) => (
          <SkeletonLoader 
            key={`cell-${rowIndex}-${colIndex}`} 
            height="16px" 
            width={colIndex === 0 ? '90%' : '70%'} 
          />
        ))}
      </div>
    ))}
  </div>
)