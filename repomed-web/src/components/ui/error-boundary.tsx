'use client';
import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Ops! Algo deu errado</h2>
          <p className="text-gray-600 mb-4 text-center max-w-md">
            {this.state.error?.message || 'Ocorreu um erro inesperado. Por favor, tente novamente.'}
          </p>
          <Button onClick={this.handleReset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Recarregar página
          </Button>
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <details className="mt-4 p-4 bg-gray-100 rounded-lg max-w-2xl overflow-auto">
              <summary className="cursor-pointer font-medium">Detalhes do erro (dev)</summary>
              <pre className="mt-2 text-xs">{this.state.errorInfo.componentStack}</pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}