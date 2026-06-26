import React from 'react';
import { Zap, CreditCard } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const MethodSelection = ({ onSelectMethod }) => {
  const { t } = useLanguage();

  return (
    <div className="p-6 min-h-[500px] flex flex-col justify-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        {t('addFlow.methodTitle')}
      </h2>
      <p className="text-gray-600 text-center mb-8 text-sm">
        {t('addFlow.methodSubtitle')}
      </p>
      
      <div className="grid grid-cols-1 gap-4">
        {/* Auto Sync Option */}
        <button
          onClick={() => onSelectMethod('auto')}
          className="group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border-2 border-gray-200 hover:border-zinc-900 bg-white"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Zap size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {t('addFlow.autoSync')}
              </h3>
              <p className="text-sm text-gray-500">
                {t('addFlow.autoSyncDesc')}
              </p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-zinc-100 to-transparent rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Manual Card Option */}
        <button
          onClick={() => onSelectMethod('manual')}
          className="group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border-2 border-gray-200 hover:border-zinc-900 bg-white"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <CreditCard size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {t('addFlow.manualCard')}
              </h3>
              <p className="text-sm text-gray-500">
                {t('addFlow.manualCardDesc')}
              </p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-zinc-100 to-transparent rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  );
};

export default MethodSelection;
