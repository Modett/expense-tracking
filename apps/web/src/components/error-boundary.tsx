"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
          <Card className="bg-zinc-900 border-zinc-800 p-8 max-w-md w-full">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="p-4 bg-red-500/10 rounded-full">
                <AlertTriangle className="w-12 h-12 text-red-500" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white">
                  Something went wrong
                </h1>
                <p className="text-zinc-400">
                  An unexpected error occurred. Please try refreshing the page.
                </p>
              </div>

              {this.state.error && (
                <details className="w-full text-left">
                  <summary className="text-sm text-zinc-500 cursor-pointer hover:text-zinc-400">
                    Error details
                  </summary>
                  <pre className="mt-2 p-3 bg-zinc-800 rounded text-xs text-red-400 overflow-auto max-h-40">
                    {this.state.error.message}
                  </pre>
                </details>
              )}

              <Button
                onClick={this.handleReset}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
