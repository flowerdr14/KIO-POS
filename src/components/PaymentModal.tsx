import React, { useState, useEffect } from 'react';
import { usePos } from '../context/PosContext';
import { 
  CreditCard, 
  Banknote, 
  Coins, 
  Smartphone, 
  CheckCircle, 
  X, 
  Split, 
  Check, 
  QrCode, 
  ShieldCheck, 
  Zap,
  RotateCcw
} from 'lucide-react';
import { playKeypadBeep, playPosBeep } from '../utils/audio';

export const PaymentModal: React.FC = () => {
  const {
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    cart,
    cartTable,
    cartOrderType,
    completePayment,
    soundEnabled,
    showToast,
  } = usePos();

  const [activeMethod, setActiveMethod] = useState<'CARD' | 'CASH' | 'POINT' | 'EASYPAY' | 'SPLIT'>('CARD');

  // Card payment state
  const [selectedCardCompany, setSelectedCardCompany] = useState('신한카드');
  const [installment, setInstallment] = useState('일시불');
  const [cardNumber, setCardNumber] = useState('9410-****-****-3819');

  // Cash payment state
  const [receivedCashInput, setReceivedCashInput] = useState('');
  const [cashReceiptType, setCashReceiptType] = useState<'NONE' | 'PERSONAL' | 'BUSINESS'>('NONE');
  const [cashReceiptNumber, setCashReceiptNumber] = useState('010-1234-5678');

  // Point payment state
  const [memberPhone, setMemberPhone] = useState('010-7788-9900');
  const [availablePoints, setAvailablePoints] = useState(8500);
  const [usePointsAmount, setUsePointsAmount] = useState(0);

  // EasyPay state
  const [selectedEasyPay, setSelectedEasyPay] = useState<'카카오페이' | '네이버페이' | '토스페이' | '애플페이'>('카카오페이');

  // Split payment state
  const [splitCashAmount, setSplitCashAmount] = useState(0);

  // Auto-receipt toggle
  const [autoPrintReceipt, setAutoPrintReceipt] = useState(true);

  const subtotal = cart.reduce((sum, it) => sum + (it.unitPrice * it.quantity), 0);
  const discountTotal = cart.reduce((sum, it) => sum + (it.discount * it.quantity), 0);
  const amountDue = Math.max(0, subtotal - discountTotal);

  // Reset inputs when modal opens
  useEffect(() => {
    if (isPaymentModalOpen) {
      setReceivedCashInput(String(amountDue));
      setSplitCashAmount(Math.floor(amountDue / 2));
      setUsePointsAmount(Math.min(availablePoints, amountDue));
      // randomize last digits of card
      const rand4 = Math.floor(1000 + Math.random() * 9000);
      setCardNumber(`9410-****-****-${rand4}`);
    }
  }, [isPaymentModalOpen, amountDue, availablePoints]);

  if (!isPaymentModalOpen) return null;

  const handleCardPayment = () => {
    const cardInfo = `${selectedCardCompany} ${cardNumber} (${installment})`;
    completePayment('신용카드', amountDue, {
      cardInfo,
      autoOpenReceipt: autoPrintReceipt,
    });
    setIsPaymentModalOpen(false);
  };

  const handleCashPayment = () => {
    const receivedNum = Number(receivedCashInput) || amountDue;
    if (receivedNum < amountDue) {
      showToast('받은 금액이 결제 금액보다 적습니다.');
      return;
    }
    const receiptInfo = cashReceiptType === 'PERSONAL' 
      ? `현금영수증(소득공제: ${cashReceiptNumber})`
      : cashReceiptType === 'BUSINESS'
      ? `현금영수증(지출증빙: ${cashReceiptNumber})`
      : '현금영수증 미발행';

    completePayment('현금', receivedNum, {
      cardInfo: receiptInfo,
      autoOpenReceipt: autoPrintReceipt,
    });
    setIsPaymentModalOpen(false);
  };

  const handlePointPayment = () => {
    if (usePointsAmount < amountDue) {
      showToast('포인트 잔액이 부족하여 전액 결제가 어렵습니다. 복합결제를 이용해 주세요.');
      return;
    }
    setAvailablePoints(prev => Math.max(0, prev - amountDue));
    completePayment('포인트', 0, {
      cardInfo: `스타로벅스 멤버십 포인트 (${amountDue.toLocaleString()}P 차감)`,
      autoOpenReceipt: autoPrintReceipt,
    });
    setIsPaymentModalOpen(false);
  };

  const handleEasyPayPayment = () => {
    completePayment('간편결제', amountDue, {
      cardInfo: `${selectedEasyPay} 모바일 간편결제 승인`,
      autoOpenReceipt: autoPrintReceipt,
    });
    setIsPaymentModalOpen(false);
  };

  const handleSplitPayment = () => {
    const cashPart = Math.min(amountDue, Math.max(0, splitCashAmount));
    const cardPart = amountDue - cashPart;
    completePayment('복합결제', cashPart, {
      cardInfo: `복합결제 (현금: ₩${cashPart.toLocaleString()} + 카드: ₩${cardPart.toLocaleString()})`,
      autoOpenReceipt: autoPrintReceipt,
    });
    setIsPaymentModalOpen(false);
  };

  const receivedCashNum = Number(receivedCashInput) || 0;
  const changeCash = Math.max(0, receivedCashNum - amountDue);

  const addCashQuick = (amt: number) => {
    if (soundEnabled) playKeypadBeep();
    setReceivedCashInput(String(receivedCashNum + amt));
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 select-none">
      <div className="bg-white border-2 border-[#1f5b94] shadow-2xl w-full max-w-2xl overflow-hidden rounded-none flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#1f5b94] text-white px-5 py-3 flex items-center justify-between border-b-2 border-[#164875]">
          <div className="flex items-center gap-2.5">
            <CreditCard size={22} className="text-blue-200" />
            <span className="font-black text-xl tracking-tight">결제 수단 선택 및 승인</span>
          </div>
          <button
            onClick={() => setIsPaymentModalOpen(false)}
            className="hover:bg-rose-600 w-7 h-7 flex items-center justify-center rounded font-bold text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Order Summary Ribbon */}
        <div className="bg-[#f0f6fc] border-b border-blue-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-slate-500">
              {cartTable ? `[${cartTable.name} 테이블]` : '[카운터]'} • {cartOrderType} • {cart.length}개 품목
            </div>
            <div className="text-sm font-black text-slate-800 truncate max-w-xs">
              {cart[0]?.name} {cart.length > 1 ? `외 ${cart.length - 1}건` : ''}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-500 mr-2">결제 대상 금액</span>
            <span className="text-2xl font-black text-[#1b5c9c] font-mono">
              ₩ {amountDue.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Method Selection Tabs */}
        <div className="grid grid-cols-5 border-b border-slate-200 bg-slate-100 text-xs font-bold">
          <button
            id="tab-method-card"
            onClick={() => { if (soundEnabled) playPosBeep(); setActiveMethod('CARD'); }}
            className={`py-3 flex flex-col items-center justify-center gap-1 transition-all ${
              activeMethod === 'CARD'
                ? 'bg-white text-[#1f5b94] border-b-2 border-[#1f5b94] shadow-sm font-black'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CreditCard size={18} />
            <span>신용/체크카드</span>
          </button>

          <button
            id="tab-method-cash"
            onClick={() => { if (soundEnabled) playPosBeep(); setActiveMethod('CASH'); }}
            className={`py-3 flex flex-col items-center justify-center gap-1 transition-all ${
              activeMethod === 'CASH'
                ? 'bg-white text-emerald-700 border-b-2 border-emerald-600 shadow-sm font-black'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Banknote size={18} />
            <span>현금 결제</span>
          </button>

          <button
            id="tab-method-point"
            onClick={() => { if (soundEnabled) playPosBeep(); setActiveMethod('POINT'); }}
            className={`py-3 flex flex-col items-center justify-center gap-1 transition-all ${
              activeMethod === 'POINT'
                ? 'bg-white text-amber-700 border-b-2 border-amber-600 shadow-sm font-black'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Coins size={18} />
            <span>포인트 결제</span>
          </button>

          <button
            id="tab-method-easypay"
            onClick={() => { if (soundEnabled) playPosBeep(); setActiveMethod('EASYPAY'); }}
            className={`py-3 flex flex-col items-center justify-center gap-1 transition-all ${
              activeMethod === 'EASYPAY'
                ? 'bg-white text-purple-700 border-b-2 border-purple-600 shadow-sm font-black'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Smartphone size={18} />
            <span>간편/모바일페이</span>
          </button>

          <button
            id="tab-method-split"
            onClick={() => { if (soundEnabled) playPosBeep(); setActiveMethod('SPLIT'); }}
            className={`py-3 flex flex-col items-center justify-center gap-1 transition-all ${
              activeMethod === 'SPLIT'
                ? 'bg-white text-blue-700 border-b-2 border-blue-600 shadow-sm font-black'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Split size={18} />
            <span>복합 결제</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto flex-1 bg-white text-xs">
          {/* TAB 1: 신용카드 */}
          {activeMethod === 'CARD' && (
            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">카드사 선택</label>
                <div className="grid grid-cols-4 gap-2">
                  {['신한카드', '국민카드', '삼성카드', '현대카드', '비씨카드', '하나카드', '롯데카드', '카카오뱅크'].map((co) => (
                    <button
                      key={co}
                      type="button"
                      onClick={() => setSelectedCardCompany(co)}
                      className={`py-2 px-1 text-center font-bold rounded border transition-all ${
                        selectedCardCompany === co
                          ? 'bg-[#1f5b94] text-white border-[#1f5b94] shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50'
                      }`}
                    >
                      {co}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">할부 개월 수</label>
                  <select
                    value={installment}
                    onChange={(e) => setInstallment(e.target.value)}
                    className="w-full border rounded p-2 text-xs bg-white font-bold"
                  >
                    <option value="일시불">일시불</option>
                    <option value="2개월">2개월 (무이자)</option>
                    <option value="3개월">3개월 (무이자)</option>
                    <option value="6개월">6개월</option>
                    <option value="12개월">12개월</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">카드번호 (마스킹)</label>
                  <input
                    type="text"
                    readOnly
                    value={cardNumber}
                    className="w-full border rounded p-2 text-xs font-mono font-bold bg-slate-100 text-slate-700"
                  />
                </div>
              </div>

              {/* IC Terminal visual graphic */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <CreditCard size={20} className="animate-pulse" />
                </div>
                <div className="text-slate-700">
                  <div className="font-black text-sm text-blue-900">
                    IC칩 카드를 단말기에 삽입하거나, 삼성페이·애플페이를 터치해 주세요.
                  </div>
                  <div className="text-[11px] text-slate-500">
                    승인 요청 시 밴사(VAN) 자동망 연결 및 카드 전표가 즉시 발행됩니다.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 현금 */}
          {activeMethod === 'CASH' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border rounded">
                  <span className="text-slate-500 block text-xs">결제할 금액</span>
                  <span className="text-xl font-black text-slate-900 font-mono">
                    ₩ {amountDue.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded">
                  <span className="text-emerald-700 block text-xs font-bold">거스름돈</span>
                  <span className="text-xl font-black text-emerald-800 font-mono">
                    ₩ {changeCash.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">고객에게 받은 현금</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={receivedCashInput}
                    onChange={(e) => setReceivedCashInput(e.target.value)}
                    placeholder="받은 금액 입력"
                    className="flex-1 border-2 border-emerald-500 rounded p-2 text-lg font-mono font-bold text-emerald-900"
                  />
                  <button
                    type="button"
                    onClick={() => setReceivedCashInput(String(amountDue))}
                    className="px-4 py-2 bg-slate-800 text-white font-bold rounded text-xs hover:bg-black"
                  >
                    정액 (전액)
                  </button>
                </div>
              </div>

              {/* Quick Bill Increments */}
              <div className="grid grid-cols-4 gap-2">
                {[1000, 5000, 10000, 50000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => addCashQuick(amt)}
                    className="py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded border border-emerald-200 text-xs transition-colors"
                  >
                    +{amt.toLocaleString()}원
                  </button>
                ))}
              </div>

              {/* Cash Receipt Option */}
              <div className="p-3 border rounded bg-slate-50 space-y-2">
                <span className="font-bold text-slate-700 block">현금영수증 발행</span>
                <div className="flex gap-2">
                  {[
                    { id: 'NONE', label: '미발행' },
                    { id: 'PERSONAL', label: '개인소득공제' },
                    { id: 'BUSINESS', label: '사업자지출증빙' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCashReceiptType(item.id as 'NONE' | 'PERSONAL' | 'BUSINESS')}
                      className={`flex-1 py-1.5 rounded font-bold text-xs border ${
                        cashReceiptType === item.id
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {cashReceiptType !== 'NONE' && (
                  <div>
                    <input
                      type="text"
                      placeholder={cashReceiptType === 'PERSONAL' ? '휴대폰번호 입력' : '사업자등록번호 입력'}
                      value={cashReceiptNumber}
                      onChange={(e) => setCashReceiptNumber(e.target.value)}
                      className="w-full border rounded p-1.5 text-xs font-mono font-bold mt-1 bg-white"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: 포인트 */}
          {activeMethod === 'POINT' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded flex justify-between items-center">
                <div>
                  <div className="text-xs text-amber-800 font-bold">스타로벅스 멤버십 회원</div>
                  <div className="text-base font-black text-slate-800">{memberPhone}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 font-bold">보유 포인트</div>
                  <div className="text-xl font-black text-amber-700 font-mono">
                    {availablePoints.toLocaleString()} P
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">사용할 포인트 (1P = 1원)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    max={availablePoints}
                    value={usePointsAmount}
                    onChange={(e) => setUsePointsAmount(Number(e.target.value))}
                    className="flex-1 border-2 border-amber-500 rounded p-2 text-base font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setUsePointsAmount(Math.min(availablePoints, amountDue))}
                    className="px-4 py-2 bg-amber-600 text-white font-bold rounded text-xs hover:bg-amber-700"
                  >
                    최대 사용
                  </button>
                </div>
              </div>

              {availablePoints < amountDue && (
                <div className="text-xs text-rose-600 font-bold">
                  * 포인트 잔액({availablePoints.toLocaleString()}P)이 결제 금액(₩{amountDue.toLocaleString()})보다 부족합니다.
                  차액은 복합결제 탭에서 현금 또는 카드로 분할 결제할 수 있습니다.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: 간편결제 */}
          {activeMethod === 'EASYPAY' && (
            <div className="space-y-4">
              <label className="font-bold text-slate-700 block">간편결제 서비스 선택</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: '카카오페이', color: 'bg-[#fee500] text-slate-900 border-[#f0d800]' },
                  { name: '네이버페이', color: 'bg-[#03c75a] text-white border-[#02b350]' },
                  { name: '토스페이', color: 'bg-[#0064ff] text-white border-[#0052d9]' },
                  { name: '애플페이', color: 'bg-black text-white border-black' },
                ].map((ep) => (
                  <button
                    key={ep.name}
                    type="button"
                    onClick={() => setSelectedEasyPay(ep.name as typeof selectedEasyPay)}
                    className={`py-3 px-3 rounded border font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${ep.color} ${
                      selectedEasyPay === ep.name ? 'ring-4 ring-blue-400 scale-[1.02]' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    <Smartphone size={16} />
                    <span>{ep.name}</span>
                  </button>
                ))}
              </div>

              <div className="p-4 bg-slate-50 border rounded flex items-center gap-3">
                <QrCode size={36} className="text-purple-600 shrink-0" />
                <div className="text-slate-600 text-xs">
                  <div className="font-bold text-slate-900">
                    스캐너로 고객 스마트폰의 바코드 또는 QR코드를 스캔해 주세요.
                  </div>
                  <div>카카오페이 / 네이버페이 / 토스 / 제로페이 자동 감지 승인</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: 복합결제 */}
          {activeMethod === 'SPLIT' && (
            <div className="space-y-3">
              <div className="text-slate-600 text-xs">
                결제 금액을 현금과 카드로 분할하여 각각 결제 승인을 진행합니다.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded bg-emerald-50">
                  <label className="font-bold text-emerald-900 block mb-1">1. 현금 결제 분담액</label>
                  <input
                    type="number"
                    value={splitCashAmount}
                    onChange={(e) => setSplitCashAmount(Number(e.target.value))}
                    className="w-full border rounded p-1.5 font-mono font-bold text-sm bg-white"
                  />
                </div>
                <div className="p-3 border rounded bg-blue-50">
                  <label className="font-bold text-blue-900 block mb-1">2. 카드 결제 분담액 (자동)</label>
                  <div className="w-full p-1.5 font-mono font-bold text-sm text-blue-950 bg-white border rounded">
                    ₩ {Math.max(0, amountDue - splitCashAmount).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSplitCashAmount(Math.floor(amountDue / 2))}
                  className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 rounded border text-xs font-bold"
                >
                  50% 균등 분할
                </button>
                <button
                  type="button"
                  onClick={() => setSplitCashAmount(10000)}
                  className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 rounded border text-xs font-bold"
                >
                  현금 10,000원 + 나머지 카드
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer & Action Button */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={autoPrintReceipt}
                onChange={(e) => setAutoPrintReceipt(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600"
              />
              <span>결제 완료 후 영수증 즉시 발행 및 프린터 인쇄 팝업 열기</span>
            </label>
            <span className="text-xs font-bold text-slate-500">
              최종 승인 금액: <strong className="text-slate-900 font-mono text-sm">₩ {amountDue.toLocaleString()}</strong>
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-5 py-3 bg-slate-300 hover:bg-slate-400 text-slate-800 font-black text-sm rounded shadow-sm"
            >
              결제 취소
            </button>

            {activeMethod === 'CARD' && (
              <button
                id="btn-confirm-card-payment"
                onClick={handleCardPayment}
                className="flex-1 py-3 bg-[#1f5b94] hover:bg-[#164775] text-white font-black text-base rounded shadow flex items-center justify-center gap-2 tracking-wide"
              >
                <CreditCard size={18} />
                <span>신용카드 결제 승인 (₩ {amountDue.toLocaleString()})</span>
              </button>
            )}

            {activeMethod === 'CASH' && (
              <button
                id="btn-confirm-cash-payment"
                onClick={handleCashPayment}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base rounded shadow flex items-center justify-center gap-2 tracking-wide"
              >
                <Banknote size={18} />
                <span>현금 결제 완료 & 돈통 열기 (₩ {amountDue.toLocaleString()})</span>
              </button>
            )}

            {activeMethod === 'POINT' && (
              <button
                id="btn-confirm-point-payment"
                onClick={handlePointPayment}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-black text-base rounded shadow flex items-center justify-center gap-2 tracking-wide"
              >
                <Coins size={18} />
                <span>포인트 전액 결제 (₩ {amountDue.toLocaleString()})</span>
              </button>
            )}

            {activeMethod === 'EASYPAY' && (
              <button
                id="btn-confirm-easypay-payment"
                onClick={handleEasyPayPayment}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-base rounded shadow flex items-center justify-center gap-2 tracking-wide"
              >
                <Smartphone size={18} />
                <span>{selectedEasyPay} 결제 승인 (₩ {amountDue.toLocaleString()})</span>
              </button>
            )}

            {activeMethod === 'SPLIT' && (
              <button
                id="btn-confirm-split-payment"
                onClick={handleSplitPayment}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-base rounded shadow flex items-center justify-center gap-2 tracking-wide"
              >
                <Split size={18} />
                <span>복합 결제 승인 완료</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
