import React from 'react';

interface SecurityScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const SecurityScore: React.FC<SecurityScoreProps> = ({ 
  score, 
  size = 'md',
  showLabel = true
}) => {
  // Determine the color based on the score
  const getColor = (score: number) => {
    if (score >= 90) return '#22c55e'; // Green
    if (score >= 70) return '#84cc16'; // Light green
    if (score >= 50) return '#eab308'; // Yellow
    if (score >= 30) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  // Determine the risk level based on the score
  const getRiskLevel = (score: number) => {
    if (score >= 90) return 'Very Safe';
    if (score >= 70) return 'Safe';
    if (score >= 50) return 'Moderate Risk';
    if (score >= 30) return 'High Risk';
    return 'Critical Risk';
  };

  // Calculate the size of the circle
  const getSize = () => {
    switch (size) {
      case 'sm': return 60;
      case 'lg': return 120;
      default: return 80;
    }
  };

  const circleSize = getSize();
  const fontSize = size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-3xl' : 'text-2xl';
  const labelSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs';

  // Calculate the circumference and offset for the progress circle
  const radius = (circleSize / 2) - 5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: circleSize, height: circleSize }}>
        {/* Background circle */}
        <svg width={circleSize} height={circleSize} viewBox={`0 0 ${circleSize} ${circleSize}`}>
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="5"
          />
          {/* Progress circle */}
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            fill="none"
            stroke={getColor(score)}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${circleSize / 2} ${circleSize / 2})`}
          />
        </svg>
        {/* Score text */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center ${fontSize} font-bold`}
          style={{ color: getColor(score) }}
        >
          {score}
        </div>
      </div>
      
      {/* Label below */}
      {showLabel && (
        <div className={`mt-2 ${labelSize} font-medium text-gray-500`}>
          {getRiskLevel(score)}
        </div>
      )}
    </div>
  );
};

export default SecurityScore;