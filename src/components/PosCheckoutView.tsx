import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { MenuCategory, MenuItem } from '../types';
import { playKeypadBeep } from '../utils/audio';
import { CreditCard, Printer, Receipt, Banknote, Sparkles } from 'lucide-react';

export const PosCheckoutView: React.FC = () => {
  const {
    menuItems,
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    updateCartItemQty,
    updateCartItemDiscount,
    cartTable,
    setCartTable,
    cartOrderType,
    setCartOrderType,
    completePayment,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    setIsReceiptModalOpen,
    tables,
    orders,
    soundEnabled,
    showToast
  } = usePos();

  // Category filter
  const categories: MenuCategory[] = ['DRINK', 'DOUGNUT', 'TEA', 'FRIED', 'DESERT'];
  const [activeCategory, setActiveCategory] = useState<MenuCategory>('DRINK');

  // Selected row in cart table for editing
  const [selectedCartItemId, setSelectedCartItemId] = useState<string | null>(null);

  // Bottom-Left subtab
  const [bottomTab, setBottomTab] = useState<'결제정보' | '결제내역' | '회원정보'>('결제정보');

  // Keypad buffer for cash input / quantity
  const [keypadBuffer, setKeypadBuffer] = useState<string>('');
  const [receivedCash, setReceivedCash] = useState<number>(0);

  // Member info state
  const [memberPhone, setMemberPhone] = useState('');
  const [memberPoints, setMemberPoints] = useState(0);

  // Quantity modal / discount modal
  const [isQtyModalOpen, setIsQtyModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [customDiscountVal, setCustomDiscountVal] = useState<number>(1000);
  const [isSplitPayModalOpen, setIsSplitPayModalOpen] = useState(false);
  const [splitCashAmount, setSplitCashAmount] = useState<number>(0);

  // Filter menu items by active category
  const filteredMenuItems = menuItems.filter(
    (m) => m.category === activeCategory || (activeCategory === 'DRINK' && m.category === '음료')
  );

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalDiscount = cart.reduce((sum, item) => sum + item.discount * item.quantity, 0);
  const amountDue = Math.max(0, subtotal - totalDiscount);
  const changeRemaining = receivedCash > 0 ? Math.max(0, receivedCash - amountDue) : 0;

  const handleKeypadPress = (val: string) => {
    if (soundEnabled) playKeypadBeep();
    if (val === 'C') {
      setKeypadBuffer('');
      setReceivedCash(0);
    } else {
      const newBuf = keypadBuffer + val;
      setKeypadBuffer(newBuf);
      setReceivedCash(Number(newBuf) || 0);
    }
  };

  const handleOpenPaymentModal = () => {
    if (cart.length === 0) {
      showToast('주문 항목이 비어있습니다. 메뉴를 먼저 선택해주세요.');
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const handleEnterKey = () => {
    if (soundEnabled) playKeypadBeep();
    if (selectedCartItemId && keypadBuffer) {
      const num = Number(keypadBuffer);
      if (num > 0) {
        updateCartItemQty(selectedCartItemId, num);
        showToast(`수량이 ${num}개로 변경되었습니다.`);
        setKeypadBuffer('');
      }
    } else if (keypadBuffer) {
      setReceivedCash(Number(keypadBuffer));
      showToast(`받은 금액: ${Number(keypadBuffer).toLocaleString()}원 입력 완료`);
      setKeypadBuffer('');
    } else if (cart.length > 0) {
      // Direct payment flow on Enter keypress
      handleOpenPaymentModal();
    }
  };

  const handleRemoveSelected = () => {
    if (selectedCartItemId) {
      removeFromCart(selectedCartItemId);
      setSelectedCartItemId(null);
    } else {
      showToast('삭제할 항목을 먼저 선택해주세요.');
    }
  };

  const handleApplyDiscount = () => {
    if (!selectedCartItemId) {
      showToast('할인을 적용할 품목을 선택해주세요.');
      return;
    }
    setIsDiscountModalOpen(true);
  };

  const handlePayment = (method: '주문' | '현금' | '신용카드' | '복합결제' | '단순현금' | '서비스') => {
    if (cart.length === 0) {
      showToast('주문 항목이 비어있습니다. 메뉴를 선택해주세요.');
      return;
    }

    if (method === '현금' && receivedCash < amountDue) {
      // Auto-assume received cash equals amount due if not typed
      completePayment('현금', amountDue);
    } else if (method === '복합결제') {
      setSplitCashAmount(Math.floor(amountDue / 2));
      setIsSplitPayModalOpen(true);
    } else if (method === '서비스') {
      // Apply 100% discount
      cart.forEach((it) => updateCartItemDiscount(it.id, it.unitPrice));
      completePayment('서비스', 0);
    } else if (method === '단순현금') {
      completePayment('단순현금', amountDue);
    } else if (method === '주문') {
      completePayment('후불', 0);
    } else {
      completePayment(method, receivedCash > 0 ? receivedCash : amountDue);
    }

    setKeypadBuffer('');
    setReceivedCash(0);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 flex flex-col gap-4 select-none min-h-[calc(100vh-80px)]">
      {/* Top Banner: Active Table / Order Type selector */}
      <div className="bg-[#4d94d8] text-white px-4 py-2 rounded flex items-center justify-between border-2 border-[#2b71b8] shadow-sm">
        <div className="flex items-center gap-3">
          <span className="font-black text-lg">
            {cartTable ? `[${cartTable.name} 테이블 주문/계산]` : '[카운터 현장 주문]'}
          </span>
          {cartTable && (
            <button
              onClick={() => setCartTable(null)}
              className="text-xs bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded font-bold"
            >
              테이블 해제 (포장/카운터로 전환)
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCartOrderType('매장')}
            className={`px-4 py-1 rounded text-sm font-bold transition-all ${
              cartOrderType === '매장' ? 'bg-[#1b5c9c] text-white shadow' : 'bg-white/20 text-white'
            }`}
          >
            매장식사
          </button>
          <button
            onClick={() => setCartOrderType('포장')}
            className={`px-4 py-1 rounded text-sm font-bold transition-all ${
              cartOrderType === '포장' ? 'bg-[#1b5c9c] text-white shadow' : 'bg-white/20 text-white'
            }`}
          >
            포장테이크아웃
          </button>
        </div>
      </div>

      {/* Main Split: Top (Order Cart & Menu Grid) + Bottom (Payment Info, Keypad, Tender buttons) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Top-Left: Order Cart Table (col-span-5) */}
        <div className="lg:col-span-5 flex flex-col border-2 border-[#2b71b8] bg-white shadow-sm h-[380px]">
          {/* Table Header */}
          <div className="grid grid-cols-12 bg-[#2977ca] text-white text-center font-bold text-xs py-2 border-b border-[#2b71b8]">
            <div className="col-span-1 border-r border-blue-400">No.</div>
            <div className="col-span-4 border-r border-blue-400">메뉴명</div>
            <div className="col-span-2 border-r border-blue-400">단가</div>
            <div className="col-span-1 border-r border-blue-400">수량</div>
            <div className="col-span-2 border-r border-blue-400">할인</div>
            <div className="col-span-2">금액</div>
          </div>

          {/* Cart Table Rows */}
          <div className="flex-1 divide-y divide-slate-100 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
                우측 메뉴판에서 메뉴를 터치하여 등록하세요.
              </div>
            ) : (
              cart.map((item, idx) => {
                const isSelected = selectedCartItemId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedCartItemId(isSelected ? null : item.id)}
                    className={`grid grid-cols-12 text-center text-xs py-2 px-1 cursor-pointer transition-colors items-center ${
                      isSelected ? 'bg-blue-100 font-bold text-blue-900 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="col-span-1 font-mono text-slate-500">{idx + 1}</div>
                    <div className="col-span-4 text-left font-bold text-slate-800 truncate px-1">
                      {item.name}
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {item.selectedOptions.join(', ')}
                        </span>
                      )}
                    </div>
                    <div className="col-span-2 text-slate-600 font-mono">
                      {item.unitPrice.toLocaleString()}
                    </div>
                    <div className="col-span-1 font-bold text-blue-700 font-mono">
                      {item.quantity}
                    </div>
                    <div className="col-span-2 text-rose-600 font-mono">
                      {item.discount > 0 ? `-${(item.discount * item.quantity).toLocaleString()}` : '-'}
                    </div>
                    <div className="col-span-2 font-bold text-slate-900 font-mono">
                      {item.totalPrice.toLocaleString()}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Cart Summary Row */}
          <div className="bg-[#4d94d8] text-white p-3 border-t-2 border-[#2b71b8] flex justify-between items-center font-bold">
            <span className="text-base">계:</span>
            <span className="text-2xl font-black font-mono tracking-tight">
              ₩ {amountDue.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Center Actions Column (col-span-1) */}
        <div className="lg:col-span-1 flex flex-col justify-between gap-1.5">
          <button
            id="btn-pos-pay-primary"
            onClick={handleOpenPaymentModal}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs md:text-sm py-2 rounded-none shadow transition-all active:scale-95 flex flex-col items-center justify-center text-center leading-tight gap-1 border-2 border-emerald-400"
          >
            <CreditCard size={15} />
            <span>결제하기</span>
          </button>
          <button
            id="btn-pos-clear-all"
            onClick={clearCart}
            className="flex-1 bg-[#2977ca] hover:bg-[#1f63ab] text-white font-bold text-xs md:text-sm py-1.5 rounded-none shadow transition-all active:scale-95 flex items-center justify-center text-center leading-tight"
          >
            전체취소
          </button>
          <button
            id="btn-pos-clear-selected"
            onClick={handleRemoveSelected}
            className="flex-1 bg-[#2977ca] hover:bg-[#1f63ab] text-white font-bold text-xs md:text-sm py-1.5 rounded-none shadow transition-all active:scale-95 flex items-center justify-center text-center leading-tight"
          >
            선택취소
          </button>
          <button
            id="btn-pos-discount"
            onClick={handleApplyDiscount}
            className="flex-1 bg-[#2977ca] hover:bg-[#1f63ab] text-white font-bold text-xs md:text-sm py-1.5 rounded-none shadow transition-all active:scale-95 flex items-center justify-center text-center leading-tight"
          >
            할인처리
          </button>
          <button
            id="btn-pos-qty-change"
            onClick={() => {
              if (!selectedCartItemId) {
                showToast('수량을 변경할 항목을 먼저 선택해주세요.');
                return;
              }
              setIsQtyModalOpen(true);
            }}
            className="flex-1 bg-[#2977ca] hover:bg-[#1f63ab] text-white font-bold text-xs md:text-sm py-1.5 rounded-none shadow transition-all active:scale-95 flex items-center justify-center text-center leading-tight"
          >
            수량변경
          </button>
        </div>

        {/* Top-Right: Menu Grid Catalog (col-span-6) */}
        <div className="lg:col-span-6 flex flex-col border-2 border-[#2b71b8] bg-white shadow-sm h-[380px]">
          {/* Category Tabs (DRINK, DOUGNUT, TEA, FRIED, DESERT) */}
          <div className="grid grid-cols-5 bg-[#1b5c9c] text-white font-bold text-center border-b border-[#2b71b8]">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`py-2 text-xs md:text-sm transition-all border-r border-[#2b71b8] last:border-r-0 ${
                  activeCategory === cat
                    ? 'bg-[#2977ca] text-white font-black shadow-inner'
                    : 'text-slate-200 hover:bg-[#2069b0]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Items Grid Tiles */}
          <div className="flex-1 p-3 grid grid-cols-3 sm:grid-cols-4 gap-2.5 overflow-y-auto bg-slate-50/50">
            {filteredMenuItems.map((menu) => (
              <button
                key={menu.id}
                onClick={() => addToCart(menu)}
                className="h-24 bg-white border-2 border-[#2b71b8] p-2 flex flex-col justify-between text-left hover:bg-blue-50 transition-transform active:scale-95 shadow-sm group"
              >
                <div className="font-black text-slate-800 text-xs md:text-sm line-clamp-2 leading-tight group-hover:text-blue-700">
                  {menu.name}
                </div>
                <div className="text-right font-black font-mono text-[#1b5c9c] text-sm md:text-base">
                  {menu.price.toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Half: Payment Info + Keypad + Tenders (Matches Slide 8 bottom half) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Bottom-Left: Tabs (결제정보 | 결제내역 | 회원정보) (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col border-2 border-[#2b71b8] bg-white shadow-sm p-3">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-blue-200 pb-2">
            {(['결제정보', '결제내역', '회원정보'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setBottomTab(t)}
                className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                  bottomTab === t
                    ? 'bg-[#2977ca] text-white shadow-sm'
                    : 'bg-blue-50 text-[#1b5c9c] hover:bg-blue-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab 1: 결제정보 Content */}
          {bottomTab === '결제정보' && (
            <div className="flex flex-col gap-2.5 mt-3 text-sm">
              <div className="flex justify-between items-center border-b border-blue-100 pb-1">
                <span className="font-bold text-slate-600">전체 금액</span>
                <span className="font-black font-mono text-base text-slate-900">
                  {subtotal.toLocaleString()} 원
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-blue-100 pb-1">
                <span className="font-bold text-slate-600">할인 금액</span>
                <span className="font-black font-mono text-base text-rose-600">
                  {totalDiscount > 0 ? `-${totalDiscount.toLocaleString()}` : '0'} 원
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-blue-200 pb-1">
                <span className="font-black text-blue-900">받을 금액</span>
                <span className="font-black font-mono text-lg text-blue-900">
                  {amountDue.toLocaleString()} 원
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-blue-100 pb-1">
                <span className="font-bold text-slate-600">받은 금액</span>
                <span className="font-black font-mono text-base text-emerald-700">
                  {receivedCash.toLocaleString()} 원
                </span>
              </div>
              <div className="flex justify-between items-center pb-1">
                <span className="font-bold text-slate-600">남는 잔액</span>
                <span className="font-black font-mono text-lg text-amber-600">
                  {changeRemaining.toLocaleString()} 원
                </span>
              </div>
            </div>
          )}

          {/* Tab 2: 결제내역 */}
          {bottomTab === '결제내역' && (
            <div className="mt-3 text-xs text-slate-600 space-y-2 flex-1">
              {orders.length > 0 ? (
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-800">최근 승인 내역 ({orders[0].orderNumber})</div>
                  <div>결제수단: {orders[0].paymentMethod || '카드'}</div>
                  <div>결제금액: {orders[0].totalAmount.toLocaleString()}원</div>
                  {orders[0].approvalNumber && <div>승인번호: {orders[0].approvalNumber}</div>}
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 text-center pt-8">
                  최근 완료된 결제 승인 내역이 없습니다.
                </div>
              )}
            </div>
          )}

          {/* Tab 3: 회원정보 */}
          {bottomTab === '회원정보' && (
            <div className="mt-3 text-xs flex flex-col gap-2.5">
              <div>
                <label className="font-bold text-slate-700 block mb-1">회원 전화번호 조회</label>
                <input
                  type="text"
                  value={memberPhone}
                  onChange={(e) => setMemberPhone(e.target.value)}
                  className="w-full border rounded px-2 py-1 text-sm font-mono"
                />
              </div>
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded">
                <div className="flex justify-between font-bold text-blue-900">
                  <span>보유 적립 포인트</span>
                  <span>{memberPoints.toLocaleString()} P</span>
                </div>
                <button
                  onClick={() => {
                    if (memberPoints >= 1000) {
                      cart.forEach((it) => updateCartItemDiscount(it.id, 1000));
                      setMemberPoints((prev) => prev - 1000);
                      showToast('1,000 포인트 사용 할인이 적용되었습니다.');
                    } else {
                      showToast('포인트는 1,000P 이상부터 사용 가능합니다.');
                    }
                  }}
                  className="mt-2 w-full py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs"
                >
                  1,000 포인트 사용하기
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom-Center: Keypad (col-span-3) */}
        <div className="lg:col-span-3 flex flex-col border-2 border-[#2b71b8] bg-white shadow-sm p-3">
          {/* Keypad Display Box */}
          <div className="h-10 bg-slate-50 border-2 border-[#2b71b8] rounded-full px-3 flex items-center justify-end font-mono font-bold text-lg text-slate-800 mb-2 overflow-hidden">
            {keypadBuffer || '0'}
          </div>

          {/* Keypad Buttons Grid + ENTER */}
          <div className="grid grid-cols-4 gap-1.5 flex-1">
            {/* 7, 8, 9 */}
            <button onClick={() => handleKeypadPress('7')} className="keypad-btn">7</button>
            <button onClick={() => handleKeypadPress('8')} className="keypad-btn">8</button>
            <button onClick={() => handleKeypadPress('9')} className="keypad-btn">9</button>
            {/* ENTER Button (spanning 4 rows on right) */}
            <button
              onClick={handleEnterKey}
              className="row-span-4 bg-[#2977ca] hover:bg-[#1f63ab] text-white font-black text-sm rounded flex flex-col items-center justify-center shadow transition-all active:scale-95"
            >
              <span>E</span>
              <span>N</span>
              <span>T</span>
              <span>E</span>
              <span>R</span>
            </button>

            {/* 4, 5, 6 */}
            <button onClick={() => handleKeypadPress('4')} className="keypad-btn">4</button>
            <button onClick={() => handleKeypadPress('5')} className="keypad-btn">5</button>
            <button onClick={() => handleKeypadPress('6')} className="keypad-btn">6</button>

            {/* 1, 2, 3 */}
            <button onClick={() => handleKeypadPress('1')} className="keypad-btn">1</button>
            <button onClick={() => handleKeypadPress('2')} className="keypad-btn">2</button>
            <button onClick={() => handleKeypadPress('3')} className="keypad-btn">3</button>

            {/* 0, 00, C */}
            <button onClick={() => handleKeypadPress('0')} className="keypad-btn">0</button>
            <button onClick={() => handleKeypadPress('00')} className="keypad-btn text-sm">00</button>
            <button onClick={() => handleKeypadPress('C')} className="keypad-btn text-rose-600">C</button>
          </div>
        </div>

        {/* Small Action Column next to keypad (col-span-1) */}
        <div className="lg:col-span-1 flex flex-col justify-between gap-2">
          <button
            onClick={() => {
              setCartOrderType(cartOrderType === '매장' ? '포장' : '매장');
              showToast(`주문 방식이 '${cartOrderType === '매장' ? '포장' : '매장'}'(으)로 변경되었습니다.`);
            }}
            className="flex-1 bg-[#2977ca] hover:bg-[#1f63ab] text-white font-bold text-sm rounded shadow flex items-center justify-center"
          >
            {cartOrderType === '매장' ? '포장' : '매장'}
          </button>
          <button
            onClick={() => {
              if (soundEnabled) playKeypadBeep();
              showToast('돈통(금전등록기)이 열렸습니다. (환전 모드)');
            }}
            className="flex-1 bg-[#2977ca] hover:bg-[#1f63ab] text-white font-bold text-sm rounded shadow flex items-center justify-center"
          >
            환전
          </button>
          <button
            id="btn-reprint-receipt"
            onClick={() => {
              if (soundEnabled) playKeypadBeep();
              setIsReceiptModalOpen(true);
            }}
            className="flex-1 bg-[#2977ca] hover:bg-[#1f63ab] text-white font-bold text-xs rounded shadow flex flex-col items-center justify-center text-center leading-tight gap-0.5"
            title="영수증 발행 및 프린터 인쇄"
          >
            <Printer size={14} />
            <span>영수증발행</span>
          </button>
        </div>

        {/* Bottom-Right: Tall Payment Method Buttons (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-2">
          {/* Main Primary 결제하기 Button */}
          <button
            id="btn-pos-main-pay"
            onClick={handleOpenPaymentModal}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm md:text-base rounded-none shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 border-2 border-emerald-400 tracking-wider"
          >
            <CreditCard size={18} className="text-yellow-200" />
            <span>결제하기 (현금 / 카드 / 포인트 수단 선택)</span>
          </button>

          <div className="grid grid-cols-6 gap-2 flex-1 h-36">
            {/* 주문 (주방전송/후불) */}
            <button
              id="btn-tender-order"
              onClick={() => handlePayment('주문')}
              className="col-span-1 bg-[#2977ca] hover:bg-[#1f63ab] text-white font-black text-xs md:text-sm rounded-none shadow transition-all active:scale-95 flex items-center justify-center tracking-wider"
            >
              주문
            </button>

            {/* 현금 */}
            <button
              id="btn-tender-cash"
              onClick={handleOpenPaymentModal}
              className="col-span-1 bg-[#2977ca] hover:bg-[#1f63ab] text-white font-black text-xs md:text-sm rounded-none shadow transition-all active:scale-95 flex items-center justify-center tracking-wider"
            >
              현금
            </button>

            {/* 신용카드 */}
            <button
              id="btn-tender-card"
              onClick={handleOpenPaymentModal}
              className="col-span-1 bg-[#2977ca] hover:bg-[#1f63ab] text-white font-black text-xs md:text-sm rounded-none shadow transition-all active:scale-95 flex flex-col items-center justify-center text-center tracking-wider"
            >
              <span>신용</span>
              <span>카드</span>
            </button>

            {/* 복합결제 */}
            <button
              id="btn-tender-split"
              onClick={handleOpenPaymentModal}
              className="col-span-1 bg-[#2977ca] hover:bg-[#1f63ab] text-white font-black text-xs md:text-sm rounded-none shadow transition-all active:scale-95 flex flex-col items-center justify-center text-center tracking-wider"
            >
              <span>복합</span>
              <span>결제</span>
            </button>

            {/* 단순현금 & 서비스 column */}
            <div className="col-span-2 flex flex-col gap-2">
              <button
                id="btn-tender-simple-cash"
                onClick={() => handlePayment('단순현금')}
                className="flex-1 bg-[#2977ca] hover:bg-[#1f63ab] text-white font-black text-xs md:text-sm rounded-none shadow transition-all active:scale-95 flex items-center justify-center"
              >
                단순현금
              </button>
              <button
                id="btn-tender-service"
                onClick={() => handlePayment('서비스')}
                className="flex-1 bg-[#2977ca] hover:bg-[#1f63ab] text-white font-black text-xs md:text-sm rounded-none shadow transition-all active:scale-95 flex items-center justify-center"
              >
                서비스
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quantity Change Modal */}
      {isQtyModalOpen && selectedCartItemId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-xs w-full p-5 border-2 border-blue-500">
            <h4 className="text-base font-bold text-slate-800 mb-3">수량 변경</h4>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    updateCartItemQty(selectedCartItemId, q);
                    setIsQtyModalOpen(false);
                    showToast(`수량이 ${q}개로 변경되었습니다.`);
                  }}
                  className="py-3 bg-slate-100 hover:bg-blue-600 hover:text-white font-bold rounded font-mono text-lg transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsQtyModalOpen(false)}
              className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded text-sm"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {isDiscountModalOpen && selectedCartItemId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-xs w-full p-5 border-2 border-blue-500">
            <h4 className="text-base font-bold text-slate-800 mb-3">할인 금액 지정</h4>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[500, 1000, 1500, 2000].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    updateCartItemDiscount(selectedCartItemId, d);
                    setIsDiscountModalOpen(false);
                    showToast(`${d.toLocaleString()}원 할인이 적용되었습니다.`);
                  }}
                  className="py-2.5 bg-blue-50 hover:bg-blue-600 hover:text-white font-bold rounded font-mono text-sm text-blue-900 border border-blue-200 transition-colors"
                >
                  -{d.toLocaleString()}원
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  updateCartItemDiscount(selectedCartItemId, 0);
                  setIsDiscountModalOpen(false);
                  showToast('할인이 초기화되었습니다.');
                }}
                className="flex-1 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold rounded text-xs"
              >
                할인 초기화
              </button>
              <button
                onClick={() => setIsDiscountModalOpen(false)}
                className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded text-xs"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Split Payment Modal */}
      {isSplitPayModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-5 border-2 border-blue-500">
            <h4 className="text-base font-bold text-slate-800 mb-2">복합 결제 (현금 + 카드)</h4>
            <div className="p-3 bg-slate-50 rounded mb-3 text-sm">
              <div className="flex justify-between font-bold">
                <span>총 결제금액</span>
                <span className="font-mono text-blue-800">₩{amountDue.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 mb-4 text-xs">
              <label className="font-bold text-slate-700">현금 결제 금액</label>
              <input
                type="number"
                value={splitCashAmount}
                onChange={(e) => setSplitCashAmount(Number(e.target.value))}
                className="border rounded px-3 py-2 text-base font-mono font-bold"
              />
              <div className="flex justify-between text-slate-600 font-bold pt-1">
                <span>카드 승인 잔액:</span>
                <span className="font-mono text-emerald-700 font-black">
                  ₩{Math.max(0, amountDue - splitCashAmount).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsSplitPayModalOpen(false)}
                className="flex-1 py-2 bg-slate-200 text-slate-700 font-bold rounded text-sm"
              >
                취소
              </button>
              <button
                onClick={() => {
                  completePayment('복합결제', splitCashAmount);
                  setIsSplitPayModalOpen(false);
                }}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-sm"
              >
                결제 승인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
