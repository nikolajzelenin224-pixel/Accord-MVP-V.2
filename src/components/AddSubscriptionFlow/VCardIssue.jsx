import React, { useState } from 'react';
import { ChevronLeft, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const VCardIssue = ({ service, onConfirm, onBack }) => {
  const { t, formatCurrency } = useLanguage();
  const [showCVC, setShowCVC] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  // Generate mock card data
  const cardNumber = '5536 9137 ' + Math.floor(1000 + Math.random() * 9000) + ' ' + Math.floor(1000 + Math.random() * 9000);
  const expiryDate = '12/28';
  const cvc = '***';
  const actualCVC = '742';

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ''));
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirm = () => {
    const subscription = {
      id: service.id + '_' + Date.now(),
      name: service.name,
      price: service.suggestedLimit,
      logoId: service.logoId,
      active: true,
      cardNumber: cardNumber,
      expiryDate: expiryDate,
      cvc: actualCVC
    };
    onConfirm(subscription);
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">
          {t('addFlow.cardIssued')}
        </h2>
      </div>

      {/* Service Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="text-sm text-gray-500 mb-1">{t('addFlow.service')}</div>
        <div className="text-lg font-semibold text-gray-900">{service.name}</div>
        <div className="text-sm text-gray-500 mt-2">
          {t('addFlow.monthlyLimit')}: {formatCurrency(service.suggestedLimit)}
        </div>
      </div>

      {/* Virtual Card */}
      <div className="relative mb-6">
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-black rounded-2xl p-6 shadow-2xl aspect-[1.586/1] flex flex-col justify-between text-white">
          {/* Card Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs opacity-60 mb-1">Virtual Card</div>
              <div className="text-lg font-bold">Accord</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
              💳
            </div>
          </div>

          {/* Card Number */}
          <div>
            <div className="text-xs opacity-60 mb-2">{t('addFlow.cardNumber')}</div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-mono tracking-wider">
                {cardNumber}
              </div>
              <button
                onClick={() => handleCopy(cardNumber, 'card')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {copiedField === 'card' ? (
                  <Check size={16} className="text-green-400" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>

            {/* Expiry and CVC */}
            <div className="flex gap-6">
              <div>
                <div className="text-xs opacity-60 mb-1">{t('addFlow.validThru')}</div>
                <div className="text-sm font-mono">{expiryDate}</div>
              </div>
              <div>
                <div className="text-xs opacity-60 mb-1">CVC</div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-mono">
                    {showCVC ? actualCVC : cvc}
                  </div>
                  <button
                    onClick={() => setShowCVC(!showCVC)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    {showCVC ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  {showCVC && (
                    <button
                      onClick={() => handleCopy(actualCVC, 'cvc')}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      {copiedField === 'cvc' ? (
                        <Check size={14} className="text-green-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent rounded-2xl pointer-events-none" />
      </div>

      {/* Info */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-blue-900">
          {t('addFlow.cardLinkedTo')} <strong>{service.name}</strong>.
          {t('addFlow.monthlyLimitWillBe')} {formatCurrency(service.suggestedLimit)}.
        </p>
      </div>

      {/* Confirm Button */}
      <button
        onClick={handleConfirm}
        className="w-full py-4 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 transition-colors shadow-lg"
      >
        {t('addFlow.addToSubscriptions')}
      </button>
    </div>
  );
};

export default VCardIssue;
