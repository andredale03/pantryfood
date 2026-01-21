import { LayoutGrid, ShoppingCart, PieChart, Settings, ChefHat, ChevronDown, Plus, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { useState } from 'react';

export default function Sidebar({ activeTab, onTabChange, locations, activeLocation, onSwitchLocation, onAddLocation }) {
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newLocName, setNewLocName] = useState('');

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if (!newLocName.trim()) return;

        await onAddLocation(newLocName);
        setNewLocName('');
        setIsAdding(false);
        setIsLocationOpen(false);
    };

    const tabs = [
        { id: 'pantry', label: 'Dispensa', icon: LayoutGrid },
        { id: 'shopping', label: 'Spesa', icon: ShoppingCart },
        { id: 'stats', label: 'Stats', icon: PieChart },
        { id: 'settings', label: 'Impostazioni', icon: Settings },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-white/50 dark:bg-black/20 backdrop-blur-xl border-r border-gray-100 dark:border-white/5 z-40 py-6 px-4">
            {/* Logo Area - Minimal */}
            <div className="flex items-center gap-3 mb-12 px-2 pl-4">
                <div className="text-gray-900 dark:text-white">
                    <ChefHat size={28} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-none">Pantry</h1>
                    {/* Location Switcher Trigger */}
                    <button
                        onClick={() => {
                            setIsLocationOpen(!isLocationOpen);
                            if (isLocationOpen) setIsAdding(false); // Reset add mode on close
                        }}
                        className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mt-1 transition-colors group/loc"
                    >
                        <span className="truncate max-w-[120px]">{activeLocation?.name || 'Seleziona...'}</span>
                        <ChevronDown size={12} className={`transition-transform duration-300 ${isLocationOpen ? 'rotate-180' : 'group-hover/loc:translate-y-0.5'}`} />
                    </button>
                </div>
            </div>

            {/* Location Dropdown - Embedded/Expandable */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isLocationOpen ? 'max-h-60 mb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-2 mx-2 border border-gray-100 dark:border-white/5 space-y-1">
                    {locations?.map(loc => (
                        <button
                            key={loc.id}
                            onClick={() => {
                                onSwitchLocation(loc);
                                setIsLocationOpen(false);
                            }}
                            className={clsx(
                                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                                activeLocation?.id === loc.id
                                    ? "bg-white dark:bg-black/20 text-gray-900 dark:text-white shadow-sm"
                                    : "text-gray-500 hover:bg-black/5 dark:hover:bg-white/10"
                            )}
                        >
                            <span className="truncate">{loc.name}</span>
                            {activeLocation?.id === loc.id && <Check size={12} className="text-green-500" />}
                        </button>
                    ))}
                    {/* Add New Button / Form */}
                    <div className="pt-2 mt-1 border-t border-gray-100 dark:border-white/5">
                        {!isAdding ? (
                            <button
                                onClick={() => setIsAdding(true)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                            >
                                <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                                    <Plus size={10} />
                                </div>
                                Nuova Dispensa
                            </button>
                        ) : (
                            <form onSubmit={handleAddSubmit} className="px-1 animate-fade-in-up">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Nome..."
                                    value={newLocName}
                                    onChange={(e) => setNewLocName(e.target.value)}
                                    className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 text-xs mb-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
                                />
                                <div className="flex gap-1">
                                    <button
                                        type="submit"
                                        disabled={!newLocName.trim()}
                                        className="flex-1 bg-blue-600 text-white text-[10px] font-bold py-1 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        Crea
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAdding(false)}
                                        className="flex-1 bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 text-[10px] font-bold py-1 rounded-md hover:bg-gray-300 dark:hover:bg-white/20"
                                    >
                                        Annulla
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 space-y-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={clsx(
                                "w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group relative",
                                isActive
                                    ? "text-gray-900 dark:text-white font-bold"
                                    : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"
                            )}
                        >
                            {/* Active Bubble Minimal */}
                            {isActive && (
                                <span className="absolute inset-0 bg-white shadow-sm dark:bg-white/10 rounded-2xl -z-10 animate-fade-in" />
                            )}

                            <Icon
                                size={20}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={clsx(
                                    "transition-transform duration-300",
                                    isActive && "scale-105"
                                )}
                            />
                            <span className="tracking-wide text-sm">
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </nav>

            {/* Footer - Minimal/Hidden */}
            <div className="mt-auto p-4 opacity-40 hover:opacity-100 transition-opacity">
                <p className="text-[10px] text-center text-gray-400">v2.0 Hybrid</p>
            </div>
        </aside>
    );
}
