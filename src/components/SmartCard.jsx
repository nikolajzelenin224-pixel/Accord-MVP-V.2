import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const CARD_DEFS = {
  mir: {
    type: 'mir',
    label: 'МИР',
    // Серебристый металлик вместо фирменного зелёного — задаём через inline-градиент,
    // т.к. в палитре Tailwind нет нужных серебряных оттенков.
    style: {
      backgroundImage:
        'linear-gradient(135deg, #9aa0a6 0%, #767a80 30%, #54565a 55%, #36373a 80%, #1c1d1f 100%)',
    },
    blurClass: 'bg-black/10',
  },
  mc: {
    type: 'mc',
    label: 'Mastercard',
    gradient: 'from-zinc-900 via-zinc-800 to-black',
    blurClass: 'bg-white/5',
  },
};

const MirBadge = () => (
  <svg viewBox="0 0 400 120" className="h-5 w-auto flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="mirSilver" x1="0" y1="0" x2="400" y2="120" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="55%" stopColor="#AEB4BB" />
        <stop offset="100%" stopColor="#2B2D31" />
      </linearGradient>
    </defs>
    <path
      d="m31 13h33c3 0 12-1 16 13 3 9 7 23 13 44h2c6-22 11-37 13-44 4-14 14-13 18-13h31v96h-32v-57h-2l-17 57h-24l-17-57h-3v57h-31m139-96h32v57h3l21-47c4-9 13-10 13-10h30v96h-32v-57h-2l-21 47c-4 9-14 10-14 10h-30m142-29v29h-30v-50h98c-4 12-18 21-34 21"
      fill="url(#mirSilver)"
    />
    <path
      d="m382 53c4-18-8-40-34-40h-68c2 21 20 40 39 40"
      fill="url(#mirSilver)"
    />
  </svg>
);

const MastercardBadge = () => (
  <div className="relative w-9 h-6 flex-shrink-0">
    <div className="absolute left-0 top-0 w-6 h-6 bg-[#EB001B] rounded-full opacity-90" />
    <div className="absolute left-3 top-0 w-6 h-6 bg-[#F79E1B] rounded-full opacity-90 mix-blend-screen" />
  </div>
);

const formatCardNumber = (num) => (num ? num.replace(/(.{4})/g, '$1 ').trim() : '•••• •••• •••• ••••');
const maskCardNumber = (num) => (num ? `•••• •••• •••• ${num.slice(-4)}` : '•••• •••• •••• ••••');

const SmartCard = ({ balances = { mir: 0, mc: 0 }, cards = [] }) => {
  const { t, formatCurrency } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCVC, setShowCVC] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);
  const [copiedCVC, setCopiedCVC] = useState(false);
  const [isCardNumberRevealed, setIsCardNumberRevealed] = useState(false);

  // Mastercard всегда первая (дефолтная), МИР — вторая, доступна по свайпу.
  const slides = ['mc', 'mir']
    .map((type) => ({ def: CARD_DEFS[type], card: cards.find((c) => c.type === type) }))
    .filter((slide) => slide.card);

  const active = slides[activeIndex] ?? slides[0];

  // Автоматическое скрытие номера карты через 5 секунд
  useEffect(() => {
    if (isCardNumberRevealed) {
      const timer = setTimeout(() => {
        setIsCardNumberRevealed(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isCardNumberRevealed]);

  const goToSlide = (index) => {
    if (index < 0 || index >= slides.length || index === activeIndex) return;
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
    setIsFlipped(false);
    setShowCVC(false);
    setIsCardNumberRevealed(false);
  };

  // Свайп определяем сами через pointer-события на немоторизованном контейнере,
  // т.к. drag из framer-motion перехватывал клики по карте (флип не срабатывал).
  const pointerStartX = useRef(null);

  const handlePointerDown = (e) => {
    pointerStartX.current = e.clientX;
  };

  const handlePointerUp = (e) => {
    if (pointerStartX.current === null) return;
    const deltaX = e.clientX - pointerStartX.current;
    pointerStartX.current = null;
    if (Math.abs(deltaX) < 40) return;
    if (deltaX < 0) goToSlide(activeIndex + 1);
    else goToSlide(activeIndex - 1);
  };

  const handleCopyCard = (e) => {
    e.stopPropagation();
    if (!active?.card) return;
    navigator.clipboard.writeText(active.card.card_number);
    setIsCardNumberRevealed(true);
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 2000);
  };

  const handleCopyCVC = (e) => {
    e.stopPropagation();
    if (!active?.card) return;
    navigator.clipboard.writeText(active.card.cvc);
    setCopiedCVC(true);
    setTimeout(() => setCopiedCVC(false), 2000);
  };

  const toggleCVC = (e) => {
    e.stopPropagation();
    setShowCVC(!showCVC);
  };

  if (!active) return null;

  const balance = balances[active.def.type] ?? 0;
  const NetworkBadge = active.def.type === 'mc' ? MastercardBadge : MirBadge;

  return (
    <div className="px-4 pt-2 pb-8">
      <div
        className="relative w-full"
        style={{ perspective: '1000px', touchAction: 'pan-y' }}
        onPointerDown={slides.length > 1 ? handlePointerDown : undefined}
        onPointerUp={slides.length > 1 ? handlePointerUp : undefined}
        onPointerCancel={slides.length > 1 ? () => { pointerStartX.current = null; } : undefined}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={active.def.type}
            custom={direction}
            initial={{ x: direction > 0 ? 80 : -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? -80 : 80, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="relative w-full h-auto min-h-[220px]"
          >
          {/* Отдельный обычный div для 3D-флипа — у motion.div transform уже занят
              анимацией слайда (x/opacity), он бы перезатирал ручной rotateY. */}
          <div
            className="relative w-full h-auto min-h-[220px]"
            style={{
              transformStyle: 'preserve-3d',
              transition: 'transform 0.6s',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Лицевая сторона */}
            <div
              className={`absolute inset-0 ${active.def.gradient ? `bg-gradient-to-br ${active.def.gradient}` : ''} text-white rounded-2xl shadow-2xl overflow-hidden cursor-pointer`}
              style={{
                ...(active.def.style || {}),
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                pointerEvents: isFlipped ? 'none' : 'auto',
              }}
              onClick={() => setIsFlipped(true)}
            >
              <div className="h-full flex flex-col justify-between p-6 relative">
                <div className={`absolute top-0 right-0 w-32 h-32 ${active.def.blurClass} rounded-full -mr-16 -mt-16 blur-3xl`} />

                <div className="flex justify-between items-start relative z-10">
                  <span className="text-xl font-bold tracking-tight">Accord</span>
                  <Wallet className="text-white/60" size={24} />
                </div>

                <div className="relative z-10">
                  <p className="text-white/60 text-xs uppercase tracking-widest mb-1">{t('card.availableLimit')}</p>
                  <h2 className="text-4xl font-bold tabular-nums">{formatCurrency(balance)}</h2>
                </div>

                <div className="flex justify-between items-end relative z-10">
                  <p className="text-white/50 text-[10px] tracking-widest">
                    •••• {active.card.card_number.slice(-4)}
                  </p>
                  <NetworkBadge />
                </div>
              </div>
            </div>

            {/* Обратная сторона */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-zinc-950 to-zinc-900 text-white rounded-2xl shadow-2xl cursor-pointer"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                pointerEvents: isFlipped ? 'auto' : 'none',
                minHeight: '220px',
              }}
              onClick={() => setIsFlipped(false)}
            >
              <div className="h-full flex flex-col gap-3 p-4 relative">
                <div className="absolute top-0 left-0 w-40 h-40 bg-white/5 rounded-full -ml-20 -mt-20 blur-3xl" />

                {/* Ряд 1: Плашка номера карты */}
                <div className="relative z-10 bg-zinc-800/80 rounded-xl p-3 flex justify-between items-center mt-1">
                  <span className="text-base font-mono tracking-wider">
                    {isCardNumberRevealed ? formatCardNumber(active.card.card_number) : maskCardNumber(active.card.card_number)}
                  </span>
                  <button
                    onClick={handleCopyCard}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer relative z-20"
                    aria-label={t('card.copyCard')}
                  >
                    {copiedCard ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                  </button>
                </div>

                {/* Ряд 2: CVC и текст в строку */}
                <div className="relative z-10 flex flex-row items-center gap-3">
                  <div className="bg-zinc-800/80 rounded-xl p-2.5 flex items-center gap-2.5 w-fit">
                    <span className="text-base font-mono tracking-wide">{showCVC ? active.card.cvc : '***'}</span>
                    <button
                      onClick={toggleCVC}
                      className="text-gray-400 hover:text-white transition-colors cursor-pointer relative z-20"
                      aria-label={showCVC ? t('card.hideCVC') : t('card.showCVC')}
                    >
                      {showCVC ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button
                      onClick={handleCopyCVC}
                      className="text-gray-400 hover:text-white transition-colors cursor-pointer relative z-20"
                      aria-label={t('card.copyCVC')}
                    >
                      {copiedCVC ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                    </button>
                  </div>

                  <div className="text-[10px] text-gray-500 leading-tight flex-1">
                    {t('card.cvcWarning')}
                  </div>
                </div>

                {/* Ряд 3: Срок действия (внизу) */}
                <div className="relative z-10 flex flex-col mt-auto">
                  <p className="text-white text-sm font-medium">{t('card.validUntil')} {active.card.expiry}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{t('card.anyName')}</p>
                </div>
              </div>
            </div>
          </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {slides.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {slides.map((slide, i) => (
            <button
              key={slide.def.type}
              onClick={() => goToSlide(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === activeIndex ? 'w-5 bg-zinc-900' : 'w-1.5 bg-zinc-300'
              }`}
              aria-label={slide.def.label}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartCard;
