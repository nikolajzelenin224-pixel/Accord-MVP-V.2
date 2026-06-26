import React, { useState } from 'react';
import { X, Check, Copy, Eye, EyeOff, CreditCard, ListChecks } from 'lucide-react';

const CARD_LABELS = { mir: 'МИР', mc: 'Mastercard' };

const formatCardNumber = (num) => (num ? num.replace(/(.{4})/g, '$1 ').trim() : '');

const CardBindingScreen = ({ subscription, cards = [], hasMore, onConfirm, onClose }) => {
  const [copiedCard, setCopiedCard] = useState(false);
  const [copiedCvc, setCopiedCvc] = useState(false);
  const [showCvc, setShowCvc] = useState(false);

  const card = cards.find((c) => c.type === subscription.card_type);

  const handleCopyCard = () => {
    if (!card) return;
    navigator.clipboard.writeText(card.card_number);
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 2000);
  };

  const handleCopyCvc = () => {
    if (!card) return;
    navigator.clipboard.writeText(card.cvc);
    setCopiedCvc(true);
    setTimeout(() => setCopiedCvc(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
              <ListChecks size={14} />
              Привязка карты к сервисам
            </div>
            <button onClick={onClose} className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-1">Привяжите карту к {subscription.name}</h2>
          <p className="text-sm text-gray-500 mb-6">
            Чтобы Accord мог покрывать эту подписку, добавьте карту ниже в способах оплаты сервиса.
          </p>

          <ol className="space-y-2.5 text-sm text-gray-700 list-decimal list-inside mb-5">
            <li>Откройте {subscription.name} → раздел «Способ оплаты» / «Платёжные данные».</li>
            <li>Добавьте новую карту и введите данные карты {CARD_LABELS[subscription.card_type] ?? ''} ниже.</li>
            <li>Сохраните — дальше {subscription.name} будет списывать именно с этой карты.</li>
          </ol>

          {card ? (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl mb-5">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <CreditCard size={14} />
                Карта {CARD_LABELS[card.type] ?? card.type}
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-mono tracking-wider text-gray-900">
                  {formatCardNumber(card.card_number)}
                </span>
                <button onClick={handleCopyCard} className="p-2 hover:bg-white rounded-lg transition-colors">
                  {copiedCard ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-gray-500" />}
                </button>
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <div className="text-[10px] text-gray-400 mb-0.5">Срок действия</div>
                  <div className="text-sm font-mono text-gray-900">{card.expiry}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 mb-0.5">CVC</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-gray-900">{showCvc ? card.cvc : '***'}</span>
                    <button onClick={() => setShowCvc((p) => !p)} className="p-1 hover:bg-white rounded-lg transition-colors">
                      {showCvc ? <EyeOff size={14} className="text-gray-500" /> : <Eye size={14} className="text-gray-500" />}
                    </button>
                    <button onClick={handleCopyCvc} className="p-1 hover:bg-white rounded-lg transition-colors">
                      {copiedCvc ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-gray-500" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-5 text-sm text-amber-700">
              Карта {CARD_LABELS[subscription.card_type] ?? subscription.card_type} не выпущена — выпустите её в Профиле, чтобы привязать к этой подписке.
            </div>
          )}

          <button
            onClick={onConfirm}
            className="w-full py-4 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-2xl font-semibold hover:from-zinc-800 hover:to-zinc-700 transition-all shadow-lg hover:shadow-xl"
          >
            {hasMore ? 'Я привязал — дальше' : 'Я привязал'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardBindingScreen;
