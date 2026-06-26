import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Check, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const CARD_DEFS = {
  mir: {
    label: 'МИР',
    sub: 'Для платежей внутри страны',
    card_number: '2202 2082 8064 0658',
    expiry: '09/35',
    cvc: '914',
    gradient: 'from-green-700 via-green-800 to-zinc-900',
  },
  mc: {
    label: 'Mastercard',
    sub: 'Для зарубежных платежей',
    card_number: '5269 8800 1729 4802',
    expiry: '01/31',
    cvc: '624',
    gradient: 'from-zinc-900 via-zinc-800 to-black',
  },
};

const CardIssueScreen = ({ userId, onComplete }) => {
  const [selected, setSelected] = useState({ mir: true, mc: false });
  const [issued, setIssued] = useState(null); // array of types after issuing
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [revealedCvc, setRevealedCvc] = useState({});
  const [copiedField, setCopiedField] = useState(null);

  const toggle = (type) => setSelected((prev) => ({ ...prev, [type]: !prev[type] }));

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ''));
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleIssue = async () => {
    const types = Object.keys(selected).filter((t) => selected[t]);
    if (types.length === 0) {
      setError('Выберите хотя бы одну карту');
      return;
    }
    setError('');
    setLoading(true);

    const rows = types.map((type) => ({
      user_id: userId,
      type,
      card_number: CARD_DEFS[type].card_number.replace(/\s/g, ''),
      expiry: CARD_DEFS[type].expiry,
      cvc: CARD_DEFS[type].cvc,
    }));

    const { error: insertError } = await supabase.from('cards').upsert(rows, { onConflict: 'user_id,type' });
    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setIssued(types);
  };

  if (issued) {
    return (
      <div className="px-6 py-12 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Карта выпущена</h2>
        <p className="text-gray-600 text-center mb-8 text-sm">
          Используйте эти данные для пополнения и привязки к сервисам
        </p>

        <div className="space-y-5">
          {issued.map((type) => {
            const def = CARD_DEFS[type];
            const isCvcOpen = revealedCvc[type];
            return (
              <div key={type} className="relative">
                <div className={`bg-gradient-to-br ${def.gradient} rounded-2xl p-6 shadow-2xl aspect-[1.586/1] flex flex-col justify-between text-white`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs opacity-60 mb-1">{def.label}</div>
                      <div className="text-lg font-bold">Accord</div>
                    </div>
                    <CreditCard size={24} className="opacity-70" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-lg font-mono tracking-wider">{def.card_number}</div>
                      <button onClick={() => handleCopy(def.card_number, type + '_card')} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        {copiedField === type + '_card' ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                      </button>
                    </div>
                    <div className="flex gap-6">
                      <div>
                        <div className="text-xs opacity-60 mb-1">Действует до</div>
                        <div className="text-sm font-mono">{def.expiry}</div>
                      </div>
                      <div>
                        <div className="text-xs opacity-60 mb-1">CVC</div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-mono">{isCvcOpen ? def.cvc : '***'}</div>
                          <button onClick={() => setRevealedCvc((p) => ({ ...p, [type]: !p[type] }))} className="p-1 hover:bg-white/10 rounded transition-colors">
                            {isCvcOpen ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          {isCvcOpen && (
                            <button onClick={() => handleCopy(def.cvc, type + '_cvc')} className="p-1 hover:bg-white/10 rounded transition-colors">
                              {copiedField === type + '_cvc' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onComplete}
          className="w-full mt-8 py-4 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-2xl font-semibold hover:from-zinc-800 hover:to-zinc-700 transition-all shadow-lg hover:shadow-xl"
        >
          Продолжить
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 py-12 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Выпустите карту</h2>
      <p className="text-gray-600 text-center mb-8 text-sm">
        Можно выпустить одну или сразу обе — для оплаты внутри страны и за рубежом
      </p>

      <div className="space-y-3 mb-6">
        {Object.entries(CARD_DEFS).map(([type, def]) => (
          <button
            key={type}
            type="button"
            onClick={() => toggle(type)}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
              selected[type] ? 'border-zinc-900 bg-zinc-50' : 'border-gray-200 bg-white'
            }`}
          >
            <div className={`w-12 h-8 rounded bg-gradient-to-br ${def.gradient} flex-shrink-0`} />
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{def.label}</div>
              <div className="text-xs text-gray-500">{def.sub}</div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected[type] ? 'border-zinc-900 bg-zinc-900' : 'border-gray-300'}`}>
              {selected[type] && <Check size={12} className="text-white" />}
            </div>
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 text-center mb-4">{error}</p>}

      <button
        onClick={handleIssue}
        disabled={loading}
        className="w-full py-4 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-2xl font-semibold hover:from-zinc-800 hover:to-zinc-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-60"
      >
        {loading ? 'Выпускаем...' : 'Выпустить карту'}
      </button>
    </div>
  );
};

export default CardIssueScreen;
