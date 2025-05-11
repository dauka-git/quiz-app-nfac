// src/components/ResultDisplay.tsx
interface ResultDisplayProps {
    score: number;
    total: number;
  }
  
  export const ResultDisplay = ({ score, total }: ResultDisplayProps) => {
    return (
      <div>
        <h2>Your Result</h2>
        <p>
          You scored {score} out of {total} ({((score / total) * 100).toFixed(2)}%)
        </p>
      </div>
    );
  };