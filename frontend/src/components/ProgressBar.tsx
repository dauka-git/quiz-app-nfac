// src/components/ProgressBar.tsx
import { LinearProgress } from '@mui/material';

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar = ({ current, total }: ProgressBarProps) => {
  const progress = (current / total) * 100;

  return (
    <div>
      <LinearProgress variant="determinate" value={progress} />
      <p>
        Question {current} of {total}
      </p>
    </div>
  );
};