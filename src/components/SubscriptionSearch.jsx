import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, PackageSearch, X, Check, Pencil, Sparkles, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import TariffEditModal from './TariffEditModal';
import SubscriptionModal from './SubscriptionModal';

const POPULAR_LIMIT = 10;
const DEBOUNCE_MS = 300;

const SubscriptionSearch = ({ onConfirmSelection }) => {
  const [rawQuery, setRawQuery] = useState('');
  const [query, setQuery] = useState('');
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]); // массив сервисов в порядке выбора
  const [overrides, setOverrides] = useState({}); // service.id -> { name, price, period, customMonths }
  const [editingService, setEditingService] = useState(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    supabase
      .from('registry_services')
      .select('*')
      .order('popularity_rank', { ascending: true, nullsFirst: false })
      .then(({ data }) => {
        setAllServices(data || []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setQuery(rawQuery), DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [rawQuery]);

  const selectedIds = useMemo(() => new Set(selected.map((s) => s.id)), [selected]);
  const isSearching = query.trim().length > 0;

  // В режиме браузинга (без поиска) карточки не двигаются — порядок фиксирован,
  // выбранные просто подсвечиваются на своём месте.
  const popularList = useMemo(() => {
    return allServices.filter((s) => s.popularity_rank != null).slice(0, POPULAR_LIMIT);
  }, [allServices]);

  const popularIds = useMemo(() => new Set(popularList.map((s) => s.id)), [popularList]);

  // Выбранные сервисы, которых нет в топ-листе (кастомные подписки, редкие сервисы из поиска) —
  // их нужно показывать отдельно, иначе они пропадают из вида при возврате в режим браузинга.
  const selectedOutsidePopular = useMemo(
    () => selected.filter((s) => !popularIds.has(s.id)),
    [selected, popularIds]
  );

  // В режиме поиска выбранные закрепляются сверху, остальные — отфильтрованные совпадения.
  const allMatchesForQuery = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allServices.filter((s) => s.name.toLowerCase().startsWith(q));
  }, [query, allServices]);

  const searchMatches = useMemo(
    () => allMatchesForQuery.filter((s) => !selectedIds.has(s.id)),
    [allMatchesForQuery, selectedIds]
  );

  const noMatches = isSearching && allMatchesForQuery.length === 0;

  const toggleSelect = (service) => {
    setSelected((prev) => [...prev, service]);
  };

  const removeSelect = (service) => {
    setSelected((prev) => prev.filter((s) => s.id !== service.id));
  };

  const handleClearQuery = () => setRawQuery('');

  const handleSaveOverride = (serviceId, override) => {
    setOverrides((prev) => ({ ...prev, [serviceId]: override }));
  };

  // Кастомная подписка добавляется в общий список ВЫБРАННЫХ на этом экране,
  // а не сразу в подписки пользователя — иначе модалка выкидывала на главный экран.
  const handleSaveCustom = (subData) => {
    setSelected((prev) => [
      ...prev,
      {
        id: subData.id,
        name: subData.name,
        default_price: subData.price,
        logo_url: null,
        iconName: subData.iconName,
        card_type: subData.card_type ?? 'mir',
        isCustom: true,
      },
    ]);
    setIsCustomModalOpen(false);
  };

  const ServiceCard = ({ service, isSelected, onClick }) => {
    const override = overrides[service.id];
    const displayName = override?.name ?? service.name;
    const displayPrice = override?.price ?? service.default_price;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-colors ${
          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-gray-50'
        }`}
      >
        <button onClick={onClick} className="flex items-center gap-3 flex-1 min-w-0 text-left">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
            {service.logo_url ? (
              <img
                src={service.logo_url}
                alt={displayName}
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <CreditCard size={18} className="text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">{displayName}</div>
            <div className="text-xs text-gray-500">{displayPrice} ₽ / мес</div>
          </div>
        </button>

        {isSelected && (
          <button
            onClick={() => setEditingService(service)}
            className="p-1.5 text-gray-400 hover:text-zinc-900 hover:bg-white rounded-lg transition-colors flex-shrink-0"
            title="Изменить тариф"
          >
            <Pencil size={14} />
          </button>
        )}

        <button onClick={onClick} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
          isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
        }`}>
          {isSelected && <Check size={14} className="text-white" />}
        </button>
      </motion.div>
    );
  };

  return (
    <div className={`px-4 py-6 ${selected.length > 0 ? 'pb-28' : ''}`}>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Добавить подписку</h2>
      <p className="text-sm text-gray-500 mb-4">Найдите сервис в каталоге Accord</p>

      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={rawQuery}
          onChange={(e) => setRawQuery(e.target.value)}
          placeholder="Например, Canva"
          className="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:border-zinc-900 focus:outline-none transition-colors"
        />
        {rawQuery && (
          <button
            onClick={handleClearQuery}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={16} className="text-gray-500" />
          </button>
        )}
      </div>

      {loading && <p className="text-center text-sm text-gray-400 py-8">Загрузка каталога...</p>}

      {!loading && !isSearching && (
        <div className="space-y-2 mb-4">
          {selectedOutsidePopular.length > 0 && (
            <>
              <div className="flex items-center gap-1.5 px-1 mb-1">
                <Check size={14} className="text-blue-500" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Выбрано
                </span>
              </div>
              <AnimatePresence initial={false}>
                {selectedOutsidePopular.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    isSelected
                    onClick={() => removeSelect(service)}
                  />
                ))}
              </AnimatePresence>
            </>
          )}

          <div className="flex items-center gap-1.5 px-1 mb-1">
            <Sparkles size={14} className="text-amber-500" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Популярные сервисы для вас
            </span>
          </div>
          {popularList.map((service) => {
            const isSel = selectedIds.has(service.id);
            return (
              <ServiceCard
                key={service.id}
                service={service}
                isSelected={isSel}
                onClick={() => (isSel ? removeSelect(service) : toggleSelect(service))}
              />
            );
          })}
        </div>
      )}

      {!loading && isSearching && (
        <div className="space-y-2 mb-4">
          <AnimatePresence initial={false}>
            {selected.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                isSelected
                onClick={() => removeSelect(service)}
              />
            ))}
            {searchMatches.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                isSelected={false}
                onClick={() => toggleSelect(service)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && noMatches && (
        <>
          <div className="text-center py-8 text-gray-400 mb-4">
            <PackageSearch size={36} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">Не нашли «{query}» в каталоге</p>
          </div>
          <button
            onClick={() => setIsCustomModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:border-zinc-900 hover:text-zinc-900 transition-colors"
          >
            <Plus size={18} />
            Добавить вручную (нет в каталоге)
          </button>
        </>
      )}

      {selected.length > 0 && (
        <div className="fixed bottom-24 inset-x-0 z-30 px-4 flex justify-end pointer-events-none">
          <div className="w-full max-w-md flex justify-end">
            <button
              onClick={() => {
                const withOverrides = selected.map((s) => ({
                  ...s,
                  name: overrides[s.id]?.name ?? s.name,
                  default_price: overrides[s.id]?.price ?? s.default_price,
                  period: overrides[s.id]?.period ?? '1m',
                  period_custom_months: overrides[s.id]?.customMonths,
                  card_type: overrides[s.id]?.card_type ?? s.card_type ?? 'mir',
                }));
                onConfirmSelection(withOverrides);
              }}
              className="pointer-events-auto w-3/4 py-4 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-full font-semibold hover:from-zinc-800 hover:to-zinc-700 transition-all shadow-2xl"
            >
              Добавить ({selected.length})
            </button>
          </div>
        </div>
      )}

      {editingService && (
        <TariffEditModal
          service={editingService}
          initial={overrides[editingService.id]}
          onSave={(override) => handleSaveOverride(editingService.id, override)}
          onClose={() => setEditingService(null)}
        />
      )}

      <SubscriptionModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSave={handleSaveCustom}
        subscription={null}
      />
    </div>
  );
};

export default SubscriptionSearch;
