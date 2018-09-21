import * as React from 'react';

import './index.module.css';

export default function Progress({ total, value }: ProgressProps) {
  const percent = Math.floor(value / total * 100);
  return (
    <div className="Progress">
      <div className="Progress-bar" style={{ width: `${percent}%` }} />
    </div>
  );
}

export interface ProgressProps {
  total: number;
  value: number;
}
