import React, { useState, useMemo, useEffect } from 'react';
import SmartCard from './components/SmartCard';
import SubscriptionsPanel from './components/SubscriptionsPanel';
import WidgetGrid from './components/WidgetGrid';
import Header from './components/Header';
import SubscriptionModal from './components/SubscriptionModal';
import ProfileTab from './components/ProfileTab';
import TopUpModal from './components/TopUpModal';
import SubscriptionSearch from './components/SubscriptionSearch';
import OnboardingSetup from './components/OnboardingSetup';
import AuthScreen from './components/AuthScreen';
import CardIssueScreen from './components/CardIssueScreen';
import CardBindingScreen from './components/CardBindingScreen';
import { Home, PieChart, User } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';
import { supabase } from './lib/supabaseClient';

const INITIAL_SUBS = [];


const STORAGE_KEY = 'accord_subscriptions';

function App() {
  const { t, formatCurrency, language } = useLanguage();

  // Очистка демо-данных подписок при каждой загрузке (сессию Supabase не трогаем)
  useEffect(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const [activeTab, setActiveTab] = useState('home');
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [subscriptions, setSubscriptions] = useState(INITIAL_SUBS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [isAddFlowOpen, setIsAddFlowOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [paymentDate, setPaymentDate] = useState(null);
  const [paymentMode, setPaymentMode] = useState(null); // 'unified' | 'individual' | null (не настроено)
  const [isOnboardingSetupOpen, setIsOnboardingSetupOpen] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [hasCards, setHasCards] = useState(null); // null = ещё не проверено
  const [userCards, setUserCards] = useState([]);
  const [bindingQueue, setBindingQueue] = useState([]); // id-шники подписок, ждущих привязки карты

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setHasCards(null);
      return;
    }
    supabase
      .from('cards')
      .select('id, type, card_number, expiry, cvc, balance')
      .eq('user_id', session.user.id)
      .then(({ data }) => {
        setUserCards(data || []);
        setHasCards((data?.length ?? 0) > 0);
      });
  }, [session]);

  // Баланс зачисляет Edge Function bank-webhook (по сигналу от MacroDroid на телефоне админа) —
  // подписка на Realtime, чтобы карта на главном экране обновлялась без перезагрузки страницы.
  useEffect(() => {
    if (!session) return;
    const channel = supabase
      .channel('cards-balance')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'cards', filter: `user_id=eq.${session.user.id}` },
        (payload) => {
          setUserCards((prev) => prev.map((c) => (c.id === payload.new.id ? { ...c, ...payload.new } : c)));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const balances = useMemo(() => ({
    mir: Number(userCards.find((c) => c.type === 'mir')?.balance ?? 0),
    mc: Number(userCards.find((c) => c.type === 'mc')?.balance ?? 0),
  }), [userCards]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
  }, [subscriptions]);

  const NAV_ITEMS = useMemo(() => [
    { id: 'home', icon: Home, label: t('nav.home') },
    { id: 'analytics', icon: PieChart, label: t('nav.analytics') },
    { id: 'profile', icon: User, label: t('nav.profile') },
  ], [t]);

  // Shift+S триггер для демонстрации автодетекта
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.shiftKey && e.key === 'S') {
        // Проверяем, не добавлена ли уже эта подписка
        const yandexExists = subscriptions.some(sub => sub.id === 'yandex_plus');
        if (!yandexExists) {
          alert(t('autoDetect.detected'));
          const newSubscription = {
            id: 'yandex_plus',
            name: 'Яндекс Плюс',
            price: 490,
            active: true,
            iconName: 'music',
          };
          setSubscriptions(prev => [...prev, newSubscription]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [subscriptions, t]);

  const totalCommitments = useMemo(() => {
    return subscriptions
      .filter(sub => sub.active)
      .reduce((sum, sub) => sum + sub.price, 0);
  }, [subscriptions]);

  // Сумма к пополнению считается раздельно: МИР покрывает только подписки внутри страны,
  // Mastercard — только зарубежные. Иначе пользователь видит одну и ту же рекомендованную
  // сумму на обеих картах, хотя по факту с каждой карты списывается своя часть подписок.
  const commitmentsByCard = useMemo(() => {
    const sums = { mir: 0, mc: 0 };
    subscriptions
      .filter(sub => sub.active)
      .forEach(sub => {
        const key = sub.card_type === 'mc' ? 'mc' : 'mir';
        sums[key] += sub.price;
      });
    return sums;
  }, [subscriptions]);

  const shortfall = useMemo(() => {
    return Math.max(0, totalCommitments - (balances.mir + balances.mc));
  }, [totalCommitments, balances]);

  const toggleSubscription = (id) => {
    setSubscriptions(prevSubs => {
      return prevSubs.map(sub => {
        if (sub.id === id) {
          return { ...sub, active: !sub.active };
        }
        return sub;
      });
    });
  };

  const handleAddClick = () => {
    setIsSearchModalOpen(true);
  };

  const handleConfirmSelection = (selectedServices) => {
    const isFirstSubscription = subscriptions.length === 0;
    setSubscriptions(prev => [
      ...prev,
      ...selectedServices.map(service => ({
        id: service.id,
        registry_service_id: service.isCustom ? null : service.id,
        name: service.name,
        price: service.default_price,
        logo_url: service.logo_url,
        card_type: service.card_type === 'mc' ? 'mc' : 'mir',
        active: true,
        binding_status: 'pending_user_confirm',
      })),
    ]);
    setIsSearchModalOpen(false);
    setBindingQueue(prev => [...prev, ...selectedServices.map(s => s.id)]);

    if (isFirstSubscription && !hasCompletedOnboarding) {
      setIsOnboardingSetupOpen(true);
    }
  };

  const bindingSub = subscriptions.find(s => s.id === bindingQueue[0]) ?? null;

  const handleOpenBinding = (sub) => {
    setBindingQueue([sub.id]);
  };

  const handleConfirmBinding = () => {
    setSubscriptions(prev =>
      prev.map(s => (s.id === bindingQueue[0] ? { ...s, binding_status: 'user_confirmed' } : s))
    );
    setBindingQueue(prev => prev.slice(1));
  };

  const handleCloseBinding = () => {
    setBindingQueue([]);
  };

  const handleEditClick = (sub) => {
    setEditingSub(sub);
    setModalOpen(true);
  };

  const handleSaveSubscription = (subData) => {
    if (editingSub) {
      setSubscriptions(prev =>
        prev.map(sub => sub.id === editingSub.id ? subData : sub)
      );
    } else {
      setSubscriptions(prev => [...prev, subData]);
    }
  };

  const handleDeleteSubscription = (id) => {
    setSubscriptions(prev => prev.filter(sub => sub.id !== id));
  };

  const handleFlowComplete = (newSubscriptions) => {
    const isFirstSubscription = subscriptions.length === 0;
    setSubscriptions(prev => [...prev, ...newSubscriptions]);
    setIsAddFlowOpen(false);
    
    // Если это первая подписка и onboarding не завершен, открыть setup
    if (isFirstSubscription && !hasCompletedOnboarding) {
      setIsOnboardingSetupOpen(true);
    }
  };

  const handleOnboardingComplete = ({ mode, paymentDate: day, autoPayment }) => {
    setPaymentMode(mode);
    setPaymentDate(mode === 'unified' ? day : null);
    setHasCompletedOnboarding(true);
    localStorage.setItem('accord_onboarding_completed', JSON.stringify(true));
    setIsOnboardingSetupOpen(false);

    // Опционально: если выбрано автопополнение, можно сохранить эту настройку
    if (autoPayment) {
      localStorage.setItem('accord_auto_payment', JSON.stringify(true));
    }
  };

  const handleTopUp = () => {
    setIsTopUpModalOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900 antialiased">
        <div className="max-w-md mx-auto">
          <AuthScreen onAuthenticated={setSession} />
        </div>
      </div>
    );
  }

  if (hasCards === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!hasCards) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900 antialiased">
        <div className="max-w-md mx-auto">
          <CardIssueScreen
            userId={session.user.id}
            onComplete={() => {
              supabase
                .from('cards')
                .select('id, type, card_number, expiry, cvc')
                .eq('user_id', session.user.id)
                .then(({ data }) => {
                  setUserCards(data || []);
                  setHasCards((data?.length ?? 0) > 0);
                });
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans text-gray-900 antialiased">
      <div className="max-w-md mx-auto">
        <Header />
        
        {activeTab === 'home' && (
          <>
            {subscriptions.length === 0 ? (
              <SubscriptionSearch onConfirmSelection={handleConfirmSelection} />
            ) : (
              <>
                <SmartCard balances={balances} cards={userCards} />

                {/* Compact Payment Info & Top Up Panel */}
                <div className="px-4 pb-4">
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                    {/* Payment Date Info */}
                    {paymentMode === 'unified' && paymentDate !== null && (
                      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">{paymentDate}</span>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">{t('card.toCharge')}</div>
                            <div className="text-sm font-semibold text-gray-900">
                              {(() => {
                                const today = new Date();
                                const currentDay = today.getDate();
                                const targetMonth = paymentDate < currentDay ? today.getMonth() + 1 : today.getMonth();
                                return new Date(today.getFullYear(), targetMonth).toLocaleString(language === 'ru' ? 'ru' : 'en', { month: 'long' });
                              })()} • {formatCurrency(totalCommitments)}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setIsOnboardingSetupOpen(true)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {t('card.selectPaymentDate')}
                        </button>
                      </div>
                    )}

                    {paymentMode === 'individual' && (
                      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                        <p className="text-xs text-gray-500">{t('onboarding.individualTitle')}</p>
                        <button
                          onClick={() => setIsOnboardingSetupOpen(true)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {t('card.selectPaymentDate')}
                        </button>
                      </div>
                    )}

                    {/* Top Up Button */}
                    <button
                      onClick={handleTopUp}
                      className="w-full py-3 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-xl font-semibold hover:from-zinc-800 hover:to-zinc-700 transition-all shadow-md hover:shadow-lg"
                    >
                      {t('card.topUp')}
                    </button>
                  </div>
                </div>

                <SubscriptionsPanel
                  subscriptions={subscriptions}
                  onToggle={toggleSubscription}
                  onEdit={handleEditClick}
                  onAdd={handleAddClick}
                  onBind={handleOpenBinding}
                />
                {/* WidgetGrid скрыт */}
              </>
            )}
          </>
        )}

        {activeTab === 'analytics' && (
          <div className="px-4 py-8 text-center">
            <PieChart className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">{t('nav.analytics')}</p>
          </div>
        )}

        {activeTab === 'profile' && <ProfileTab />}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200 px-6 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto flex justify-around items-center">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 transition-all duration-200 ${
                  isActive ? 'scale-110' : 'opacity-60 hover:opacity-100'
                }`}
                aria-label={item.label}
              >
                <div className={`p-2 rounded-full transition-colors ${
                  isActive
                    ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/30'
                    : 'text-gray-500 hover:text-zinc-700'
                }`}>
                  <Icon size={22} />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-zinc-900' : 'text-gray-500'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <SubscriptionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveSubscription}
        onDelete={handleDeleteSubscription}
        subscription={editingSub}
      />

      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSearchModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <SubscriptionSearch onConfirmSelection={handleConfirmSelection} />
          </div>
        </div>
      )}

      <TopUpModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        userId={session.user.id}
        recommendedAmounts={commitmentsByCard}
        cards={userCards}
      />

      <OnboardingSetup
        isOpen={isOnboardingSetupOpen}
        onClose={() => setIsOnboardingSetupOpen(false)}
        onComplete={handleOnboardingComplete}
        totalAmount={totalCommitments}
        initialMode={paymentMode ?? 'unified'}
        initialDay={paymentDate ?? 15}
      />

      {bindingSub && (
        <CardBindingScreen
          subscription={bindingSub}
          cards={userCards}
          hasMore={bindingQueue.length > 1}
          onConfirm={handleConfirmBinding}
          onClose={handleCloseBinding}
        />
      )}
    </div>
  );
}

export default App;
