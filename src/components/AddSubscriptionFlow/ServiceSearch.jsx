import React, { useState } from 'react';
import { ChevronLeft, Search } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getPopularServices } from '../../config/mockServices';
import { LOGO_LIBRARY } from '../../constants/logos';

const ServiceSearch = ({ onSelectService, onBack }) => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const services = getPopularServices(language);

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">
          {t('addFlow.searchService')}
        </h2>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('addFlow.searchService')}
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-zinc-900 focus:outline-none transition-colors"
        />
      </div>

      {/* Popular Services */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          {t('addFlow.popularServices')}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
        {filteredServices.map((service) => (
          <button
            key={service.id}
            onClick={() => onSelectService(service)}
            className="group p-4 rounded-xl bg-gray-50 hover:bg-zinc-900 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center p-2 transition-all group-hover:scale-110">
                <img
                  src={LOGO_LIBRARY[service.logoId]}
                  alt={service.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/48?text=' + service.name.charAt(0);
                  }}
                />
              </div>
              <div className="text-sm font-semibold text-center">
                {service.name}
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Search size={48} className="mx-auto mb-4 opacity-50" />
          <p>{t('addFlow.serviceNotFound')}</p>
        </div>
      )}
    </div>
  );
};

export default ServiceSearch;
