import React from 'react';
import { Card } from './ui/Card';
import { User, Bell, Shield, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ProfileTab = () => {
  const { t } = useLanguage();

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Profile Header */}
      <div className="text-center py-4">
        <div className="w-20 h-20 bg-gradient-to-br from-zinc-900 to-zinc-700 rounded-full mx-auto mb-4 flex items-center justify-center">
          <User className="text-white" size={40} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Accord</h2>
        <p className="text-sm text-gray-500 mt-1">{t('profile.title')}</p>
      </div>

      {/* Other Settings */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 px-2">
          {t('profile.settings')}
        </h3>
        <div className="space-y-3">
          <Card className="p-4 hover:shadow-lg hover:border-zinc-200 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center">
                <User className="text-zinc-700" size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900">
                  {t('profile.account')}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-lg hover:border-zinc-200 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center">
                <Bell className="text-zinc-700" size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900">
                  {t('profile.notifications')}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-lg hover:border-zinc-200 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center">
                <Shield className="text-zinc-700" size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900">
                  {t('profile.security')}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-lg hover:border-zinc-200 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center">
                <Info className="text-zinc-700" size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900">
                  {t('profile.about')}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
