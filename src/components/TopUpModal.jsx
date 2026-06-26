import React, { useState, useEffect } from 'react';
import { X, Check, Clock, Sparkles, Copy, CreditCard, QrCode, ChevronDown, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { supabase } from '../lib/supabaseClient';

const STEPS = {
  AMOUNT_INPUT: 'amount_input',
  PENDING: 'pending',
  SUCCESS: 'success',
};

const CARD_LABELS = { mir: 'МИР', mc: 'Mastercard' };

const SBP_QR_URL = 'https://nzfgtaexzwqolwbmsyai.supabase.co/storage/v1/object/public/avatars/sbp-qr.jpg';
const SBP_PHONE = '+7 965 779-99-75';
const SBP_QR_DELAY_MS = 2000;

const formatCardNumber = (num) => (num ? num.replace(/(.{4})/g, '$1 ').trim() : '');

const TopUpModal = ({ isOpen, onClose, userId, recommendedAmounts = { mir: 0, mc: 0 }, cards = [] }) => {
  const { t, formatCurrency } = useLanguage();
  const [currentStep, setCurrentStep] = useState(STEPS.AMOUNT_INPUT);
  const [selectedType, setSelectedType] = useState(cards[0]?.type ?? null);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [topupId, setTopupId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [sbpOpen, setSbpOpen] = useState(false);
  const [sbpGenerating, setSbpGenerating] = useState(false);
  const [phoneCopied, setPhoneCopied] = useState(false);
  const [mcInfoOpen, setMcInfoOpen] = useState(false);

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(STEPS.AMOUNT_INPUT);
      setAmount('');
      setSubmitting(false);
      setSubmitError('');
      setTopupId(null);
      setCopied(false);
      setSelectedType(cards[0]?.type ?? null);
      setSbpOpen(false);
      setSbpGenerating(false);
      setPhoneCopied(false);
      setMcInfoOpen(false);
    }
  }, [isOpen, cards]);

  // Заявка подтверждается асинхронно (вебхук от MacroDroid на телефоне админа),
  // поэтому слушаем изменение её статуса через Supabase Realtime, а не угадываем таймером.
  useEffect(() => {
    if (!topupId) return;
    const channel = supabase
      .channel(`topup-${topupId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'balance_topups', filter: `id=eq.${topupId}` },
        (payload) => {
          if (payload.new.status === 'confirmed') {
            setCurrentStep(STEPS.SUCCESS);
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [topupId]);

  useEffect(() => {
    if (currentStep === STEPS.SUCCESS) {
      const timer = setTimeout(onClose, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, onClose]);

  const selectedCard = cards.find((c) => c.type === selectedType) ?? cards[0] ?? null;
  const recommendedAmount = selectedCard ? (recommendedAmounts[selectedCard.type] ?? 0) : 0;

  const handleCopyCard = () => {
    if (!selectedCard) return;
    navigator.clipboard.writeText(selectedCard.card_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSbp = () => {
    if (sbpOpen) {
      setSbpOpen(false);
      return;
    }
    setSbpOpen(true);
    setSbpGenerating(true);
    setTimeout(() => setSbpGenerating(false), SBP_QR_DELAY_MS);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(SBP_PHONE.replace(/\s/g, ''));
    setPhoneCopied(true);
    setTimeout(() => setPhoneCopied(false), 2000);
  };

  const handleAmountSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0 || !selectedCard || !userId) return;
    setSubmitting(true);
    setSubmitError('');

    const { data, error } = await supabase
      .from('balance_topups')
      .insert({ user_id: userId, amount: parseFloat(amount), card_type: selectedCard.type })
      .select()
      .single();

    setSubmitting(false);

    if (error) {
      setSubmitError(error.message);
      return;
    }

    setTopupId(data.id);
    setCurrentStep(STEPS.PENDING);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={currentStep === STEPS.SUCCESS ? undefined : onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
        {currentStep !== STEPS.SUCCESS && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        )}

        <div className="overflow-y-auto flex-1">
          {currentStep === STEPS.AMOUNT_INPUT && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('topUp.amountTitle')}</h2>
              <p className="text-sm text-gray-500 mb-6">{t('topUp.transferInstructions')}</p>

              {/* Accord card to transfer to */}
              {selectedCard && (
                <div className="mb-6">
                  {cards.length > 1 && (
                    <div className="flex gap-2 mb-3">
                      {cards.map((c) => (
                        <button
                          key={c.type}
                          onClick={() => setSelectedType(c.type)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-colors ${
                            selectedType === c.type
                              ? 'border-zinc-900 bg-zinc-900 text-white'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {CARD_LABELS[c.type] ?? c.type}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <CreditCard size={14} />
                      {t('topUp.yourAccordCard')} · {CARD_LABELS[selectedCard.type] ?? selectedCard.type}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-mono tracking-wider text-gray-900">
                        {formatCardNumber(selectedCard.card_number)}
                      </span>
                      <button
                        onClick={handleCopyCard}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                      >
                        {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-gray-500" />}
                      </button>
                    </div>
                    {copied && <p className="text-xs text-green-600 mt-1">{t('topUp.cardCopied')}</p>}
                  </div>

                  {selectedCard.type === 'mir' ? (
                    <>
                      {/* SBP plate */}
                      <button
                        onClick={handleToggleSbp}
                        className="w-full flex items-center justify-between p-4 mt-3 bg-gray-50 border border-gray-200 rounded-2xl hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <QrCode size={18} className="text-gray-600" />
                          <span className="text-sm font-semibold text-gray-900">СБП</span>
                        </div>
                        <ChevronDown
                          size={18}
                          className={`text-gray-400 transition-transform ${sbpOpen ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {sbpOpen && (
                        <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col items-center">
                          <div className="relative w-44 h-44 mb-3 rounded-xl overflow-hidden bg-white">
                            <img
                              src={SBP_QR_URL}
                              alt="QR для перевода по СБП"
                              className={`w-full h-full object-contain transition-all duration-300 ${
                                sbpGenerating ? 'blur-md scale-105' : ''
                              }`}
                            />
                            {sbpGenerating && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/50">
                                <div className="w-7 h-7 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                                <span className="text-xs font-medium text-gray-700">Генерируем QR-код</span>
                              </div>
                            )}
                          </div>

                          <p className="text-xs text-gray-500 mb-2">Перевод по СБП по номеру телефона</p>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-mono font-semibold text-gray-900">{SBP_PHONE}</span>
                            <button
                              onClick={handleCopyPhone}
                              className="p-1.5 hover:bg-white rounded-lg transition-colors"
                            >
                              {phoneCopied ? <Check size={15} className="text-green-600" /> : <Copy size={15} className="text-gray-500" />}
                            </button>
                          </div>
                          {phoneCopied && <p className="text-xs text-green-600 mt-1">{t('topUp.cardCopied')}</p>}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* MC transfer instructions */}
                      <button
                        onClick={() => setMcInfoOpen((p) => !p)}
                        className="w-full flex items-center justify-between p-4 mt-3 bg-gray-50 border border-gray-200 rounded-2xl hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Info size={18} className="text-gray-600" />
                          <span className="text-sm font-semibold text-gray-900">Инструкция по переводу</span>
                        </div>
                        <ChevronDown
                          size={18}
                          className={`text-gray-400 transition-transform ${mcInfoOpen ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {mcInfoOpen && (
                        <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
                          <ol className="space-y-1.5 text-sm text-gray-700 list-decimal list-inside">
                            <li>В приложении банка: «Платежи» → «Перевод в другую страну» → страна «Казахстан».</li>
                            <li>Номер карты — этой карты выше. Получатель: <span className="font-semibold">NIKOLAI ZELENIN</span>.</li>
                            <li>Укажите сумму и отправьте — деньги придут в течение 5 минут.</li>
                          </ol>

                          <div className="pt-2 border-t border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Минимальная сумма перевода зависит от банка:</p>
                            <ul className="text-xs text-gray-600 space-y-0.5">
                              <li>Сбербанк — от 5 000 ₽</li>
                              <li>Т-Банк — от 2 000 ₽</li>
                              <li>Альфа-Банк — от 100 ₽ (для небольших сумм)</li>
                            </ul>
                          </div>

                          <p className="text-xs text-gray-500">
                            Вопросы — Telegram{' '}
                            <a
                              href="https://t.me/Nick_Zelenin"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 font-medium hover:underline"
                            >
                              @Nick_Zelenin
                            </a>
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('topUp.enterAmount')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-4 text-2xl font-bold border-2 border-gray-200 rounded-2xl focus:border-gray-900 focus:outline-none transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">₽</span>
                </div>
              </div>

              {recommendedAmount > 0 && (
                <button
                  onClick={() => setAmount(recommendedAmount.toString())}
                  className="w-full p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl mb-6 hover:border-yellow-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles size={20} className="text-yellow-600" />
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900">{t('topUp.recommendedAmount')}</div>
                        <div className="text-xs text-gray-600">
                          {selectedCard?.type === 'mc'
                            ? 'Сумма всех зарубежных подписок (Mastercard)'
                            : 'Сумма всех подписок внутри страны (МИР)'}
                        </div>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-gray-900">{formatCurrency(recommendedAmount)}</div>
                  </div>
                </button>
              )}

              {submitError && <p className="text-sm text-red-600 mb-3">{submitError}</p>}

              <button
                onClick={handleAmountSubmit}
                disabled={!amount || parseFloat(amount) <= 0 || submitting}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {submitting ? 'Отправляем...' : `${t('topUp.topUpButton')} ${amount ? formatCurrency(parseFloat(amount)) : ''}`}
              </button>
            </div>
          )}

          {currentStep === STEPS.PENDING && (
            <div className="p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="mb-6 w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center">
                <Clock size={36} className="text-amber-500" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">Ждём поступления перевода</h3>
              <p className="text-sm text-gray-500 max-w-xs mb-6">
                Обычно занимает до нескольких минут. Можно закрыть это окно — баланс обновится автоматически, как только перевод поступит.
              </p>

              <div className="text-3xl font-bold text-gray-900 mb-8">{formatCurrency(parseFloat(amount))}</div>

              <button
                onClick={onClose}
                className="w-full py-3.5 bg-zinc-900 text-white rounded-2xl font-semibold hover:bg-zinc-800 transition-all"
              >
                Закрыть
              </button>
            </div>
          )}

          {currentStep === STEPS.SUCCESS && (
            <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Check size={40} className="text-green-600" strokeWidth={3} />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('topUp.success')}</h3>

              <p className="text-gray-600 text-center mb-6">{t('topUp.fundsAdded')}</p>

              <div className="text-4xl font-bold text-gray-900 mb-2">
                {formatCurrency(parseFloat(amount))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopUpModal;
