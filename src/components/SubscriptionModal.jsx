import React, { useState, useEffect } from 'react';
import { X, Cloud, Building2, Box, PenTool, LayoutTemplate, FileText, CreditCard, Utensils, ShoppingBag, Car, Home, Smartphone, Gamepad2, Music, Film, Briefcase, Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

const MirLogo = () => (
  <svg viewBox="0 0 400 120" className="h-4 w-auto flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="modalMirGradient" x1="370" x2="290" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1F5CD7" />
        <stop stopColor="#02AEFF" offset="1" />
      </linearGradient>
    </defs>
    <path
      d="m31 13h33c3 0 12-1 16 13 3 9 7 23 13 44h2c6-22 11-37 13-44 4-14 14-13 18-13h31v96h-32v-57h-2l-17 57h-24l-17-57h-3v57h-31m139-96h32v57h3l21-47c4-9 13-10 13-10h30v96h-32v-57h-2l-21 47c-4 9-14 10-14 10h-30m142-29v29h-30v-50h98c-4 12-18 21-34 21"
      fill="#0f754e"
    />
    <path d="m382 53c4-18-8-40-34-40h-68c2 21 20 40 39 40" fill="url(#modalMirGradient)" />
  </svg>
);

const MastercardLogo = () => (
  <div className="relative w-7 h-5 flex-shrink-0">
    <div className="absolute left-0 top-0 w-5 h-5 bg-[#EB001B] rounded-full opacity-90" />
    <div className="absolute left-2.5 top-0 w-5 h-5 bg-[#F79E1B] rounded-full opacity-90 mix-blend-multiply" />
  </div>
);

const ICONS = [
  { id: 'default', icon: CreditCard },
  { id: 'cloud', icon: Cloud },
  { id: 'building', icon: Building2 },
  { id: 'box', icon: Box },
  { id: 'pen', icon: PenTool },
  { id: 'layout', icon: LayoutTemplate },
  { id: 'file', icon: FileText },
  { id: 'utensils', icon: Utensils },
  { id: 'shopping', icon: ShoppingBag },
  { id: 'car', icon: Car },
  { id: 'home', icon: Home },
  { id: 'smartphone', icon: Smartphone },
  { id: 'gamepad', icon: Gamepad2 },
  { id: 'music', icon: Music },
  { id: 'film', icon: Film },
  { id: 'briefcase', icon: Briefcase },
  { id: 'heart', icon: Heart },
];

const SubscriptionModal = ({ isOpen, onClose, onSave, onDelete, subscription }) => {
  const { t, getCurrency, language, convertToRub, convertFromRub } = useLanguage();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('default');
  const [cardType, setCardType] = useState('mir');
  const [errors, setErrors] = useState({});

  // Lock body scroll when modal is open
  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (subscription) {
      setName(subscription.name);
      // Convert stored RUB price to display currency
      const displayPrice = convertFromRub(subscription.price);
      setPrice(displayPrice.toString());
      setSelectedIcon(subscription.iconName || 'default');
      setCardType(subscription.card_type ?? 'mir');
    } else {
      setName('');
      setPrice('');
      setSelectedIcon('default');
      setCardType('mir');
    }
    setErrors({});
  }, [subscription, isOpen, convertFromRub]);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = t('modal.nameError');
    }
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      newErrors.price = t('modal.priceError');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    // Convert displayed price to RUB before saving
    const priceInRub = convertToRub(parseFloat(price));
    
    onSave({
      id: subscription?.id || `sub_${Date.now()}`,
      name: name.trim(),
      price: priceInRub,
      active: subscription?.active ?? true,
      iconName: selectedIcon,
      card_type: cardType,
      binding_status: subscription?.binding_status ?? 'pending_user_confirm',
    });
    onClose();
  };

  const handleDelete = () => {
    if (subscription && onDelete) {
      onDelete(subscription.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">
            {subscription ? t('modal.editSubscription') : t('modal.newSubscription')}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {t('modal.name')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('modal.namePlaceholder')}
              className={`w-full px-3 py-2.5 border-2 rounded-xl focus:border-zinc-900 focus:outline-none transition-colors ${
                errors.name ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {t('modal.price')}
            </label>
            <div className="relative">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                min="0"
                step="1"
                className={`w-full px-3 py-2.5 border-2 rounded-xl focus:border-zinc-900 focus:outline-none transition-colors ${
                  errors.price ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {language === 'en' ? '$' : '₽'}
              </span>
            </div>
            {errors.price && (
              <p className="mt-1 text-xs text-red-500">{errors.price}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Какой картой списывается</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCardType('mir')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-colors text-left ${
                  cardType === 'mir' ? 'border-zinc-900 bg-zinc-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <MirLogo />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900">МИР</div>
                  <div className="text-[10px] text-gray-400 leading-tight">Внутри страны</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setCardType('mc')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-colors text-left ${
                  cardType === 'mc' ? 'border-zinc-900 bg-zinc-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <MastercardLogo />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900">Mastercard</div>
                  <div className="text-[10px] text-gray-400 leading-tight">За рубежом</div>
                </div>
              </button>
            </div>
          </div>

          {/* Показывать иконки только при создании новой подписки */}
          {!subscription && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                {t('modal.icon')}
              </label>
              <div className="grid grid-cols-9 gap-2">
                {ICONS.map((iconData) => {
                  const Icon = iconData.icon;
                  const isSelected = selectedIcon === iconData.id;
                  return (
                    <button
                      key={iconData.id}
                      type="button"
                      onClick={() => setSelectedIcon(iconData.id)}
                      className={`p-2.5 rounded-xl transition-all ${
                        isSelected
                          ? 'bg-zinc-900 text-white shadow-lg'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={18} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-2 py-3.5 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-2xl font-semibold hover:from-zinc-800 hover:to-zinc-700 transition-all"
          >
            {subscription ? t('modal.save') : t('modal.add')}
          </button>
          {subscription && (
            <button
              type="button"
              onClick={handleDelete}
              className="w-full text-sm text-red-500 font-medium hover:text-red-600 transition-colors py-2"
            >
              {t('modal.delete')}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default SubscriptionModal;
