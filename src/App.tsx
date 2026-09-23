import React from 'react';
import { PosProvider, usePos } from './context/PosContext';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { OrderManagementView } from './components/OrderManagementView';
import { HallManagementView } from './components/HallManagementView';
import { PosCheckoutView } from './components/PosCheckoutView';
import { MenuManagementView } from './components/MenuManagementView';
import { CallScreenView } from './components/CallScreenView';
import { CustomerKioskView } from './components/CustomerKioskView';

// Modals
import { AddMenuModal } from './components/AddMenuModal';
import { DeleteMenuModal } from './components/DeleteMenuModal';
import { ReceiptModal } from './components/ReceiptModal';
import { PaymentModal } from './components/PaymentModal';
import { PrinterModal } from './components/PrinterModal';
import { PostPaymentModal } from './components/PostPaymentModal';
import { CalculatorModal } from './components/CalculatorModal';
import { BarcodeModal } from './components/BarcodeModal';
import { DailyDiscountModal } from './components/DailyDiscountModal';
import { ShiftModal } from './components/ShiftModal';

const PosMainApp: React.FC = () => {
  const { activeTab, setActiveTab, toastMessage } = usePos();

  const [isStandaloneCallScreen, setIsStandaloneCallScreen] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.location.search.includes('view=call-screen') ||
      window.location.hash === '#call-screen'
    );
  });

  const [isStandaloneKiosk, setIsStandaloneKiosk] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.location.search.includes('view=kiosk') ||
      window.location.hash === '#kiosk'
    );
  });

  React.useEffect(() => {
    const handleHashChange = () => {
      setIsStandaloneCallScreen(
        window.location.search.includes('view=call-screen') ||
        window.location.hash === '#call-screen'
      );
      setIsStandaloneKiosk(
        window.location.search.includes('view=kiosk') ||
        window.location.hash === '#kiosk'
      );
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Standalone Popup Window (Dual-display DID / Kitchen monitor)
  if (isStandaloneCallScreen) {
    return (
      <div className="min-h-screen bg-black text-white">
        <CallScreenView isStandalone={true} />
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#145388] text-white px-5 py-3 rounded shadow-2xl border-2 border-white flex items-center gap-3 animate-bounce">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-sm tracking-wide">{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // Standalone Popup Window (Customer-facing Kiosk)
  if (isStandaloneKiosk) {
    return (
      <div className="min-h-screen bg-white">
        <CustomerKioskView isStandalone={true} />
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#145388] text-white px-5 py-3 rounded shadow-2xl border-2 border-white flex items-center gap-3 animate-bounce">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-sm tracking-wide">{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // In-app Kiosk Mode
  if (activeTab === 'KIOSK') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <CustomerKioskView onExitKiosk={() => setActiveTab('ORDERS')} />
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#145388] text-white px-5 py-3 rounded shadow-2xl border-2 border-white flex items-center gap-3 animate-bounce">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-sm tracking-wide">{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#c8dcf0]/40 text-slate-900 font-sans flex flex-col">
      {/* Top Main Navigation Header */}
      <Header />

      {/* Main View Area (Based on activeTab) */}
      <main className="flex-1 w-full overflow-x-hidden pb-12">
        {activeTab === 'DASHBOARD' && <DashboardView />}
        {activeTab === 'ORDERS' && <OrderManagementView />}
        {activeTab === 'HALL' && <HallManagementView />}
        {activeTab === 'CHECKOUT' && <PosCheckoutView />}
        {activeTab === 'MENUS' && <MenuManagementView />}
      </main>


      {/* Modals for all functions */}
      <AddMenuModal />
      <DeleteMenuModal />
      <PaymentModal />
      <ReceiptModal />
      <PrinterModal />
      <PostPaymentModal />
      <CalculatorModal />
      <BarcodeModal />
      <DailyDiscountModal />
      <ShiftModal />

      {/* Toast Notification Alert Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#145388] text-white px-5 py-3 rounded shadow-2xl border-2 border-white flex items-center gap-3 animate-bounce">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-sm tracking-wide">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <PosProvider>
      <PosMainApp />
    </PosProvider>
  );
}
