import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { Volume2, VolumeX, Maximize2, Minimize2, Bell, CheckCircle, Clock, PlusCircle, X } from 'lucide-react';
import { playSuccessChime, playPosBeep } from '../utils/audio';

interface CallScreenViewProps {
  isStandalone?: boolean;
}

export const CallScreenView: React.FC<CallScreenViewProps> = ({ isStandalone = false }) => {
  const { orders, updateOrderStatus, soundEnabled, setSoundEnabled, showToast, addToCart, menuItems, completePayment, tables } = usePos();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callingOrderId, setCallingOrderId] = useState<string | null>(null);

  // Filter orders by status
  const preparingOrders = orders.filter((o) => o.status === '준비중' || o.status === '접수');
  const readyOrders = orders.filter((o) => o.status === '준비완료');

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleCallOrder = (orderId: string, tableName: string) => {
    if (soundEnabled) {
      playSuccessChime();
    }
    setCallingOrderId(orderId);
    showToast(`딩동! ${tableName} 고객님, 주문하신 메뉴가 준비되었습니다.`);
    setTimeout(() => {
      setCallingOrderId(null);
    }, 4000);
  };

  const handleMarkReady = (orderId: string, tableName: string) => {
    updateOrderStatus(orderId, '준비완료');
    handleCallOrder(orderId, tableName);
  };

  const handleMarkServed = (orderId: string, tableName: string) => {
    if (soundEnabled) playPosBeep();
    updateOrderStatus(orderId, '제공완료');
    showToast(`${tableName} 메뉴 수령/서빙이 완료되었습니다.`);
  };

  // Quick helper to seed a sample order if screen is empty
  const handleCreateSampleOrder = () => {
    if (menuItems.length === 0) return;
    const randomTable = tables[Math.floor(Math.random() * tables.length)]?.name || '1F-1T';
    const sampleMenu1 = menuItems[0];
    const sampleMenu2 = menuItems[Math.min(1, menuItems.length - 1)];

    addToCart(sampleMenu1);
    if (sampleMenu2 && sampleMenu2.id !== sampleMenu1.id) {
      addToCart(sampleMenu2);
    }
    setTimeout(() => {
      completePayment('신용카드', 0);
      showToast(`${randomTable} 테스트 호출 주문이 접수되었습니다.`);
    }, 100);
  };

  return (
    <div className={`w-full bg-black ${isStandalone ? 'min-h-screen' : 'min-h-[calc(100vh-75px)]'} text-white flex flex-col select-none font-sans`}>
      {/* Top Utility Bar */}
      <div className="bg-[#111] border-b border-[#222] px-4 md:px-6 py-2.5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-white font-bold text-sm tracking-wider">
              실시간 주방 & 고객 호출 전광판 (DID)
            </span>
            {isStandalone && (
              <span className="text-[10px] bg-blue-900/60 text-blue-300 border border-blue-700/60 px-2 py-0.5 rounded font-medium">
                단독 팝업창
              </span>
            )}
          </div>
          <span className="bg-[#222] text-slate-300 px-2.5 py-0.5 rounded text-xs">
            준비중: <strong className="text-amber-400">{preparingOrders.length}</strong>건 | 준비완료:{' '}
            <strong className="text-emerald-400">{readyOrders.length}</strong>건
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={handleCreateSampleOrder}
            className="flex items-center gap-1.5 bg-[#222] hover:bg-[#333] text-blue-400 hover:text-blue-300 px-2.5 py-1 rounded transition-colors text-xs"
            title="테스트용 주문 생성"
          >
            <PlusCircle size={14} />
            <span>샘플 주문 접수</span>
          </button>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 hover:bg-[#222] rounded transition-colors text-slate-300"
            title={soundEnabled ? '호출 벨음 켜짐' : '호출 벨음 꺼짐'}
          >
            {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} className="opacity-50" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1 bg-[#222] hover:bg-[#333] text-slate-200 px-2.5 py-1 rounded transition-colors text-xs"
            title="전체화면 전환"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            <span>전체화면</span>
          </button>
          {isStandalone && (
            <button
              onClick={() => window.close()}
              className="flex items-center gap-1 bg-rose-900/80 hover:bg-rose-800 text-rose-200 px-2.5 py-1 rounded transition-colors text-xs border border-rose-700/60 font-bold"
              title="팝업창 닫기"
            >
              <X size={14} />
              <span>창 닫기</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Split Screen (Matches user reference image with central divider) */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/90">
        {/* Left Half: 준비중 */}
        <div className="flex flex-col p-6 md:p-10">
          {/* Big Header */}
          <div className="text-center pb-6 border-b border-white/20 mb-6">
            <h1 className="text-4xl md:text-5xl font-black tracking-widest text-white drop-shadow-md">
              준비중
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-1">맛있게 조리 중입니다. 잠시만 기다려주세요.</p>
          </div>

          {/* Table list in Preparation */}
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[calc(100vh-250px)] pr-2">
            {preparingOrders.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-500 gap-2">
                <Clock size={36} className="opacity-40" />
                <p className="text-lg font-medium">현재 준비 중인 주문이 없습니다.</p>
                <p className="text-xs text-slate-600">주문계산에서 새 주문을 접수하면 자동으로 표시됩니다.</p>
              </div>
            ) : (
              preparingOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-[#141414] border-2 border-white/30 rounded-lg p-5 shadow-lg flex flex-col justify-between hover:border-amber-400/80 transition-all"
                >
                  {/* Card Header: Table Badge & Time */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/15">
                    <div className="flex items-center gap-3">
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-lg md:text-xl font-black px-3.5 py-1 rounded">
                        {order.tableName}
                      </span>
                      <span className="text-slate-300 font-mono text-xs">
                        주문번호 #{order.orderNumber || order.id.slice(-4)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-0.5 rounded font-bold animate-pulse">
                        조리중
                      </span>
                      <span className="text-xs text-slate-400">{order.orderTime}</span>
                    </div>
                  </div>

                  {/* Menu Items Breakdown */}
                  <div className="py-3.5 space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm md:text-base">
                        <div className="flex items-center gap-2 text-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span className="font-bold">{item.name}</span>
                          {item.remark && (
                            <span className="text-[11px] bg-blue-600/30 text-blue-300 border border-blue-500/40 px-1.5 py-0.2 rounded font-medium">
                              {item.remark}
                            </span>
                          )}
                          {item.selectedOptions && item.selectedOptions.length > 0 && (
                            <span className="text-xs text-slate-400 font-normal">
                              ({item.selectedOptions.join(', ')})
                            </span>
                          )}
                        </div>
                        <span className="font-mono font-black text-amber-400 text-lg">
                          x {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Action: Mark Ready & Call */}
                  <div className="pt-3 border-t border-white/10 flex justify-end">
                    <button
                      onClick={() => handleMarkReady(order.id, order.tableName)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm md:text-base px-5 py-2 rounded shadow flex items-center gap-2 transition-all active:scale-95 border border-emerald-400"
                    >
                      <Bell size={18} />
                      <span>준비완료 호출 →</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Half: 준비완료 */}
        <div className="flex flex-col p-6 md:p-10">
          {/* Big Header */}
          <div className="text-center pb-6 border-b border-white/20 mb-6">
            <h1 className="text-4xl md:text-5xl font-black tracking-widest text-white drop-shadow-md">
              준비완료
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-1">주문하신 메뉴가 준비되었습니다. 수령대에서 픽업해주세요.</p>
          </div>

          {/* Table list Ready */}
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[calc(100vh-250px)] pr-2">
            {readyOrders.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-500 gap-2">
                <CheckCircle size={36} className="opacity-40" />
                <p className="text-lg font-medium">현재 호출 대기 중인 주문이 없습니다.</p>
                <p className="text-xs text-slate-600">준비가 완료된 메뉴를 호출하면 이곳에 표시됩니다.</p>
              </div>
            ) : (
              readyOrders.map((order) => {
                const isCalling = callingOrderId === order.id;
                return (
                  <div
                    key={order.id}
                    className={`rounded-lg p-5 shadow-xl flex flex-col justify-between transition-all ${
                      isCalling
                        ? 'bg-emerald-950/80 border-4 border-emerald-400 animate-pulse scale-[1.02]'
                        : 'bg-[#141414] border-2 border-emerald-500/60 hover:border-emerald-400'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/15">
                      <div className="flex items-center gap-3">
                        <span className="bg-emerald-500 text-slate-950 text-xl md:text-2xl font-black px-4 py-1.5 rounded shadow">
                          {order.tableName}
                        </span>
                        <span className="text-slate-300 font-mono text-xs">
                          주문번호 #{order.orderNumber || order.id.slice(-4)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs md:text-sm font-black text-emerald-400 bg-emerald-950 border border-emerald-500 px-3 py-1 rounded flex items-center gap-1.5">
                          <Bell size={14} className="animate-bounce" />
                          <span>픽업 호출중</span>
                        </span>
                        <span className="text-xs text-slate-400">{order.orderTime}</span>
                      </div>
                    </div>

                    {/* Menu Items Breakdown */}
                    <div className="py-3.5 space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm md:text-base">
                          <div className="flex items-center gap-2 text-white">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="font-bold text-base md:text-lg">{item.name}</span>
                            {item.remark && (
                              <span className="text-xs bg-blue-500/30 text-blue-300 border border-blue-400/50 px-2 py-0.5 rounded font-bold">
                                {item.remark}
                              </span>
                            )}
                            {item.selectedOptions && item.selectedOptions.length > 0 && (
                              <span className="text-xs text-slate-300 font-normal">
                                ({item.selectedOptions.join(', ')})
                              </span>
                            )}
                          </div>
                          <span className="font-mono font-black text-emerald-300 text-xl">
                            x {item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons: Ding-dong re-call & Complete Pickup */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                      <button
                        onClick={() => handleCallOrder(order.id, order.tableName)}
                        className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs md:text-sm px-4 py-2 rounded flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <Bell size={16} />
                        <span>재호출 (딩동🔔)</span>
                      </button>

                      <button
                        onClick={() => handleMarkServed(order.id, order.tableName)}
                        className="bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs md:text-sm px-5 py-2 rounded flex items-center gap-1.5 transition-all active:scale-95 border border-slate-500"
                      >
                        <CheckCircle size={16} />
                        <span>수령/서빙 완료</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
