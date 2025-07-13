import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-sunny-yellow flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-xl border-4 border-deep-space shadow-[8px_8px_0_#2E294E] max-w-md w-full text-center">
            <h2 className="font-fredoka text-2xl text-deep-space mb-4">Oops! Something went wrong</h2>
            <p className="text-deep-space mb-6">
              We encountered an unexpected error. Please refresh the page to try again.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-hot-pink text-white font-bold rounded-lg border-2 border-deep-space hover:bg-opacity-80 transition"
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-deep-space opacity-70">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
