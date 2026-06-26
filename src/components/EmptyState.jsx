import React from 'react';
import { Zap, Shield, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const EmptyState = ({ onAddSubscription }) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-12">
      {/* Accord Logo */}
      <div className="mb-8 relative">
        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl p-4 border border-gray-100">
          <img
            src="https://i.ibb.co/CpXQDcjc/image.png"
            alt="Accord"
            className="w-full h-full object-contain"
            onError={(e) => {
              // Fallback на черный логотип если основной не загрузился
              e.target.src = 'https://i.ibb.co/PvzK2qmC/image.png';
            }}
          />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
          <Zap size={16} className="text-zinc-900" />
        </div>
      </div>

      {/* Heading */}
      <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
        {t('emptyState.title')}
      </h2>

      {/* Description */}
      <p className="text-gray-600 text-center mb-8 max-w-sm">
        {t('emptyState.description')}
      </p>

      {/* CTA Button */}
      <button
        onClick={onAddSubscription}
        className="px-8 py-4 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-2xl font-semibold hover:from-zinc-800 hover:to-zinc-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 mb-12"
      >
        {t('emptyState.addFirstSubscription')}
      </button>

      {/* Features */}
      <div className="grid grid-cols-1 gap-4 max-w-md w-full">
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">
              {t('emptyState.feature1Title')}
            </h3>
            <p className="text-xs text-gray-600">
              {t('emptyState.feature1Desc')}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield size={20} className="text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">
              {t('emptyState.feature2Title')}
            </h3>
            <p className="text-xs text-gray-600">
              {t('emptyState.feature2Desc')}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Star size={20} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">
              {t('emptyState.feature3Title')}
            </h3>
            <p className="text-xs text-gray-600">
              {t('emptyState.feature3Desc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
