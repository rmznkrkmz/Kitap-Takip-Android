
import React from 'react';

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  onRate?: (rating: number) => void;
}

const RatingStars: React.FC<RatingStarsProps> = ({ rating, max = 5, size = 'md', onRate }) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-3xl', // Slightly larger for better touch interaction
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= rating;
        
        return (
          <button
            key={i}
            type="button"
            disabled={!onRate}
            onClick={() => onRate?.(starValue)}
            className={`${onRate ? 'cursor-pointer hover:scale-110 active:scale-90 transition-transform' : 'cursor-default'} focus:outline-none`}
            aria-label={`Rate ${starValue} out of ${max} stars`}
          >
            <span
              className={`material-symbols-outlined ${sizeClasses[size]} ${
                isFilled ? 'text-yellow-500 material-symbols-filled' : 'text-zinc-300 dark:text-zinc-600'
              }`}
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}
            >
              star
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default RatingStars;
