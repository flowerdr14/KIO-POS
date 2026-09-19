import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { Tv } from 'lucide-react';
import { openCallScreenPopup } from '../utils/popup';

export const DashboardView: React.FC = () => {
  const {
    orders,
    tables,
    shift,
    setIsAddMenuModalOpen,
    setIsDeleteMenuModalOpen,
    setIsReceiptModalOpen,
    setIsPrinterModalOpen,
    setIsPostPaymentModalOpen,
    setIsCalculatorModalOpen,
    setIsBarcodeModalOpen,
    setIsDailyDiscountModalOpen,
    setIsShiftModalOpen,
    setShiftModalMode,
    setActiveTab,
    setSelectedOrder,
    openReceiptModalWithOrder,
    setSelectedTable,
    setCartTable,
    clearAllOrders,
    clearAllTables,
    showToast,
  } = usePos();

  const [tableFilter, setTableFilter] = useState<'OCCUPIED' | 'ALL'>('OCCUPIED');

  // Get recent 6 orders
  const recentOrders = orders.slice(0, 6);

  // Filter tables based on filter tab
  const displayedTables = tableFilter === 'OCCUPIED' 
    ? tables.filter((t) => t.status !== '빈테이블') 
    : tables;

  const handleOrderClick = (order: (typeof orders)[0]) => {
    setSelectedOrder(order);
    openReceiptModalWithOrder(order);
  };

  const handleTableClick = (table: (typeof tables)[0]) => {
    setSelectedTable(table);
    setCartTable(table);
    setActiveTab('CHECKOUT');
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-80px)]">
      {/* Left Column: Recent Orders & Table Status (col-span-8) */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Box 1: 최근 주문내역 */}
        <div className="border-2 border-[#2b71b8] rounded-none bg-white shadow-sm overflow-hidden flex flex-col">
          {/* Header Title */}
          <div className="bg-[#4d94d8] text-white px-4 py-2 text-xl font-bold border-b-2 border-[#2b71b8] flex justify-between items-center">
            <span>최근 주문내역</span>
            <div className="flex items-center gap-2">
              {orders.length > 0 && (
                <button
                  id="btn-clear-recent-orders"
                  onClick={clearAllOrders}
                  className="text-xs bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded transition-colors font-medium shadow-sm"
                  title="주문 내역 비우기"
                >
                  주문내역 비우기
                </button>
              )}
              <button
                onClick={() => setActiveTab('ORDERS')}
                className="text-xs bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded transition-colors font-medium"
              >
                전체 주문목록 이동 →
              </button>
            </div>
          </div>

          {/* Sub Header (메뉴 | 시간 | 테이블) */}
          <div className="grid grid-cols-12 bg-[#1b5c9c] text-white text-center font-bold text-base py-2 border-b border-[#2b71b8]">
            <div className="col-span-6 border-r border-[#2b71b8]/40">메뉴</div>
            <div className="col-span-3 border-r border-[#2b71b8]/40">시간</div>
            <div className="col-span-3">테이블</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-[#79aadc] min-h-[140px] max-h-[220px] overflow-y-auto">
            {recentOrders.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-medium">최근 주문 내역이 없습니다.</div>
            ) : (
              recentOrders.map((order) => {
                const itemsSummary = order.items.map((i) => `${i.name} ${i.quantity}개`).join(', ');
                return (
                  <div
                    key={order.id}
                    onClick={() => handleOrderClick(order)}
                    className="grid grid-cols-12 text-center text-sm md:text-base py-2.5 px-2 hover:bg-[#eef5fc] cursor-pointer transition-colors items-center"
                    title="클릭 시 영수증 및 주문상세 확인"
                  >
                    <div className="col-span-6 text-left px-3 font-semibold text-slate-800 truncate">
                      <span className="text-xs text-blue-700 mr-2 font-mono">[{order.orderNumber}]</span>
                      {itemsSummary}
                    </div>
                    <div className="col-span-3 text-slate-600 font-medium">{order.orderTime}</div>
                    <div className="col-span-3 font-bold text-[#1b5c9c]">
                      <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                        {order.tableName}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Box 2: 현재 테이블상태 */}
        <div className="border-2 border-[#2b71b8] rounded-none bg-white shadow-sm overflow-hidden flex flex-col flex-1">
          {/* Header Title */}
          <div className="bg-[#4d94d8] text-white px-4 py-2 text-xl font-bold border-b-2 border-[#2b71b8] flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span>현재 테이블상태</span>
              <div className="flex items-center bg-blue-900/30 rounded p-0.5 text-xs font-medium">
                <button
                  id="tab-occupied-tables"
                  onClick={() => setTableFilter('OCCUPIED')}
                  className={`px-2.5 py-0.5 rounded transition-all ${
                    tableFilter === 'OCCUPIED'
                      ? 'bg-white text-[#1b5c9c] font-bold shadow-sm'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  이용중 ({tables.filter((t) => t.status !== '빈테이블').length})
                </button>
                <button
                  id="tab-all-tables"
                  onClick={() => setTableFilter('ALL')}
                  className={`px-2.5 py-0.5 rounded transition-all ${
                    tableFilter === 'ALL'
                      ? 'bg-white text-[#1b5c9c] font-bold shadow-sm'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  전체 ({tables.length})
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {tables.some((t) => t.status !== '빈테이블') && (
                <button
                  id="btn-clear-all-tables"
                  onClick={clearAllTables}
                  className="text-xs bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded transition-colors font-medium shadow-sm"
                  title="모든 테이블 빈 테이블로 비우기"
                >
                  테이블 비우기
                </button>
              )}
              <button
                onClick={() => setActiveTab('HALL')}
                className="text-xs bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded transition-colors font-medium"
              >
                홀 테이블 배치도 이동 →
              </button>
            </div>
          </div>

          {/* Sub Header (테이블 | 상태 | 메모) */}
          <div className="grid grid-cols-12 bg-[#1b5c9c] text-white text-center font-bold text-base py-2 border-b border-[#2b71b8]">
            <div className="col-span-2 border-r border-[#2b71b8]/40">테이블</div>
            <div className="col-span-3 border-r border-[#2b71b8]/40">상태</div>
            <div className="col-span-7">메모</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-[#79aadc] overflow-y-auto max-h-[340px]">
            {displayedTables.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-medium flex flex-col items-center justify-center gap-1.5">
                <span className="text-base font-semibold text-slate-500">현재 이용 중인 테이블이 없습니다.</span>
                <span className="text-xs text-slate-400">(모든 테이블이 빈 테이블로 깨끗하게 비워져 있습니다)</span>
              </div>
            ) : (
              displayedTables.map((t) => {
                let statusBg = 'bg-slate-100 text-slate-600';
                if (t.status === '식사중') statusBg = 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300';
                if (t.status === '예약석') statusBg = 'bg-amber-100 text-amber-800 font-bold border border-amber-300';
                if (t.status === '정리필요') statusBg = 'bg-rose-100 text-rose-800 font-bold border border-rose-300';

                return (
                  <div
                    key={t.id}
                    onClick={() => handleTableClick(t)}
                    className="grid grid-cols-12 text-center text-sm md:text-base py-2.5 px-2 hover:bg-[#eef5fc] cursor-pointer transition-colors items-center"
                    title="클릭하여 해당 테이블 주문/결제 시작"
                  >
                    <div className="col-span-2 font-bold text-[#1b5c9c]">{t.name}</div>
                    <div className="col-span-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs md:text-sm ${statusBg}`}>
                        {t.status}
                      </span>
                    </div>
                    <div className="col-span-7 text-left px-3 text-slate-700 truncate font-medium">
                      {t.memo || <span className="text-slate-300 italic">-</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Right Column: 앞 타임 매출 + Actions Grid (col-span-4) */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        {/* Sales Box: 앞 타임 매출 */}
        <div className="border-2 border-[#2b71b8] bg-white shadow-sm overflow-hidden">
          <div className="bg-[#4d94d8] text-white px-4 py-1.5 text-xl font-bold border-b-2 border-[#2b71b8]">
            앞 타임 매출
          </div>
          <div className="bg-[#1b5c9c] text-white text-center font-bold text-base py-1.5 border-b border-[#2b71b8]">
            매출
          </div>
          <div className="p-5 flex flex-col items-center justify-center min-h-[90px] bg-slate-50/50">
            <div className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight font-mono">
              ₩ {shift.totalSales.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex gap-3">
              <span>카드: {shift.cardSales.toLocaleString()}원</span>
              <span>•</span>
              <span>현금: {shift.cashSales.toLocaleString()}원</span>
            </div>
          </div>
        </div>

        {/* 8 Action Buttons (2-column grid) */}
        <div className="grid grid-cols-2 gap-3">
          {/* 메뉴 추가 */}
          <button
            id="btn-add-menu"
            onClick={() => setIsAddMenuModalOpen(true)}
            className="bg-[#00a854] hover:bg-[#02954b] text-white font-bold text-lg md:text-xl py-3.5 px-3 rounded-none shadow transition-all active:scale-[0.98] flex items-center justify-center"
          >
            메뉴 추가
          </button>

          {/* 메뉴 삭제 */}
          <button
            id="btn-delete-menu"
            onClick={() => setIsDeleteMenuModalOpen(true)}
            className="bg-[#c80000] hover:bg-[#b00000] text-white font-bold text-lg md:text-xl py-3.5 px-3 rounded-none shadow transition-all active:scale-[0.98] flex items-center justify-center"
          >
            메뉴 삭제
          </button>

          {/* 영수증양식 */}
          <button
            id="btn-receipt-template"
            onClick={() => setIsReceiptModalOpen(true)}
            className="bg-[#1d70b8] hover:bg-[#18609e] text-white font-bold text-lg md:text-xl py-3.5 px-3 rounded-none shadow transition-all active:scale-[0.98] flex items-center justify-center"
          >
            영수증양식
          </button>

          {/* 인쇄관리 */}
          <button
            id="btn-print-manage"
            onClick={() => setIsPrinterModalOpen(true)}
            className="bg-[#145388] hover:bg-[#0f4470] text-white font-bold text-lg md:text-xl py-3.5 px-3 rounded-none shadow transition-all active:scale-[0.98] flex items-center justify-center"
          >
            인쇄관리
          </button>

          {/* 후불결제관리 */}
          <button
            id="btn-postpay-manage"
            onClick={() => setIsPostPaymentModalOpen(true)}
            className="bg-[#2377c4] hover:bg-[#1e69ad] text-white font-bold text-lg md:text-xl py-3.5 px-3 rounded-none shadow transition-all active:scale-[0.98] flex items-center justify-center"
          >
            후불결제관리
          </button>

          {/* 계산기 */}
          <button
            id="btn-calculator"
            onClick={() => setIsCalculatorModalOpen(true)}
            className="bg-[#1f6ea9] hover:bg-[#1a5c8e] text-white font-bold text-lg md:text-xl py-3.5 px-3 rounded-none shadow transition-all active:scale-[0.98] flex items-center justify-center"
          >
            계산기
          </button>

          {/* 상품바코드 */}
          <button
            id="btn-product-barcode"
            onClick={() => setIsBarcodeModalOpen(true)}
            className="bg-white hover:bg-blue-50 border-2 border-[#1f6ea9] text-[#1f6ea9] font-bold text-lg md:text-xl py-3.5 px-3 rounded-none shadow-sm transition-all active:scale-[0.98] flex items-center justify-center"
          >
            상품바코드
          </button>

          {/* 오늘의할인 */}
          <button
            id="btn-daily-discount"
            onClick={() => setIsDailyDiscountModalOpen(true)}
            className="bg-white hover:bg-blue-50 border-2 border-[#1f6ea9] text-[#1f6ea9] font-bold text-lg md:text-xl py-3.5 px-3 rounded-none shadow-sm transition-all active:scale-[0.98] flex items-center justify-center"
          >
            오늘의할인
          </button>

          {/* 호출화면 전광판 팝업 */}
          <button
            id="btn-dashboard-call-popup"
            onClick={() => {
              const ok = openCallScreenPopup();
              if (ok) {
                showToast('호출 전광판 팝업창이 열렸습니다. (듀얼 모니터에 배치하세요)');
              } else {
                showToast('팝업 차단이 감지되었습니다. 브라우저 팝업 허용을 확인해주세요.');
              }
            }}
            className="col-span-2 bg-[#0e3b68] hover:bg-[#0a2c4e] text-white font-bold text-lg md:text-xl py-3 px-3 rounded-none shadow transition-all active:scale-[0.98] flex items-center justify-center gap-2 border border-blue-400/30"
            title="실시간 주문/호출 전광판 새 창 팝업으로 열기"
          >
            <Tv size={22} className="text-blue-300" />
            <span>실시간 호출 전광판 (팝업창) ↗</span>
          </button>
        </div>

        {/* Big Shift Buttons */}
        <div className="flex flex-col gap-3 mt-1">
          {/* 영업시작 */}
          <button
            id="btn-shift-start"
            onClick={() => {
              setShiftModalMode('START');
              setIsShiftModalOpen(true);
            }}
            className="w-full bg-[#00a854] hover:bg-[#02954b] text-white font-black text-2xl md:text-3xl py-4 rounded-none shadow-md transition-all active:scale-[0.99] tracking-widest flex items-center justify-center"
          >
            영업시작
          </button>

          {/* 영업종료 */}
          <button
            id="btn-shift-end"
            onClick={() => {
              setShiftModalMode('END');
              setIsShiftModalOpen(true);
            }}
            className="w-full bg-[#c80000] hover:bg-[#b00000] text-white font-black text-2xl md:text-3xl py-4 rounded-none shadow-md transition-all active:scale-[0.99] tracking-widest flex items-center justify-center"
          >
            영업종료
          </button>
        </div>
      </div>
    </div>
  );
};
