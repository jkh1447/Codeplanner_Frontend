"use client";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div style={{ padding: 20 }}>
      <h1>😵‍💫 오류발생</h1>
      <p>{error.message}</p>

      {/* 스택 트레이스 보기 */}
      <details style={{ whiteSpace: "pre-wrap", background: "#f0f0f0", padding: 10 }}>
        <summary>스택 트레이스 보기</summary>
        {error.stack}
      </details>

      <button onClick={() => reset()} style={{ marginTop: 20 }}>
        다시 시도
      </button>
    </div>
  );
}
