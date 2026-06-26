import React, { useState, useRef, useEffect } from 'react';
import { Zap, ShieldCheck, Loader2, Send } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const BOT_USERNAME = 'accord_sup_bot';

function generateToken() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const AuthScreen = ({ onAuthenticated }) => {
  const [step, setStep] = useState('start'); // 'start' | 'waiting_telegram' | 'code'
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const pollRef = useRef(null);
  const tokenRef = useRef(null);

  useEffect(() => () => clearInterval(pollRef.current), []);

  const openTelegram = () => {
    setError('');
    const token = generateToken();
    tokenRef.current = token;
    window.open(`https://t.me/${BOT_USERNAME}?start=${token}`, '_blank');
    setStep('waiting_telegram');

    pollRef.current = setInterval(async () => {
      const { data } = await supabase.rpc('get_login_attempt', { p_token: tokenRef.current });
      const row = data?.[0];

      if (row?.status === 'code_sent' && row.phone) {
        clearInterval(pollRef.current);
        setPhone(row.phone);
        setStep('code');
      }
    }, 2000);
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    if (code.length < 4) {
      setError('Введите код из Telegram');
      return;
    }
    setLoading(true);
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      phone: '+' + phone,
      token: code,
      type: 'sms',
    });
    setLoading(false);
    if (verifyError) {
      setError(verifyError.message);
      return;
    }
    onAuthenticated(data.session);
  };

  const reset = () => {
    clearInterval(pollRef.current);
    setStep('start');
    setCode('');
    setError('');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <div className="mb-8 relative">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl p-4 border border-gray-100">
          <img
            src="https://i.ibb.co/CpXQDcjc/image.png"
            alt="Accord"
            className="w-full h-full object-contain"
            onError={(e) => { e.target.src = 'https://i.ibb.co/PvzK2qmC/image.png'; }}
          />
        </div>
        <div className="absolute -top-2 -right-2 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center">
          <Zap size={14} className="text-zinc-900" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        Добро пожаловать в Accord
      </h2>
      <p className="text-gray-600 text-center mb-8 max-w-sm">
        {step === 'start' && 'Войдите через Telegram — это быстро и без пароля'}
        {step === 'waiting_telegram' && 'Поделитесь номером в открывшемся Telegram-боте'}
        {step === 'code' && 'Введите код, отправленный в Telegram'}
      </p>

      {step === 'start' && (
        <div className="w-full max-w-sm space-y-4">
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <button
            type="button"
            onClick={openTelegram}
            className="w-full py-4 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-2xl font-semibold hover:from-zinc-800 hover:to-zinc-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <Send size={18} />
            Войти через Telegram
          </button>
        </div>
      )}

      {step === 'waiting_telegram' && (
        <div className="w-full max-w-sm space-y-4 text-center">
          <Loader2 size={32} className="animate-spin mx-auto text-zinc-900" />
          <p className="text-sm text-gray-500">
            Нажмите «Поделиться номером» в открывшемся чате с ботом — мы автоматически продолжим вход.
          </p>
          <button
            type="button"
            onClick={openTelegram}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-200 transition-all"
          >
            Открыть Telegram ещё раз
          </button>

          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">
              Если бот не получил команду автоматически, отправьте ему вручную:
            </p>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(`/start ${tokenRef.current}`)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-600 break-all hover:bg-gray-100"
            >
              /start {tokenRef.current}
            </button>
            <p className="text-[11px] text-gray-400 mt-1">Нажмите, чтобы скопировать</p>
          </div>

          <button type="button" onClick={reset} className="w-full text-sm text-gray-500 hover:text-gray-700">
            Назад
          </button>
        </div>
      )}

      {step === 'code' && (
        <form onSubmit={handleVerifyCode} className="w-full max-w-sm space-y-4">
          <div className="relative">
            <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              placeholder="Код из Telegram"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base tracking-widest focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
            />
          </div>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-2xl font-semibold hover:from-zinc-800 hover:to-zinc-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            Подтвердить
          </button>
          <button type="button" onClick={reset} className="w-full text-sm text-gray-500 hover:text-gray-700">
            Начать сначала
          </button>
        </form>
      )}
    </div>
  );
};

export default AuthScreen;
