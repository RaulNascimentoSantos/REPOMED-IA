import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingSpinner, InlineLoadingSpinner, SkeletonLoader, CardSkeleton } from '../../src/components/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('should render with default props', () => {
    render(<LoadingSpinner />)
    
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('should render with custom message', () => {
    render(<LoadingSpinner message="Processando documento..." />)
    
    expect(screen.getByText('Processando documento...')).toBeInTheDocument()
  })

  it('should render with overlay when enabled', () => {
    const { container } = render(<LoadingSpinner overlay={true} />)
    
    const overlay = container.querySelector('div[style*="position: fixed"]')
    expect(overlay).toBeInTheDocument()
  })

  it('should render different sizes correctly', () => {
    const { rerender } = render(<LoadingSpinner size="small" />)
    expect(screen.getByText('Carregando...')).toBeInTheDocument()

    rerender(<LoadingSpinner size="large" />)
    expect(screen.getByText('Carregando...')).toBeInTheDocument()

    rerender(<LoadingSpinner size="xlarge" />)
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('should not render message when message is empty', () => {
    render(<LoadingSpinner message="" />)
    
    expect(screen.queryByText('Carregando...')).not.toBeInTheDocument()
  })
})

describe('InlineLoadingSpinner', () => {
  it('should render with default message', () => {
    render(<InlineLoadingSpinner />)
    
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('should render with custom message and color', () => {
    render(<InlineLoadingSpinner message="Salvando..." color="#ff0000" />)
    
    expect(screen.getByText('Salvando...')).toBeInTheDocument()
  })

  it('should have inline-flex display style', () => {
    const { container } = render(<InlineLoadingSpinner />)
    
    const spinner = container.querySelector('div[style*="display: inline-flex"]')
    expect(spinner).toBeInTheDocument()
  })
})

describe('SkeletonLoader', () => {
  it('should render with default dimensions', () => {
    const { container } = render(<SkeletonLoader />)
    
    const skeleton = container.querySelector('div[style*="width: 100%"]')
    expect(skeleton).toBeInTheDocument()
  })

  it('should render with custom dimensions', () => {
    const { container } = render(
      <SkeletonLoader width="200px" height="50px" borderRadius="8px" />
    )
    
    const skeleton = container.querySelector('div[style*="width: 200px"]')
    expect(skeleton).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <SkeletonLoader className="custom-skeleton" />
    )
    
    const skeleton = container.querySelector('.custom-skeleton')
    expect(skeleton).toBeInTheDocument()
  })

  it('should have animate-pulse class', () => {
    const { container } = render(<SkeletonLoader />)
    
    const skeleton = container.querySelector('.animate-pulse')
    expect(skeleton).toBeInTheDocument()
  })
})

describe('CardSkeleton', () => {
  it('should render with default number of lines', () => {
    const { container } = render(<CardSkeleton />)
    
    // Default is 3 lines, plus title = 4 skeleton elements total
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons).toHaveLength(4)
  })

  it('should render with custom number of lines', () => {
    const { container } = render(<CardSkeleton lines={5} />)
    
    // 5 lines plus title = 6 skeleton elements total
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons).toHaveLength(6)
  })

  it('should have card styling', () => {
    const { container } = render(<CardSkeleton />)
    
    const card = container.querySelector('div[style*="background: white"]')
    expect(card).toBeInTheDocument()
  })

  it('should render title skeleton with correct width', () => {
    const { container } = render(<CardSkeleton />)
    
    const titleSkeleton = container.querySelector('div[style*="width: 70%"]')
    expect(titleSkeleton).toBeInTheDocument()
  })

  it('should render last line with smaller width', () => {
    const { container } = render(<CardSkeleton lines={3} />)
    
    const lastLineSkeleton = container.querySelector('div[style*="width: 40%"]')
    expect(lastLineSkeleton).toBeInTheDocument()
  })
})

describe('TableSkeleton', () => {
  it('should render with default rows and columns', () => {
    const { container } = render(<TableSkeleton />)
    
    // Default: 5 rows + 1 header = 6 rows total, 4 columns each
    // Total skeletons: (5 + 1) * 4 = 24
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons).toHaveLength(24)
  })

  it('should render with custom rows and columns', () => {
    const { container } = render(<TableSkeleton rows={3} columns={2} />)
    
    // 3 rows + 1 header = 4 rows total, 2 columns each
    // Total skeletons: 4 * 2 = 8
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons).toHaveLength(8)
  })

  it('should have header with border bottom', () => {
    const { container } = render(<TableSkeleton />)
    
    const header = container.querySelector('div[style*="border-bottom: 1px solid"]')
    expect(header).toBeInTheDocument()
  })

  it('should use grid layout for header and rows', () => {
    const { container } = render(<TableSkeleton columns={3} />)
    
    const gridElements = container.querySelectorAll('div[style*="display: grid"]')
    expect(gridElements.length).toBeGreaterThan(0)
    
    // Check grid template columns
    const headerGrid = container.querySelector('div[style*="grid-template-columns: repeat(3, 1fr)"]')
    expect(headerGrid).toBeInTheDocument()
  })
})