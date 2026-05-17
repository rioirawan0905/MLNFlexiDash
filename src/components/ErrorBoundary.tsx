import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center">
          <h2 className="text-red-800 font-bold mb-2">Something went wrong</h2>
          <p className="text-red-600 text-xs font-mono">This widget encountered an error. Try refreshing or deleting it.</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-3 py-1 bg-red-100 text-red-700 rounded-lg text-[10px] font-bold uppercase"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
