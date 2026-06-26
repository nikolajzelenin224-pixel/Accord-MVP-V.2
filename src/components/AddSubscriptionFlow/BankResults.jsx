import React, { useState } from 'react';
import { ChevronLeft, Check, Sparkles } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { LOGO_LIBRARY } from '../../constants/logos';

const BankResults = ({ subscriptions, onConfirm, onBack }) => {
  const { t, formatCurrency } = useLanguage();
  const [selectedIds, setSelectedIds] = useState(
    subscriptions.map(sub => sub.id)
  );

  const toggleSubscription = (id) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(subId => subId !== id)
        : [...prev, id]
    );
  };

  const handleConfirm = () => {
    const selected = subscriptions.filter(sub => selectedIds.includes(sub.id));
    onConfirm(selected);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={20} className="text-yellow-500" />
            <h2 className="text-xl font-bold text-gray-900">
              {t('addFlow.weFoundSubscriptions')}
            </h2>
          </div>
          <p className="text-sm text-gray-500">
            {t('addFlow.foundCount')}: {subscriptions.length}
          </p>
        </div>
      </div>

      {/* Subscription list with modern design */}
      <div className="space-y-2 mb-6 max-h-[420px] overflow-y-auto pr-1">
        {subscriptions.map((sub) => {
          const isSelected = selectedIds.includes(sub.id);
          
          return (
            <button
              key={sub.id}
              onClick={() => toggleSubscription(sub.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 ${
                isSelected
                  ? 'bg-blue-50 border-2 border-blue-500 shadow-md'
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
              }`}
            >
              {/* Logo with soft container */}
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center p-2 transition-all ${
                isSelected
                  ? 'bg-white shadow-md border border-blue-200'
                  : 'bg-white shadow-sm border border-gray-100'
              }`}>
                <img
                  src={LOGO_LIBRARY[sub.logoId]}
                  alt={sub.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/48?text=Logo';
                  }}
                />
              </div>
              
              {/* Subscription info */}
              <div className="flex-1 text-left min-w-0">
                <div className={`font-semibold text-sm truncate ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                  {sub.name}
                </div>
                {sub.plan && (
                  <div className={`text-xs truncate ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                    {sub.plan}
                  </div>
                )}
                <div className={`text-sm font-medium mt-0.5 ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}>
                  {formatCurrency(sub.price)} / {t('subscriptions.perMonth')}
                </div>
              </div>
              
              {/* Modern checkbox */}
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-blue-500'
                    : 'border-2 border-gray-300'
                }`}
              >
                {isSelected && <Check size={16} className="text-white" strokeWidth={3} />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Action button */}
      <button
        onClick={handleConfirm}
        disabled={selectedIds.length === 0}
        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        {t('addFlow.addSelected')} ({selectedIds.length})
      </button>
    </div>
  );
};

export default BankResults;
