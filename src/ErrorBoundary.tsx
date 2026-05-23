import React from 'react';

export class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-6 text-red-500 overflow-auto w-full h-full bg-[#050505]">
          <h2 className="text-xl font-bold mb-2">Error Occurred</h2>
          <pre className="text-xs break-all whitespace-pre-wrap">{this.state.error?.message}</pre>
          <button className="mt-6 px-4 py-2 bg-white text-black rounded-full text-sm font-medium" onClick={() => window.location.reload()}>Reload App</button>
        </div>
      );
    }
    return this.props.children;
  }
}
