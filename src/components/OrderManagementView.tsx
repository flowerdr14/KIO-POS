import React, { useState, useEffect } from 'react';
import { usePos } from '../context/PosContext';
import { Order, OrderStatus } from '../types';
import { Search, Printer, Edit, MessageSquare, XCircle, CheckCircle, StickyNote, Bell } from 'lucide-react';

export const OrderManagementView: React.FC = () => {
  const {
    orders,
    reservations,
    updateOrderStatus,
    cancelOrder,
    updateOrderMemo,
    updateOrderSpecialRequests,
    openReceiptModalWithOrder,
    setActiveTab,
    setCartTable,
    tables,
    clearAllOrders,
    showToast
  } = usePos();

  const [subTab, setSubTab] = useState<'현황' | '예약' | '메모' | '검색'>('현황');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | '전체'>('전체');
  
  // Selected order
  const currentList = subTab === '현황' ? orders : reservations;
  const [selectedId, setSelectedId] = useState<string>(currentList[0]?.id || '');
  
  const selectedOrder = currentList.find(o => o.id === selectedId) || currentList[0] || null;

  // Modals for editing within order management
  const [isEditReqOpen, setIsEditReqOpen] = useState(false);
  const [reqText, setReqText] = useState('');
  const [isMemoOpen, setIsMemoOpen] = useState(false);
  const [memoText, setMemoText] = useState('');
  
  // Kitchen/Store Notes state for '메모' subtab
  const [storeNotes, setStoreNotes] = useState<string[]>(() => {
    const saved = localStorage.getItem('kio_pos_store_notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [newNoteInput, setNewNoteInput] = useState('');

  useEffect(() => {
    localStorage.setItem('kio_pos_store_notes', JSON.stringify(storeNotes));
  }, [storeNotes]);

  // Filtered orders
  const filteredList = currentList.filter(o => {
    const matchesSearch = 
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.items.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === '전체' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenReceipt = () => {
    if (selectedOrder) {
      openReceiptModalWithOrder(selectedOrder);
    }
  };

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (selectedOrder) {
      updateOrderStatus(selectedOrder.id, newStatus);
      // If a status filter is active and doesn't match the new status,
      // reset filter to '전체' so the order doesn't unexpectedly disappear from the user's view
      if (statusFilter !== '전체' && statusFilter !== newStatus) {
        setStatusFilter('전체');
      }
      setSelectedId(selectedOrder.id);
    }
  };

  const handleCancelOrder = () => {
    if (!selectedOrder) return;
    if (window.confirm(`주문번호 [${selectedOrder.orderNumber}]을 정말 취소하시겠습니까?`)) {
      cancelOrder(selectedOrder.id);
    }
  };

  const handleCheckoutProcess = () => {
    if (!selectedOrder) return;
    if (selectedOrder.paymentStatus === '결제완료') {
      showToast('이미 결제가 완료된 주문입니다.');
      return;
    }
    // Set table and proceed to checkout
    const table = tables.find(t => t.id === selectedOrder.tableId);
    if (table) setCartTable(table);
    setActiveTab('CHECKOUT');
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 flex flex-col gap-4 min-h-[calc(100vh-80px)] select-none">
      {/* Sub Navigation Bar */}
      <div className="flex items-center justify-between border-b-2 border-[#6ba0d6] pb-3">
        <div className="w-32 hidden sm:block"></div>
        <div className="flex items-center space-x-1 sm:space-x-3 bg-white/70 p-1 rounded-lg border border-[#8cb2dc] shadow-sm">
          <button
            onClick={() => { setSubTab('현황'); setSelectedId(orders[0]?.id || ''); }}
            className={`px-6 py-2 rounded-md font-bold text-lg transition-all ${
              subTab === '현황'
                ? 'bg-[#6ba0d6] text-white shadow-sm'
                : 'text-[#1e3a8a] hover:bg-[#e4effa]'
            }`}
          >
            주문현황
          </button>
          <span className="text-slate-300 font-bold">|</span>
          <button
            onClick={() => { setSubTab('예약'); setSelectedId(reservations[0]?.id || ''); }}
            className={`px-6 py-2 rounded-md font-bold text-lg transition-all ${
              subTab === '예약'
                ? 'bg-[#6ba0d6] text-white shadow-sm'
                : 'text-[#1e3a8a] hover:bg-[#e4effa]'
            }`}
          >
            예약주문
          </button>
          <span className="text-slate-300 font-bold">|</span>
          <button
            onClick={() => setSubTab('메모')}
            className={`px-6 py-2 rounded-md font-bold text-lg transition-all ${
              subTab === '메모'
                ? 'bg-[#6ba0d6] text-white shadow-sm'
                : 'text-[#1e3a8a] hover:bg-[#e4effa]'
            }`}
          >
            메모
          </button>
          <span className="text-slate-300 font-bold">|</span>
          <button
            onClick={() => setSubTab('검색')}
            className={`px-6 py-2 rounded-md font-bold text-lg transition-all ${
              subTab === '검색'
                ? 'bg-[#6ba0d6] text-white shadow-sm'
                : 'text-[#1e3a8a] hover:bg-[#e4effa]'
            }`}
          >
            주문검색
          </button>
        </div>
        {orders.length > 0 ? (
          <button
            id="btn-clear-all-orders-view"
            onClick={clearAllOrders}
            className="text-xs md:text-sm font-bold px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 rounded transition-colors shadow-sm"
            title="모든 주문 내역 완전히 비우기"
          >
            주문 전체 비우기
          </button>
        ) : (
          <div className="w-32 hidden sm:block"></div>
        )}
      </div>

      {/* Main Content Area (Slide 4 / Slide 5 style) */}
      {subTab === '현황' || subTab === '예약' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          {/* Left Pane: Order / Reservation List (col-span-6) */}
          <div className="lg:col-span-6 flex flex-col border-2 border-[#2b71b8] bg-white shadow-sm">
            {/* Header with Search */}
            <div className="bg-[#4d94d8] px-4 py-2.5 flex items-center justify-between border-b-2 border-[#2b71b8]">
              <h2 className="text-white text-xl font-bold">
                {subTab === '현황' ? '주문현황' : '예약주문 리스트'}
              </h2>
              
              {/* Search Pill */}
              <div className="relative w-56">
                <input
                  type="text"
                  placeholder="주문/메뉴 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white text-slate-800 text-sm rounded-full pl-3 pr-8 py-1 border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <Search className="absolute right-2.5 top-1.5 text-blue-500" size={16} />
              </div>
            </div>

            {/* List Table Header */}
            <div className="grid grid-cols-12 bg-[#1b5c9c] text-white text-center font-bold text-sm py-2 border-b border-[#2b71b8]">
              <div className="col-span-2 border-r border-[#2b71b8]/40">
                {subTab === '현황' ? '주문번호' : '예약번호'}
              </div>
              <div className="col-span-2 border-r border-[#2b71b8]/40">테이블</div>
              <div className="col-span-2 border-r border-[#2b71b8]/40">
                {subTab === '현황' ? '주문시간' : '예약시간'}
              </div>
              <div className="col-span-2 border-r border-[#2b71b8]/40">메뉴</div>
              <div className="col-span-2 border-r border-[#2b71b8]/40">금액/결제</div>
              <div className="col-span-2">상태(호출)</div>
            </div>

            {/* List Table Body */}
            <div className="flex-1 divide-y divide-[#79aadc] overflow-y-auto max-h-[480px]">
              {filteredList.length === 0 ? (
                <div className="py-16 text-center text-slate-400 font-medium">
                  해당 조건의 주문 내역이 없습니다.
                </div>
              ) : (
                filteredList.map((order) => {
                  const isSelected = order.id === selectedOrder?.id;
                  const itemTitle = order.items.length > 1
                    ? `${order.items[0].name} 외 ${order.items.length - 1}`
                    : order.items[0]?.name || '주문 항목 없음';

                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedId(order.id)}
                      className={`grid grid-cols-12 text-center text-xs md:text-sm py-2.5 px-1 cursor-pointer transition-colors items-center ${
                        isSelected ? 'bg-[#dbeafe] font-bold text-blue-900 border-l-4 border-[#1b5c9c]' : 'hover:bg-[#f0f7ff]'
                      }`}
                    >
                      <div className="col-span-2 font-mono font-bold text-[#1b5c9c] truncate px-1">
                        {order.orderNumber}
                      </div>
                      <div className="col-span-2 text-slate-700 truncate font-semibold">
                        {order.tableName}
                      </div>
                      <div className="col-span-2 text-slate-600 font-medium">
                        {order.isReservation ? order.reservationTime : order.orderTime}
                      </div>
                      <div className="col-span-2 text-left truncate px-1 font-medium text-slate-800">
                        {itemTitle}
                      </div>
                      <div className="col-span-2 font-mono text-slate-900 font-bold flex flex-col items-center justify-center">
                        <span>₩{order.totalAmount.toLocaleString()}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          order.paymentStatus === '결제완료' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {order.paymentStatus === '결제완료' ? '결제완료' : '미결제'}
                        </span>
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] md:text-xs px-2.5 py-1 rounded-full font-bold shadow-sm transition-all ${
                            order.status === '준비완료'
                              ? 'bg-emerald-600 text-white animate-pulse'
                              : order.status === '준비중'
                              ? 'bg-amber-500 text-white'
                              : order.status === '접수'
                              ? 'bg-blue-500 text-white'
                              : order.status === '제공완료'
                              ? 'bg-[#eb86bc] text-white'
                              : order.status === '취소됨'
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-500 text-white'
                          }`}
                        >
                          {order.status === '준비완료' && <Bell size={11} className="animate-bounce" />}
                          <span>{order.status}</span>
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Status Filter Chips (Matches Slide 4 / Slide 5 exactly) */}
            <div className="bg-[#eaf2fb] p-3 border-t-2 border-[#2b71b8] flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#1b5c9c] mr-2">상태 필터:</span>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setStatusFilter(statusFilter === '준비중' ? '전체' : '준비중')}
                  className={`px-4 py-1.5 text-white font-bold text-sm rounded-none shadow-sm transition-transform active:scale-95 ${
                    statusFilter === '준비중' ? 'ring-2 ring-black scale-105' : ''
                  }`}
                  style={{ backgroundColor: '#e66a1f' }}
                >
                  준비중
                </button>
                <button
                  onClick={() => setStatusFilter(statusFilter === '접수' ? '전체' : '접수')}
                  className={`px-4 py-1.5 text-slate-800 font-bold text-sm rounded-none shadow-sm transition-transform active:scale-95 ${
                    statusFilter === '접수' ? 'ring-2 ring-black scale-105' : ''
                  }`}
                  style={{ backgroundColor: '#85b9ea' }}
                >
                  접수
                </button>
                <button
                  onClick={() => setStatusFilter(statusFilter === '준비완료' ? '전체' : '준비완료')}
                  className={`px-4 py-1.5 text-white font-bold text-sm rounded-none shadow-sm transition-transform active:scale-95 ${
                    statusFilter === '준비완료' ? 'ring-2 ring-black scale-105' : ''
                  }`}
                  style={{ backgroundColor: '#00a854' }}
                >
                  준비완료
                </button>
                <button
                  onClick={() => setStatusFilter(statusFilter === '제공완료' ? '전체' : '제공완료')}
                  className={`px-4 py-1.5 text-white font-bold text-sm rounded-none shadow-sm transition-transform active:scale-95 ${
                    statusFilter === '제공완료' ? 'ring-2 ring-black scale-105' : ''
                  }`}
                  style={{ backgroundColor: '#eb86bc' }}
                >
                  제공완료
                </button>
                {statusFilter !== '전체' && (
                  <button
                    onClick={() => setStatusFilter('전체')}
                    className="text-xs text-blue-700 underline font-bold ml-1"
                  >
                    필터 해제
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Pane: Order Details (col-span-6) */}
          <div className="lg:col-span-6 flex flex-col border-2 border-[#2b71b8] bg-white shadow-sm">
            {/* Header with 영수증출력 button */}
            <div className="bg-[#4d94d8] px-4 py-2.5 flex items-center justify-between border-b-2 border-[#2b71b8]">
              <h2 className="text-white text-xl font-bold">
                {subTab === '현황' ? '주문상세' : '예약상세'}
              </h2>
              <button
                id="btn-print-receipt-detail"
                onClick={handleOpenReceipt}
                className="bg-[#d2e3f5] hover:bg-white text-[#1b5c9c] font-black text-sm md:text-base px-4 py-1 rounded shadow-sm border border-[#1b5c9c] transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Printer size={16} />
                <span>영수증출력</span>
              </button>
            </div>

            {selectedOrder ? (
              <div className="p-4 flex-1 flex flex-col justify-between gap-4 overflow-y-auto">
                {/* 2-column layout: 주문자정보 / 예약자정보 + 주문내역 */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Info Box (col-span-5) */}
                  <div className="md:col-span-5 flex flex-col">
                    <div className="bg-[#2977ca] text-white text-center font-bold py-1 text-sm rounded-t">
                      {subTab === '현황' ? '주문자정보' : '예약자정보'}
                    </div>
                    <div className="p-3 bg-slate-50 border border-[#2977ca] rounded-b flex flex-col gap-2 text-xs md:text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-900 font-bold">
                          {subTab === '현황' ? '주문자명' : '예약자명'}
                        </span>
                        <div className="w-32 bg-white border border-blue-400 rounded-full px-3 py-1 text-center font-bold text-slate-800">
                          {selectedOrder.customerName}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-blue-900 font-bold">
                          {subTab === '현황' ? '주문번호' : '예약번호'}
                        </span>
                        <div className="w-32 bg-white border border-blue-400 rounded-full px-3 py-1 text-center font-mono font-bold text-slate-800">
                          {selectedOrder.orderNumber}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-blue-900 font-bold">
                          {subTab === '현황' ? '주문방식' : '예약방식'}
                        </span>
                        <div className="w-32 bg-white border border-blue-400 rounded-full px-3 py-1 text-center font-semibold text-slate-800">
                          {selectedOrder.orderType}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-blue-900 font-bold">주문상태</span>
                        <div className="w-32 bg-white border border-blue-400 rounded-full px-3 py-1 text-center font-bold text-blue-700">
                          {selectedOrder.status}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-blue-900 font-bold">결제상태</span>
                        <div className="w-32 bg-white border border-blue-400 rounded-full px-3 py-1 text-center font-bold text-emerald-700">
                          {selectedOrder.paymentStatus}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-blue-900 font-bold">테이블명</span>
                        <div className="w-32 bg-white border border-blue-400 rounded-full px-3 py-1 text-center font-bold text-slate-800">
                          {selectedOrder.tableName}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-blue-900 font-bold">
                          {subTab === '현황' ? '주문시간' : '예약시간'}
                        </span>
                        <div className="w-32 bg-white border border-blue-400 rounded-full px-3 py-1 text-center font-mono text-slate-700">
                          {selectedOrder.isReservation ? selectedOrder.reservationTime : selectedOrder.orderTime}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Table (col-span-7) */}
                  <div className="md:col-span-7 flex flex-col">
                    <div className="bg-[#2977ca] text-white text-center font-bold py-1 text-sm rounded-t">
                      주문내역
                    </div>
                    <div className="border border-[#2977ca] rounded-b flex flex-col flex-1 bg-white">
                      {/* Table Header */}
                      <div className="grid grid-cols-12 bg-blue-50 text-slate-700 text-center font-bold text-xs py-1.5 border-b border-blue-200">
                        <div className="col-span-4 border-r border-blue-200">메뉴명</div>
                        <div className="col-span-2 border-r border-blue-200">옵션</div>
                        <div className="col-span-2 border-r border-blue-200">수량</div>
                        <div className="col-span-2 border-r border-blue-200">단가</div>
                        <div className="col-span-2">금액</div>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-slate-100 max-h-[190px] overflow-y-auto flex-1">
                        {selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="grid grid-cols-12 text-center text-xs py-2 px-1 items-center">
                            <div className="col-span-4 text-left font-bold text-slate-800 truncate px-1">
                              {item.name}
                            </div>
                            <div className="col-span-2 text-[10px] text-slate-500 truncate">
                              {item.selectedOptions?.join(', ') || '-'}
                            </div>
                            <div className="col-span-2 font-bold text-blue-700 font-mono">
                              {item.quantity}
                            </div>
                            <div className="col-span-2 text-slate-600 font-mono">
                              {item.unitPrice.toLocaleString()}
                            </div>
                            <div className="col-span-2 font-bold text-slate-900 font-mono">
                              {item.totalPrice.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Summary Row */}
                      <div className="bg-blue-50/80 p-2.5 border-t border-blue-200 flex justify-between items-center font-bold text-slate-900">
                        <span className="text-sm">계:</span>
                        <span className="text-lg text-blue-900 font-mono">
                          ₩ {selectedOrder.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Progress Changer */}
                <div className="bg-slate-50 p-3 rounded border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs md:text-sm font-bold text-slate-800">진행상태 변경:</span>
                    <span className="text-[11px] text-blue-600 font-medium">(호출 전광판 자동 반영)</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {(['접수', '준비중', '준비완료', '제공완료'] as OrderStatus[]).map((st) => {
                      const isCurrent = selectedOrder.status === st;
                      let btnStyle = 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100';
                      if (isCurrent) {
                        if (st === '접수') btnStyle = 'bg-blue-600 text-white shadow ring-2 ring-blue-400 font-bold';
                        else if (st === '준비중') btnStyle = 'bg-amber-500 text-white shadow ring-2 ring-amber-400 font-bold';
                        else if (st === '준비완료') btnStyle = 'bg-emerald-600 text-white shadow ring-2 ring-emerald-400 font-black';
                        else btnStyle = 'bg-slate-700 text-white shadow ring-2 ring-slate-400 font-bold';
                      } else {
                        if (st === '준비완료') btnStyle = 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-400 text-emerald-800 font-bold';
                        else if (st === '준비중') btnStyle = 'bg-amber-50 hover:bg-amber-100 border border-amber-400 text-amber-800 font-bold';
                      }
                      return (
                        <button
                          key={st}
                          onClick={() => handleStatusChange(st)}
                          className={`px-3.5 py-1.5 text-xs md:text-sm rounded transition-all flex items-center gap-1 active:scale-95 ${btnStyle}`}
                          title={st === '준비완료' ? '호출 전광판에 즉시 준비완료로 반영 및 딩동 알림' : `${st} 상태로 변경`}
                        >
                          {st === '준비완료' && <Bell size={13} className={isCurrent ? 'animate-bounce' : ''} />}
                          <span>{st}</span>
                          {st === '준비완료' && <span className="text-[10px] opacity-90">(호출)</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Action Buttons (주문수정, 요청사항, 주문취소, 계산처리, 메모) */}
                <div className="grid grid-cols-5 gap-2 pt-2 border-t border-slate-200">
                  <button
                    id="btn-edit-order"
                    onClick={() => {
                      // Navigate to POS checkout with this order's table
                      const table = tables.find(t => t.id === selectedOrder.tableId);
                      if (table) setCartTable(table);
                      setActiveTab('CHECKOUT');
                    }}
                    className="bg-[#2977ca] hover:bg-[#1f63ab] text-white font-bold text-sm md:text-base py-3 rounded-none shadow transition-all active:scale-95 flex items-center justify-center"
                  >
                    주문수정
                  </button>

                  <button
                    id="btn-order-request"
                    onClick={() => {
                      setReqText(selectedOrder.specialRequests || '');
                      setIsEditReqOpen(true);
                    }}
                    className="bg-[#2977ca] hover:bg-[#1f63ab] text-white font-bold text-sm md:text-base py-3 rounded-none shadow transition-all active:scale-95 flex items-center justify-center"
                  >
                    요청사항
                  </button>

                  <button
                    id="btn-order-cancel"
                    onClick={handleCancelOrder}
                    className="bg-[#c80000] hover:bg-[#a50000] text-white font-bold text-sm md:text-base py-3 rounded-none shadow transition-all active:scale-95 flex items-center justify-center"
                  >
                    주문취소
                  </button>

                  <button
                    id="btn-order-payment"
                    onClick={handleCheckoutProcess}
                    className="bg-[#00a854] hover:bg-[#02934a] text-white font-bold text-sm md:text-base py-3 rounded-none shadow transition-all active:scale-95 flex items-center justify-center"
                  >
                    계산처리
                  </button>

                  <button
                    id="btn-order-memo"
                    onClick={() => {
                      setMemoText(selectedOrder.memo || '');
                      setIsMemoOpen(true);
                    }}
                    className="bg-[#ffd200] hover:bg-[#e6be00] text-slate-900 font-bold text-sm md:text-base py-3 rounded-none shadow transition-all active:scale-95 flex items-center justify-center"
                  >
                    메모
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center text-slate-400">선택된 주문이 없습니다.</div>
            )}
          </div>
        </div>
      ) : subTab === '메모' ? (
        /* Store / Kitchen Memos Sub-tab */
        <div className="border-2 border-[#2b71b8] bg-white p-6 flex flex-col gap-6 shadow-sm flex-1">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-xl font-bold text-[#1b5c9c] flex items-center gap-2">
              <StickyNote className="text-amber-500" />
              매장 및 주방 공지 메모 관리
            </h3>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="새로운 매장 전달사항이나 레시피 주의점을 입력하세요..."
              value={newNoteInput}
              onChange={(e) => setNewNoteInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newNoteInput.trim()) {
                  setStoreNotes([newNoteInput.trim(), ...storeNotes]);
                  setNewNoteInput('');
                  showToast('새 공지 메모가 추가되었습니다.');
                }
              }}
              className="flex-1 border-2 border-blue-200 rounded px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => {
                if (newNoteInput.trim()) {
                  setStoreNotes([newNoteInput.trim(), ...storeNotes]);
                  setNewNoteInput('');
                  showToast('새 공지 메모가 추가되었습니다.');
                }
              }}
              className="bg-[#2977ca] hover:bg-[#1f63ab] text-white font-bold px-6 py-2 rounded"
            >
              메모 등록
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {storeNotes.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-400 font-medium">
                등록된 매장 공지 또는 메모가 없습니다. 상단에서 새로운 메모를 작성해 등록해 주세요.
              </div>
            ) : (
              storeNotes.map((note, index) => (
                <div key={index} className="p-4 bg-amber-50 border border-amber-300 rounded shadow-sm relative group">
                  <p className="text-slate-800 font-medium text-sm leading-relaxed">{note}</p>
                  <button
                    onClick={() => {
                      setStoreNotes(storeNotes.filter((_, i) => i !== index));
                      showToast('메모가 삭제되었습니다.');
                    }}
                    className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Order Search Sub-tab */
        <div className="border-2 border-[#2b71b8] bg-white p-6 flex flex-col gap-6 shadow-sm flex-1">
          <div className="border-b pb-3 flex justify-between items-center">
            <h3 className="text-xl font-bold text-[#1b5c9c]">통합 주문 검색 및 이력 조회</h3>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="주문번호, 고객명, 전화번호, 메뉴명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border-2 border-blue-200 rounded px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="border border-slate-200 rounded overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#1b5c9c] text-white">
                <tr>
                  <th className="py-2 px-3">주문번호</th>
                  <th className="py-2 px-3">고객명</th>
                  <th className="py-2 px-3">테이블</th>
                  <th className="py-2 px-3">주문시간</th>
                  <th className="py-2 px-3">주문내역</th>
                  <th className="py-2 px-3">결제수단</th>
                  <th className="py-2 px-3">금액</th>
                  <th className="py-2 px-3">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                      완료된 주문 이력이 없습니다.
                    </td>
                  </tr>
                ) : (
                  orders.map((ord) => (
                    <tr
                      key={ord.id}
                      onClick={() => {
                        setSelectedId(ord.id);
                        setSubTab('현황');
                      }}
                      className="hover:bg-blue-50 cursor-pointer"
                    >
                      <td className="py-2 px-3 font-mono font-bold text-blue-700">{ord.orderNumber}</td>
                      <td className="py-2 px-3">{ord.customerName}</td>
                      <td className="py-2 px-3 font-bold">{ord.tableName}</td>
                      <td className="py-2 px-3 text-slate-500">{ord.orderTime}</td>
                      <td className="py-2 px-3 text-slate-800">
                        {ord.items.map((i) => `${i.name}(${i.quantity})`).join(', ')}
                      </td>
                      <td className="py-2 px-3">{ord.paymentMethod || '미결제'}</td>
                      <td className="py-2 px-3 font-bold font-mono">₩{ord.totalAmount.toLocaleString()}</td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Special Requests Modal */}
      {isEditReqOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 border-2 border-blue-500">
            <h3 className="text-lg font-bold text-slate-800 mb-2">고객 요청사항 수정</h3>
            <p className="text-xs text-slate-500 mb-4 font-mono">주문번호: {selectedOrder.orderNumber}</p>
            <textarea
              rows={4}
              value={reqText}
              onChange={(e) => setReqText(e.target.value)}
              placeholder="예: 얼음 적게, 샷 연하게, 빨대 2개 등..."
              className="w-full border rounded p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsEditReqOpen(false)}
                className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-100 rounded"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  updateOrderSpecialRequests(selectedOrder.id, reqText);
                  setIsEditReqOpen(false);
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded"
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Memo Modal */}
      {isMemoOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 border-2 border-yellow-500">
            <h3 className="text-lg font-bold text-slate-800 mb-2">주문 관리 메모</h3>
            <p className="text-xs text-slate-500 mb-4 font-mono">주문번호: {selectedOrder.orderNumber}</p>
            <textarea
              rows={4}
              value={memoText}
              onChange={(e) => setMemoText(e.target.value)}
              placeholder="직원간 전달 메모를 입력하세요..."
              className="w-full border rounded p-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsMemoOpen(false)}
                className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-100 rounded"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  updateOrderMemo(selectedOrder.id, memoText);
                  setIsMemoOpen(false);
                }}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded"
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
