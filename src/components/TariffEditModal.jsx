import React, { useState } from 'react';
import { X } from 'lucide-react';

const PERIOD_OPTIONS = [
  { value: 'trial', label: 'Пробная подписка' },
  { value: 'week', label: 'Неделя' },
  { value: '1m', label: '1 месяц' },
  { value: '2m', label: '2 месяца' },
  { value: '3m', label: '3 месяца' },
  { value: '6m', label: '6 месяцев' },
  { value: '12m', label: '12 месяцев' },
  { value: '24m', label: '24 месяца' },
  { value: 'custom', label: 'Свой период' },
];

const TariffEditModal = ({ service, initial, onSave, onClose }) => {
  const [name, setName] = useState(initial?.name ?? service.name);
  const [period, setPeriod] = useState(initial?.period ?? '1m');
  const [customMonths, setCustomMonths] = useState(initial?.customMonths ?? '');
  const [price, setPrice] = useState(initial?.price ?? service.default_price);

  const handleSave = () => {
    onSave({
      name: name.trim() || service.name,
      period,
      customMonths: period === 'custom' ? customMonths : undefined,
      price: Number(price) || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">Изменить тариф</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Название подписки</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-zinc-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Период оплаты</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-zinc-900 focus:outline-none bg-white"
            >
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {period === 'custom' && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Свой период (месяцев)</label>
              <input
                type="number"
                min="1"
                value={customMonths}
                onChange={(e) => setCustomMonths(e.target.value)}
                placeholder="Например, 4"
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-zinc-900 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Стоимость, ₽</label>
            <input
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Если у вас персональный тариф"
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-zinc-900 focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              По умолчанию {service.default_price} ₽ — измените, если у вас другой тариф
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full mt-6 py-3.5 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-2xl font-semibold hover:from-zinc-800 hover:to-zinc-700 transition-all"
        >
          Сохранить
        </button>
      </div>
    </div>
  );
};

export default TariffEditModal;
