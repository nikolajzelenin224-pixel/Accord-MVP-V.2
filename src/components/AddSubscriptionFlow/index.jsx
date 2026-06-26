import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { generateMockSubscriptions } from '../../config/mockServices';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import MethodSelection from './MethodSelection';
import BankSelection from './BankSelection';
import BankSync from './BankSync';
import BankResults from './BankResults';
import ServiceSearch from './ServiceSearch';
import VCardIssue from './VCardIssue';

// Flow steps enum
const STEPS = {
  METHOD_SELECTION: 'method_selection',
  BANK_SELECTION: 'bank_selection',
  BANK_SYNC: 'bank_sync',
  BANK_RESULTS: 'bank_results',
  SERVICE_SEARCH: 'service_search',
  VCARD_ISSUE: 'vcard_issue',
};

const AddSubscriptionFlow = ({ isOpen, onClose, onComplete }) => {
  const { t, language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(STEPS.METHOD_SELECTION);
  const [selectedPath, setSelectedPath] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null);
  const [foundSubscriptions, setFoundSubscriptions] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  // Lock body scroll when modal is open
  useBodyScrollLock(isOpen);

  // Reset state when modal closes
  const handleClose = () => {
    setCurrentStep(STEPS.METHOD_SELECTION);
    setSelectedPath(null);
    setSelectedBank(null);
    setFoundSubscriptions([]);
    setSelectedService(null);
    onClose();
  };

  // Step 1: Method Selection
  const handleMethodSelect = (method) => {
    setSelectedPath(method);
    if (method === 'auto') {
      setCurrentStep(STEPS.BANK_SELECTION);
    } else {
      setCurrentStep(STEPS.SERVICE_SEARCH);
    }
  };

  // Step 2A: Bank Selection
  const handleBankSelect = (bank) => {
    setSelectedBank(bank);
    setCurrentStep(STEPS.BANK_SYNC);
  };

  // Step 2A: Bank Sync Complete
  const handleSyncComplete = () => {
    const mockSubs = generateMockSubscriptions(selectedBank.id, language);
    setFoundSubscriptions(mockSubs);
    setCurrentStep(STEPS.BANK_RESULTS);
  };

  // Step 2A: Confirm subscriptions from bank
  const handleBankResultsConfirm = (subscriptions) => {
    onComplete(subscriptions);
    handleClose();
  };

  // Step 2B: Service Selection
  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setCurrentStep(STEPS.VCARD_ISSUE);
  };

  // Step 2B: Confirm virtual card
  const handleVCardConfirm = (subscription) => {
    onComplete([subscription]);
    handleClose();
  };

  // Navigation handlers
  const handleBackFromBankSelection = () => {
    setCurrentStep(STEPS.METHOD_SELECTION);
    setSelectedPath(null);
  };

  const handleBackFromBankResults = () => {
    setCurrentStep(STEPS.BANK_SELECTION);
    setFoundSubscriptions([]);
  };

  const handleBackFromServiceSearch = () => {
    setCurrentStep(STEPS.METHOD_SELECTION);
    setSelectedPath(null);
  };

  const handleBackFromVCard = () => {
    setCurrentStep(STEPS.SERVICE_SEARCH);
    setSelectedService(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label={t('addFlow.close')}
        >
          <X size={24} />
        </button>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          <div key={currentStep} className="animate-fadeIn">
            {currentStep === STEPS.METHOD_SELECTION && (
              <MethodSelection onSelectMethod={handleMethodSelect} />
            )}

            {currentStep === STEPS.BANK_SELECTION && (
              <BankSelection
                onSelectBank={handleBankSelect}
                onBack={handleBackFromBankSelection}
              />
            )}

            {currentStep === STEPS.BANK_SYNC && (
              <BankSync
                bank={selectedBank}
                onComplete={handleSyncComplete}
              />
            )}

            {currentStep === STEPS.BANK_RESULTS && (
              <BankResults
                subscriptions={foundSubscriptions}
                onConfirm={handleBankResultsConfirm}
                onBack={handleBackFromBankResults}
              />
            )}

            {currentStep === STEPS.SERVICE_SEARCH && (
              <ServiceSearch
                onSelectService={handleServiceSelect}
                onBack={handleBackFromServiceSearch}
              />
            )}

            {currentStep === STEPS.VCARD_ISSUE && (
              <VCardIssue
                service={selectedService}
                onConfirm={handleVCardConfirm}
                onBack={handleBackFromVCard}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSubscriptionFlow;
