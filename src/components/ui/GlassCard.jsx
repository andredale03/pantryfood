import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function GlassCard({ children, className, intensity = 'medium', onClick }) {
  // Stile Flat / Monochrome
  const baseStyles = clsx(
    "rounded-[24px] transition-all duration-300 relative overflow-hidden",
    "border border-gray-200 dark:border-white/10", // Bordo sottile e pulito
    "shadow-none" // NESSUNA OMBRA
  );
  
  const intensities = {
    low: "bg-white dark:bg-pantry-bg-secondary",
    medium: "bg-white dark:bg-pantry-bg-secondary", 
    high: "bg-white dark:bg-pantry-bg-secondary",
  };

  return (
    <div 
      onClick={onClick}
      className={twMerge(
        baseStyles, 
        intensities[intensity], 
        onClick && "cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 active:scale-[0.99]", 
        className
      )}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}
