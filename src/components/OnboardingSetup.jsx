import React, { useState, useEffect } from 'react';
import { X, Calendar, CalendarRange, Check, ChevronLeft, Minus, Plus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

const QUICK_DAYS = [1, 5, 10, 15, 20, 25, 28];

const OnboardingSetup = ({ isOpen, onClose, onComplete, totalAmount, initialMode = 'unified', initialDay = 15 }) => {
  const { t, formatCurrency } = useLanguage();
  const [step, setStep] = useState('approach'); // 'approach' | 'details'
  const [mode, setMode] = useState(initialMode);
  const [selectedDay, setSelectedDay] = useState(initialDay);

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setStep('approach');
      setMode(initialMode);
      setSelectedDay(initialDay);
    }
  }, [isOpen, initialMode, initialDay]);

  const clampDay = (value) => Math.min(31, Math.max(1, value || 1));

  const handleComplete = () => {
    onComplete({
      mode,
      paymentDate: mode === 'unified' ? selectedDay : null,
      autoPayment: true,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-slideUp">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step === 'details' ? (
              <button onClick={() => setStep('approach')} className="p-1 -ml-1 hover:bg-gray-100 rounded-full transition-colors">
                <ChevronLeft size={20} />
              </button>
            ) : (
              <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
                <Check size={18} className="text-green-600" />
              </div>
            )}
            <div>
              <h2 className="text-base font-semibold text-gray-900">{t('onboarding.title')}</h2>
              <p className="text-xs text-gray-500">{t('onboarding.subtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {step === 'approach' && (
          <div className="p-6 space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              {t('onboarding.chooseApproach')}
            </label>

            <div className="space-y-3">
              <button
                onClick={() => setMode('unified')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  mode === 'unified' ? 'border-zinc-900 bg-zinc-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                    mode === 'unified' ? 'border-zinc-900 bg-zinc-900' : 'border-gray-300'
                  }`}>
                    {mode === 'unified' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={16} className="text-zinc-700" />
                      <h3 className="font-semibold text-gray-900">{t('onboarding.unifiedTitle')}</h3>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        {t('onboarding.recommended')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{t('onboarding.unifiedDesc')}</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setMode('individual')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  mode === 'individual' ? 'border-zinc-900 bg-zinc-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                    mode === 'individual' ? 'border-zinc-900 bg-zinc-900' : 'border-gray-300'
                  }`}>
                    {mode === 'individual' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarRange size={16} className="text-zinc-700" />
                      <h3 className="font-semibold text-gray-900">{t('onboarding.individualTitle')}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{t('onboarding.individualDesc')}</p>
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setStep('details')}
              className="w-full py-4 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-2xl font-semibold hover:from-zinc-800 hover:to-zinc-700 transition-all shadow-lg hover:shadow-xl"
            >
              {t('onboarding.next')}
            </button>
          </div>
        )}

        {step === 'details' && (
          <div className="p-6 space-y-5">
            {mode === 'unified' ? (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-4">
                  <Calendar size={16} />
                  {t('onboarding.selectChargeDay')}
                </label>

                <div className="flex items-center justify-center gap-4 mb-4">
                  <button
                    onClick={() => setSelectedDay((d) => clampDay(d - 1))}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    <Minus size={18} />
                  </button>
                  <div className="flex items-baseline gap-1.5">
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(clampDay(parseInt(e.target.value, 10)))}
                      className="w-20 text-center text-4xl font-bold text-gray-900 border-b-2 border-gray-200 focus:border-zinc-900 outline-none transition-colors"
                    />
                    <span className="text-sm text-gray-400">{t('onboarding.dayOfMonth')}</span>
                  </div>
                  <button
                    onClick={() => setSelectedDay((d) => clampDay(d + 1))}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  {QUICK_DAYS.map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedDay === day
                          ? 'bg-zinc-900 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                <p className="text-xs text-gray-500 mt-3 text-center">{t('onboarding.chargeDayHint')}</p>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-sm text-gray-600">{t('onboarding.individualNote')}</p>
              </div>
            )}

            {/* Summary */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
              <div className="space-y-1 text-sm">
                {mode === 'unified' ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('onboarding.chargeDay')}:</span>
                      <span className="font-semibold text-gray-900">{selectedDay} {t('onboarding.dayOfMonth')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('onboarding.monthlyAmount')}:</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(totalAmount)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('onboarding.approach')}:</span>
                    <span className="font-semibold text-gray-900">{t('onboarding.individualTitle')}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleComplete}
              className="w-full py-4 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-2xl font-semibold hover:from-zinc-800 hover:to-zinc-700 transition-all shadow-lg hover:shadow-xl"
            >
              {t('onboarding.complete')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingSetup;
