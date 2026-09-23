import React from 'react';
import { usePos, MainTab } from '../context/PosContext';
import { Volume2, VolumeX, Store, Clock, Tv, Monitor } from 'lucide-react';
import { openCallScreenPopup, openKioskPopup } from '../utils/popup';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, shift, soundEnabled, setSoundEnabled, showToast } = usePos();

  const navItems: { id: MainTab; label: string }[] = [
    { id: 'ORDERS', label: '주문관리' },
    { id: 'HALL', label: '홀 관리' },
    { id: 'CHECKOUT', label: '주문계산' },
    { id: 'MENUS', label: '메뉴관리' },
  ];

  const handleOpenCallPopup = () => {
    const success = openCallScreenPopup();
    if (success) {
      showToast('호출 전광판 팝업창이 열렸습니다. (듀얼 모니터에 배치하세요)');
    } else {
      showToast('팝업 차단이 감지되었습니다. 브라우저 팝업 허용을 확인해주세요.');
    }
  };

  const handleOpenKioskPopup = () => {
    const success = openKioskPopup();
    if (success) {
      showToast('고객용 키오스크 팝업창이 열렸습니다. (키오스크/고객 모니터에 배치하세요)');
    } else {
      showToast('팝업 차단이 감지되었습니다. 브라우저 팝업 허용을 확인해주세요.');
    }
  };

  return (
    <header className="bg-[#8fb5de] border-b-2 border-[#6092c4] px-6 py-2.5 flex items-center justify-between shadow-sm select-none">
      {/* Brand / Logo */}
      <div className="flex items-center gap-4">
        <button
          id="btn-nav-dashboard"
          onClick={() => setActiveTab('DASHBOARD')}
          className="group text-left focus:outline-none transition-transform active:scale-95"
          title="메인 대시보드로 이동"
        >
          <div className="flex flex-col leading-none">
            <span
              className="text-3xl font-black tracking-wider text-[#1e3a8a] drop-shadow-[2px_2px_0px_#ffffff]"
              style={{ fontFamily: "'Fredoka', cursive, sans-serif" }}
            >
              Kio -
            </span>
            <span
              className="text-2xl font-black tracking-widest text-[#1e3a8a] pl-6 -mt-1 drop-shadow-[2px_2px_0px_#ffffff]"
              style={{ fontFamily: "'Fredoka', cursive, sans-serif" }}
            >
              POS
            </span>
          </div>
        </button>

        {/* Dashboard quick pill */}
        <button
          onClick={() => setActiveTab('DASHBOARD')}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
            activeTab === 'DASHBOARD'
              ? 'bg-[#1e40af] text-white shadow-inner'
              : 'bg-[#a3c4e8] text-[#1e3a8a] hover:bg-[#b5d2f3]'
          }`}
        >
          대시보드 홈
        </button>
      </div>

      {/* Center Nav Tabs */}
      <nav className="flex items-center space-x-6 md:space-x-10">
        {navItems.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id.toLowerCase()}`}
              onClick={() => setActiveTab(tab.id)}
              className={`text-xl md:text-2xl font-bold px-6 py-2 rounded-md transition-all ${
                isActive
                  ? 'bg-[#2977ca] text-white shadow-md border-b-4 border-[#1c5594] scale-105'
                  : 'text-[#183968] hover:bg-[#9cc1e7] hover:text-[#0f2952]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Right Branch & Status info */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Customer Kiosk Buttons */}
        <div className="flex items-center rounded-lg overflow-hidden border border-white/40 shadow">
          <button
            id="btn-nav-kiosk-view"
            onClick={() => setActiveTab('KIOSK')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs md:text-sm font-bold transition-all ${
              activeTab === 'KIOSK'
                ? 'bg-[#153e75] text-white shadow-inner'
                : 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white'
            }`}
            title="고객용 키오스크 화면으로 전환 (화면 내 직접 테스트)"
          >
            <Monitor size={15} />
            <span>키오스크</span>
          </button>
          <button
            id="btn-open-kiosk-popup"
            onClick={handleOpenKioskPopup}
            className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white/90 hover:text-white px-2 py-1.5 text-xs font-bold border-l border-white/20"
            title="고객용 키오스크 새 창/팝업으로 열기 (듀얼 모니터용)"
          >
            팝업 ↗
          </button>
        </div>

        {/* Real Popup Trigger for Call Screen DID */}
        <button
          id="btn-open-call-screen-popup"
          onClick={handleOpenCallPopup}
          className="flex items-center gap-1.5 bg-[#1e40af] hover:bg-[#1c368c] text-white px-3 py-1.5 rounded text-xs md:text-sm font-bold shadow transition-all active:scale-95 border border-white/30"
          title="호출 전광판 팝업창 열기 (새 창 / 듀얼 모니터용)"
        >
          <Tv size={16} />
          <span>호출 팝업 ↗</span>
        </button>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-1.5 text-[#1e3a8a] hover:bg-[#a0c5ea] rounded-full transition-colors"
          title={soundEnabled ? '효과음 켜짐' : '효과음 음소거'}
        >
          {soundEnabled ? <Volume2 size={19} /> : <VolumeX size={19} className="opacity-60" />}
        </button>

        <div className="text-right">
          <div className="text-sm font-extrabold text-[#194074] flex items-center justify-end gap-1.5">
            <span>스타로벅스 입양2호점</span>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                shift.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
              title={shift.isOpen ? '영업중' : '영업종료/마감'}
            />
          </div>
          <div className="text-[11px] font-semibold text-[#285794] flex items-center justify-end gap-1">
            <span>(STAROBUX ADOPT2)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/60 font-medium">
              {shift.isOpen ? '영업중' : '마감'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
