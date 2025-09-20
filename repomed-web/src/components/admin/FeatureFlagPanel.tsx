import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Toggle, Settings, RefreshCw, Info } from 'lucide-react';
import {
  getFeatureFlags,
  setFeatureFlag,
  resetFeatureFlags,
  FeatureFlagDescriptions,
  FeatureFlagCategories,
  type FeatureFlags
} from '@/lib/featureFlags';

interface FeatureFlagPanelProps {
  className?: string;
}

export const FeatureFlagPanel: React.FC<FeatureFlagPanelProps> = ({ className }) => {
  const [flags, setFlags] = useState<FeatureFlags>(getFeatureFlags());
  const [showDescriptions, setShowDescriptions] = useState(false);

  useEffect(() => {
    const handleFlagsUpdate = () => {
      setFlags(getFeatureFlags());
    };

    window.addEventListener('feature-flags-updated', handleFlagsUpdate);
    return () => window.removeEventListener('feature-flags-updated', handleFlagsUpdate);
  }, []);

  const handleToggle = (flag: keyof FeatureFlags, enabled: boolean) => {
    setFeatureFlag(flag, enabled);
  };

  const handleReset = () => {
    if (confirm('Resetar todas as feature flags para os valores padrão?')) {
      resetFeatureFlags();
    }
  };

  const renderCategory = (categoryName: string, categoryFlags: (keyof FeatureFlags)[]) => (
    <div key={categoryName} className="space-y-2">
      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
        {categoryName}
      </h4>
      {categoryFlags.map(flag => (
        <div
          key={flag}
          className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <code className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                {flag}
              </code>
              {showDescriptions && (
                <button
                  title={FeatureFlagDescriptions[flag]}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <Info className="w-3 h-3" />
                </button>
              )}
            </div>
            {showDescriptions && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {FeatureFlagDescriptions[flag]}
              </p>
            )}
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={flags[flag]}
              onChange={(e) => handleToggle(flag, e.target.checked)}
              className="sr-only peer"
            />
            <div className={cn(
              'w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4',
              'peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer',
              'dark:bg-slate-600 peer-checked:after:translate-x-full',
              'peer-checked:after:border-white after:content-[\'\'] after:absolute',
              'after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300',
              'after:border after:rounded-full after:h-5 after:w-5 after:transition-all',
              'dark:border-slate-600 peer-checked:bg-blue-600'
            )} />
          </label>
        </div>
      ))}
    </div>
  );

  return (
    <div className={cn(
      'bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700',
      'p-4 space-y-4',
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Feature Flags
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDescriptions(!showDescriptions)}
            className={cn(
              'p-2 rounded-lg text-slate-600 dark:text-slate-400',
              'hover:bg-slate-100 dark:hover:bg-slate-700',
              'transition-colors duration-200'
            )}
            title="Toggle descriptions"
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className={cn(
              'p-2 rounded-lg text-slate-600 dark:text-slate-400',
              'hover:bg-slate-100 dark:hover:bg-slate-700',
              'transition-colors duration-200'
            )}
            title="Reset all flags"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(FeatureFlagCategories).map(([categoryName, categoryFlags]) =>
          renderCategory(categoryName, categoryFlags)
        )}
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-600">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Feature flags controlam funcionalidades experimentais. Use com cuidado em produção.
        </p>
      </div>
    </div>
  );
};

export default FeatureFlagPanel;