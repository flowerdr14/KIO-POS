import React, { useState, useEffect } from 'react';
import { usePos } from '../context/PosContext';
import { Printer, Settings, Check, X, Copy, Share2 } from 'lucide-react';
import { playPrintSound } from '../utils/audio';
import { StarobuxReceiptLogo } from './StarobuxReceiptLogo';
import { Order } from '../types';

export const ReceiptModal: React.FC = () => {
  const {
    isReceiptModalOpen,
    setIsReceiptModalOpen,
    receiptSettings,
    updateReceiptSettings,
    receiptOrderToPrint,
    orders,
    cart,
    soundEnabled,
    showToast,
  } = usePos();

  const [activeTab, setActiveTab] = useState<'preview' | 'settings'>('preview');
  const [printDateStr, setPrintDateStr] = useState('');

  // Local settings state
  const [storeName, setStoreName] = useState(receiptSettings.storeName);
  const [storeBranch, setStoreBranch] = useState(receiptSettings.storeBranch);
  const [businessNumber, setBusinessNumber] = useState(receiptSettings.businessNumber);
  const [ownerName, setOwnerName] = useState(receiptSettings.ownerName);
  const [tel, setTel] = useState(receiptSettings.tel);
  const [address, setAddress] = useState(receiptSettings.address);
  const [footerMessage, setFooterMessage] = useState(receiptSettings.footerMessage);

  // Compute Korean formatted date `{인쇄} YYYY/MM/DD(요일) HH:MM:SS`
  useEffect(() => {
    if (isReceiptModalOpen) {
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      const date = new Date();
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const dayName = days[date.getDay()];
      const hh = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      const ss = String(date.getSeconds()).padStart(2, '0');

      setPrintDateStr(`{인쇄} ${yyyy}/${mm}/${dd}(${dayName})  ${hh}:${min}:${ss}`);
    }
  }, [isReceiptModalOpen]);

  if (!isReceiptModalOpen) return null;

  // Use selected order or fallback to the latest order in history
  const order: Order | undefined = receiptOrderToPrint || orders[0];

  const handlePrint = () => {
    if (soundEnabled) playPrintSound();
    showToast('프린터기로 영수증 출력을 시작합니다...');
    
    // Trigger real system/POS printer
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateReceiptSettings({
      storeName,
      storeBranch,
      businessNumber,
      ownerName,
      tel,
      address,
      footerMessage,
    });
    showToast('영수증 매장 정보가 저장되었습니다.');
    setActiveTab('preview');
  };

  const activeCartItems = cart.map((c) => ({
    name: c.name,
    unitPrice: c.unitPrice,
    quantity: c.quantity,
    totalPrice: c.totalPrice,
    selectedOptions: c.selectedOptions,
  }));

  const itemsToRender: Array<{
    name: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    selectedOptions?: string[];
  }> = order && order.items.length > 0
    ? order.items
    : (activeCartItems.length > 0 ? activeCartItems : []);

  const totalAmount = order
    ? order.totalAmount
    : (activeCartItems.length > 0 ? activeCartItems.reduce((s, i) => s + i.totalPrice, 0) : 0);

  const taxAmount = Math.round(totalAmount / 11);
  const supplyAmount = totalAmount - taxAmount;
  const receivedAmount = order?.receivedAmount || totalAmount;
  const changeAmount = order?.changeAmount || 0;

  const paymentMethodLabel = order?.paymentMethod || (itemsToRender.length > 0 ? '결제대기' : '-');
  const cardInfoText = order?.cardInfo || (
    order?.paymentMethod === '신용카드' 
      ? '신한카드 (일시불)' 
      : order?.paymentMethod === '현금' 
      ? '현금영수증(소득공제)' 
      : (itemsToRender.length > 0 ? '결제 수단 선택 대기' : '-')
  );
  const approvalNo = order?.approvalNumber || (itemsToRender.length > 0 ? '승인대기' : '-');

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 select-none">
      <div className="bg-white border-2 border-[#1f5b94] shadow-2xl w-full max-w-xl overflow-hidden rounded-none flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#1f5b94] text-white px-5 py-3 flex items-center justify-between border-b-2 border-[#164875]">
          <div className="flex items-center gap-2">
            <Printer size={20} className="text-blue-200" />
            <span className="font-black text-lg tracking-tight">영수증 발행 및 프린터 인쇄</span>
          </div>
          <button
            onClick={() => setIsReceiptModalOpen(false)}
            className="hover:bg-rose-600 w-7 h-7 flex items-center justify-center rounded font-bold text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 border-b border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-2.5 border-b-2 transition-all ${
              activeTab === 'preview'
                ? 'border-[#1f5b94] bg-white text-[#1f5b94] font-black'
                : 'border-transparent text-slate-600 hover:bg-slate-200'
            }`}
          >
            영수증 양식 미리보기
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2.5 border-b-2 transition-all ${
              activeTab === 'settings'
                ? 'border-[#1f5b94] bg-white text-[#1f5b94] font-black'
                : 'border-transparent text-slate-600 hover:bg-slate-200'
            }`}
          >
            사업자 정보 & 양식 설정
          </button>
        </div>

        {/* Body Area */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          {activeTab === 'preview' ? (
            /* EXACT RECEIPT TEMPLATE (Matches user-uploaded image.png) */
            <div
              id="printable-receipt"
              className="w-full max-w-[360px] bg-white p-5 border border-slate-300 shadow-md font-mono text-slate-800 text-[11px] leading-tight select-text"
            >
              {/* Top Row: Starobux Circular Logo (Left) + Store & Payment Info (Right) */}
              <div className="flex items-start justify-between gap-3 pb-3">
                {/* Logo & Brand text */}
                <div className="shrink-0 pt-1">
                  <StarobuxReceiptLogo size={68} />
                </div>

                {/* Right Header Texts */}
                <div className="flex-1 text-right flex flex-col justify-start">
                  <div className="text-xl md:text-2xl font-black text-slate-400 tracking-tight leading-none mb-2">
                    스타로벅스 입양2호점
                  </div>
                  <div className="text-[12px] font-bold text-slate-800">
                    결제정보: {paymentMethodLabel} / 현금 / 포인트
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 truncate">
                    카드정보: {cardInfoText}
                  </div>
                </div>
              </div>

              {/* Print Date Line: {인쇄} YYYY/MM/DD(요일) HH:MM:SS */}
              <div className="pt-2 text-[12px] font-bold text-slate-800">
                {printDateStr || '{인쇄} 2026/09/18(금)  15:30:22'}
              </div>

              {/* Dashed Line */}
              <div className="text-slate-400 my-1 overflow-hidden tracking-tighter">
                --------------------------------------------------------
              </div>

              {/* Table Column Header: 상품명 단가 수량 금액 */}
              <div className="grid grid-cols-12 text-[12px] font-bold text-slate-800 py-0.5">
                <span className="col-span-5 text-left">상품명</span>
                <span className="col-span-3 text-right">단가</span>
                <span className="col-span-2 text-right">수량</span>
                <span className="col-span-2 text-right">금액</span>
              </div>

              {/* Dashed Line */}
              <div className="text-slate-400 my-1 overflow-hidden tracking-tighter">
                --------------------------------------------------------
              </div>

              {/* Items List */}
              <div className="divide-y divide-dotted divide-slate-200 py-0.5 min-h-[48px] flex flex-col justify-center">
                {itemsToRender.length === 0 ? (
                  <div className="py-4 text-center text-slate-400 text-xs font-mono">
                    (결제 완료된 주문 내역이 없습니다)
                  </div>
                ) : (
                  itemsToRender.map((it, idx) => (
                    <div key={idx} className="py-1 text-[11px] text-slate-800">
                      <div className="grid grid-cols-12 items-center">
                        <span className="col-span-5 font-bold truncate pr-1">{it.name}</span>
                        <span className="col-span-3 text-right font-mono">{it.unitPrice.toLocaleString()}</span>
                        <span className="col-span-2 text-right font-mono">{it.quantity}</span>
                        <span className="col-span-2 text-right font-mono font-bold">{it.totalPrice.toLocaleString()}</span>
                      </div>
                      {it.selectedOptions && it.selectedOptions.length > 0 && (
                        <div className="text-[10px] text-slate-500 pl-1">
                          └ {it.selectedOptions.join(', ')}
                        </div>
                      )}
                    </div>
                  ))
                )}
                {order?.takeoutPackaging && (
                  <div className="py-1 text-[11px] text-slate-800 border-t border-dotted border-slate-300">
                    <div className="grid grid-cols-12 items-center">
                      <span className="col-span-5 font-bold truncate pr-1">[포장] {order.takeoutPackaging}</span>
                      <span className="col-span-3 text-right font-mono">{order.takeoutPackagingFee ? order.takeoutPackagingFee.toLocaleString() : '0'}</span>
                      <span className="col-span-2 text-right font-mono">1</span>
                      <span className="col-span-2 text-right font-mono font-bold">{order.takeoutPackagingFee ? order.takeoutPackagingFee.toLocaleString() : '0'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Dashed Line */}
              <div className="text-slate-400 my-1 overflow-hidden tracking-tighter">
                --------------------------------------------------------
              </div>

              {/* Financial Breakdown */}
              <div className="space-y-1 text-[11px] py-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">총 공급가액</span>
                  <span className="font-mono">{supplyAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">부가세 (10%)</span>
                  <span className="font-mono">{taxAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Double Divider */}
              <div className="text-slate-500 my-1 overflow-hidden tracking-tighter font-bold">
                ========================================================
              </div>

              {/* Totals */}
              <div className="space-y-1.5 py-1">
                <div className="flex justify-between text-sm font-black text-slate-900">
                  <span>합계금액</span>
                  <span className="font-mono text-base">₩ {totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-700">받은금액 ({paymentMethodLabel})</span>
                  <span className="font-mono font-bold">{receivedAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-700">거스름돈</span>
                  <span className="font-mono font-bold">{changeAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Dashed Line */}
              <div className="text-slate-400 my-1 overflow-hidden tracking-tighter">
                --------------------------------------------------------
              </div>

              {/* Approval & Store Info Footer */}
              <div className="space-y-0.5 text-[10px] text-slate-500 pt-1">
                <div className="flex justify-between">
                  <span>승인번호:</span>
                  <span className="font-mono font-bold text-slate-700">{approvalNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>가맹점번호:</span>
                  <span className="font-mono">104-81-99238</span>
                </div>
                <div>사업자: {receiptSettings.businessNumber} | 대표: {receiptSettings.ownerName}</div>
                <div>주소: {receiptSettings.address}</div>
                <div>TEL: {receiptSettings.tel}</div>
              </div>

              {/* Thank you message */}
              <div className="pt-3 text-center text-[11px] font-bold text-slate-700">
                감사합니다. 또 방문해 주세요!
              </div>
            </div>
          ) : (
            /* Settings Form */
            <form onSubmit={handleSaveSettings} className="bg-white p-5 border rounded max-w-md w-full space-y-3 text-xs">
              <div className="font-black text-sm text-slate-800 border-b pb-2 flex items-center gap-1.5">
                <Settings size={16} className="text-[#1f5b94]" />
                <span>영수증 상호 및 가맹점 인쇄 정보 설정</span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">상호명</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full border rounded p-2"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">지점명</label>
                <input
                  type="text"
                  value={storeBranch}
                  onChange={(e) => setStoreBranch(e.target.value)}
                  className="w-full border rounded p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">사업자등록번호</label>
                  <input
                    type="text"
                    value={businessNumber}
                    onChange={(e) => setBusinessNumber(e.target.value)}
                    className="w-full border rounded p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">대표자명</label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full border rounded p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">대표 전화번호</label>
                  <input
                    type="text"
                    value={tel}
                    onChange={(e) => setTel(e.target.value)}
                    className="w-full border rounded p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">매장 주소</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border rounded p-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">하단 감사 인사 문구</label>
                <textarea
                  rows={2}
                  value={footerMessage}
                  onChange={(e) => setFooterMessage(e.target.value)}
                  className="w-full border rounded p-2"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#1f5b94] hover:bg-[#164775] text-white font-bold rounded flex items-center justify-center gap-1.5 shadow"
              >
                <Check size={16} />
                <span>양식 정보 저장</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-white p-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium">
            * [프린터기로 인쇄] 클릭 시 브라우저 인쇄창을 통해 실제 영수증 프린터로 인쇄됩니다.
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsReceiptModalOpen(false)}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-xs rounded transition-colors"
            >
              닫기
            </button>

            <button
              id="btn-print-receipt"
              onClick={handlePrint}
              className="px-6 py-2.5 bg-[#1f5b94] hover:bg-[#164775] text-white font-black text-sm rounded shadow-md flex items-center gap-2 transition-all active:scale-95"
            >
              <Printer size={18} />
              <span>🖨️ 프린터기로 인쇄</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
