import React, { useState, useEffect } from 'react';
import { usePos } from '../context/PosContext';
import { Bell, CheckCircle, Clock } from 'lucide-react';
import { playSuccessChime } from '../utils/audio';
import { getSyncChannel } from '../utils/syncBus';

interface CallScreenViewProps {
  isStandalone?: boolean;
}

export const CallScreenView: React.FC<CallScreenViewProps> = ({ isStandalone = false }) => {
  const { orders, soundEnabled, showToast } = usePos();
  const [callingOrderId, setCallingOrderId] = useState<string | null>(null);
  const [prevReadyIds, setPrevReadyIds] = useState<string[]>(() =>
    orders.filter((o) => o.status === '준비완료').map((o) => o.id)
  );

  // Filter orders by status (all valid orders with id)
  const validOrders = orders.filter((o) => o && o.id);
  const preparingOrders = validOrders.filter((o) => o.status === '준비중' || o.status === '접수');
  const readyOrders = validOrders.filter((o) => o.status === '준비완료');

  // Automatically detect when order status changes to '준비완료'
  useEffect(() => {
    const currentReadyIds = readyOrders.map((o) => o.id);
    const newlyReadyOrders = readyOrders.filter((o) => !prevReadyIds.includes(o.id));

    if (newlyReadyOrders.length > 0) {
      const latest = newlyReadyOrders[newlyReadyOrders.length - 1];
      setCallingOrderId(latest.id);
      if (soundEnabled) {
        playSuccessChime();
      }
      showToast(`🔔 [자동호출] ${latest.tableName} (주문 #${latest.orderNumber}) 준비 완료!`);
      const timer = setTimeout(() => {
        setCallingOrderId(null);
      }, 5000);
      setPrevReadyIds(currentReadyIds);
      return () => clearTimeout(timer);
    } else {
      setPrevReadyIds(currentReadyIds);
    }
  }, [readyOrders, soundEnabled]);

  // Listen to shared cross-window broadcast channel and direct window postMessage for instant status audio alert
  useEffect(() => {
    const handleStatusEvent = (data: any) => {
      if (data?.type === 'ORDER_STATUS_CHANGED') {
        const { orderId, status, tableName, orderNumber } = data;
        if (status === '준비완료') {
          setCallingOrderId(orderId);
          if (soundEnabled) {
            playSuccessChime();
          }
          showToast(`🔔 [자동호출] ${tableName || '고객'}님 (주문 #${orderNumber || ''}) 준비 완료!`);
          setTimeout(() => {
            setCallingOrderId(null);
          }, 5000);
        }
      }
    };

    const bus = getSyncChannel();
    const handleBusMessage = (event: MessageEvent) => {
      handleStatusEvent(event.data);
    };
    bus?.addEventListener('message', handleBusMessage);

    const handleWindowMsg = (event: MessageEvent) => {
      handleStatusEvent(event.data);
    };
    window.addEventListener('message', handleWindowMsg);

    return () => {
      bus?.removeEventListener('message', handleBusMessage);
      window.removeEventListener('message', handleWindowMsg);
    };
  }, [soundEnabled]);

  return (
    <div className={`w-full bg-black ${isStandalone ? 'min-h-screen' : 'min-h-[calc(100vh-75px)]'} text-white flex flex-col select-none font-sans`}>
      {/* Standalone Popup Top Status Bar */}
      {isStandalone && (
        <div className="bg-[#0f172a] border-b border-slate-800 px-6 py-2 flex items-center justify-between text-xs text-slate-300 shadow">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm" />
            <span className="font-bold text-emerald-400 tracking-wide">POS 본체 실시간 연동 중</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 font-medium">고객/주방 호출 전광판 (DID)</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-400">
              준비중: <strong className="text-amber-400 font-black text-sm">{preparingOrders.length}</strong>건
            </span>
            <span className="text-slate-400">
              준비완료: <strong className="text-emerald-400 font-black text-sm">{readyOrders.length}</strong>건
            </span>
          </div>
        </div>
      )}

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
                      <span className={`text-xs px-2.5 py-0.5 rounded font-bold ${
                        order.status === '준비중'
                          ? 'text-amber-400 bg-amber-950/60 border border-amber-800/60 animate-pulse'
                          : 'text-blue-300 bg-blue-950/60 border border-blue-800/60'
                      }`}>
                        {order.status === '준비중' ? '조리중' : '접수완료'}
                      </span>
                      <span className="text-xs text-slate-400">{order.orderTime}</span>
                    </div>
                  </div>

                  {/* Menu Items Breakdown */}
                  <div className="py-3.5 space-y-2">
                    {(order.items || []).length === 0 ? (
                      <div className="text-sm text-slate-300 py-1 font-medium">주문 내역 접수됨</div>
                    ) : (
                      order.items.map((item, idx) => (
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
                      ))
                    )}
                  </div>

                  {/* Status Indicator (Pure Display, No Manual Buttons) */}
                  <div className="pt-2.5 border-t border-white/10 flex items-center text-xs text-amber-300/90">
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} className="text-amber-400" />
                      <span>
                        {order.status === '준비중'
                          ? '주방에서 메뉴를 조리 중입니다'
                          : '주문이 접수되어 조리 대기 중입니다'}
                      </span>
                    </span>
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
                <p className="text-xs text-slate-600">주문관리에서 [준비완료]로 상태를 변경하면 자동으로 이곳에 호출됩니다.</p>
              </div>
            ) : (
              readyOrders.map((order) => {
                const isCalling = callingOrderId === order.id;
                return (
                  <div
                    key={order.id}
                    className={`rounded-lg p-5 shadow-xl flex flex-col justify-between transition-all ${
                      isCalling
                        ? 'bg-emerald-950/90 border-4 border-emerald-400 animate-pulse scale-[1.02]'
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
                        <span
                          className={`text-xs md:text-sm font-black px-3 py-1 rounded flex items-center gap-1.5 ${
                            isCalling
                              ? 'bg-emerald-500 text-slate-950 animate-bounce shadow-lg'
                              : 'text-emerald-400 bg-emerald-950 border border-emerald-500'
                          }`}
                        >
                          <Bell size={14} className={isCalling ? 'animate-spin' : ''} />
                          <span>{isCalling ? '지금 호출중!' : '픽업 대기중'}</span>
                        </span>
                        <span className="text-xs text-slate-400">{order.orderTime}</span>
                      </div>
                    </div>

                    {/* Menu Items Breakdown */}
                    <div className="py-3.5 space-y-2">
                      {(order.items || []).length === 0 ? (
                        <div className="text-sm text-slate-300 py-1 font-medium">주문 내역 접수됨</div>
                      ) : (
                        order.items.map((item, idx) => (
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
                        ))
                      )}
                    </div>

                    {/* Status Indicator (Pure Display, No Manual Buttons) */}
                    <div className="pt-2.5 border-t border-white/10 flex items-center text-xs text-emerald-300/90">
                      <span className="flex items-center gap-1.5 font-bold">
                        <CheckCircle size={15} className="text-emerald-400" />
                        <span>수령대에서 메뉴를 픽업해주세요</span>
                      </span>
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
