import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getBanksByLanguage } from '../../config/banks';
import { LOGO_LIBRARY } from '../../constants/logos';

const BankSelection = ({ onSelectBank, onBack }) => {
  const { t, language } = useLanguage();
  const banks = getBanksByLanguage(language);

  return (
    <div className="p-6 min-h-[500px] flex flex-col">
      <div className="flex items-center mb-8">
        <button
          onClick={onBack}
          className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">
          {t('addFlow.selectBank')}
        </h2>
      </div>
      
      {/* Modern grid layout with 2 columns */}
      <div className="grid grid-cols-2 gap-4">
        {banks.map((bank) => (
          <button
            key={bank.id}
            onClick={() => onSelectBank(bank)}
            className="group relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 rounded-3xl p-8 aspect-square flex flex-col items-center justify-center transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl border border-gray-200/50"
          >
            {/* Logo with soft white container */}
            <div className="mb-4 w-20 h-20 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center p-3 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
              <img
                src={LOGO_LIBRARY[bank.id]}
                alt={bank.name[language]}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/64?text=Logo';
                }}
              />
            </div>
            
            {/* Bank name */}
            <div className="text-sm font-semibold text-gray-900 text-center">
              {bank.name[language]}
            </div>
            
            {/* Subtle gradient overlay on hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity rounded-3xl"
              style={{
                background: bank.gradient,
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default BankSelection;
