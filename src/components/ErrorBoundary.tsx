import { Component, ReactNode } from "react";
import { Button } from "./ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // 다음 렌더링에서 폴백 UI가 보이도록 상태를 업데이트합니다.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 에러 리포팅 서비스에 에러를 기록할 수도 있습니다.
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center space-y-4">
            <h2 className="text-2xl font-bold text-destructive">앗! 문제가 발생했습니다.</h2>
            <p className="text-muted-foreground">
              예기치 못한 에러가 발생하여 화면을 표시할 수 없습니다.
            </p>
            <div className="bg-muted p-4 rounded-md text-left overflow-auto text-sm max-h-32">
              <code>{typeof this.state.error?.message === 'object' ? JSON.stringify(this.state.error?.message) : String(this.state.error?.message || this.state.error)}</code>
            </div>
            <Button 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              새로고침
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
