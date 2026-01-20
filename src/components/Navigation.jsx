import { LayoutGrid, ShoppingCart, PieChart, Settings } from 'lucide-react';
import { clsx } from 'clsx';

export default function Navigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'pantry', label: 'Dispensa', icon: LayoutGrid },
    { id: 'shopping', label: 'Spesa', icon: ShoppingCart },
    { id: 'stats', label: 'Stats', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-6 left-4 right-4 h-20 bg-white/70 dark:bg-pantry-bg-secondary/90 backdrop-blur-3xl rounded-[32px] shadow-2xl border border-white/50 dark:border-white/5 flex justify-between items-center px-2 z-40 transform transition-all duration-300 hover:scale-[1.01]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={clsx(
              "flex-1 flex flex-col items-center justify-center h-full rounded-2xl transition-all duration-300 relative",
              isActive ? "text-gray-900 dark:text-pantry-accent-blue" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-pantry-text-primary"
            )}
          >
            {/* Active Bubble Background */}
            {isActive && (
              <span className="absolute inset-x-2 inset-y-2 bg-white dark:bg-pantry-accent-blue/15 rounded-2xl shadow-md dark:shadow-none -z-10 animate-fade-in-up" />
            )}
            
            <Icon 
              size={26} 
              strokeWidth={isActive ? 2.5 : 2} 
              className={clsx("mb-0.5 transition-transform duration-300", isActive && "scale-110")} 
            />
            {/* <span className={clsx("text-[10px] font-bold tracking-wide transition-opacity", isActive ? "opacity-100" : "opacity-0")}>
              {tab.label}
            </span> */}
          </button>
        );
      })}
    </nav>
  );
}
