import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { MenuCategory, MenuItem } from '../types';
import { playKeypadBeep, playPosBeep } from '../utils/audio';
import { CreditCard, Printer, Receipt, Banknote, Sparkles, Sliders, Check } from 'lucide-react';

export const PosCheckoutView: React.FC = () => {
  const {
    menuItems,
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    updateCartItemQty,
    updateCartItemDiscount,
    updateCartItemRemark,
    updateCartItemOptions,
    cartTable,
    setCartTable,
    cartOrderType,
    setCartOrderType,
    takeoutPackaging,
    setTakeoutPackaging,
    takeoutPackagingFee,
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
  const categories: MenuCategory[] = ['DRINK', 'DOUGNUT', 'TEA', 'ICE CREAM', 'DESERT'];
  const [activeCategory, setActiveCategory] = useState<MenuCategory>('DRINK');

  // Selected row in cart table for editing
  const [selectedCartItemId, setSelectedCartItemId] = useState<string | null>(null);
  const selectedCartItem = cart.find((it) => it.id === selectedCartItemId);

  // Bottom-Left subtab
  const [bottomTab, setBottomTab] = useState<'결제정보' | '결제내역' | '회원정보'>('결제정보');

  // Keypad buffer for cash input / quantity
  const [keypadBuffer, setKeypadBuffer] = useState<string>('');
  const [receivedCash, setReceivedCash] = useState<number>(0);

  // Member info state
  const [memberPhone, setMemberPhone] = useState('');
  const [memberPoints, setMemberPoints] = useState(0);

  // Quantity modal / discount modal / option modal
  const [isQtyModalOpen, setIsQtyModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [customDiscountVal, setCustomDiscountVal] = useState<number>(1000);
  const [isSplitPayModalOpen, setIsSplitPayModalOpen] = useState(false);
  const [splitCashAmount, setSplitCashAmount] = useState<number>(0);

  // Direct Menu Item Click Option Modal (e.g. 아이스크림 컵/콘 누를 때 옵션 선택)
  const [pendingOptionMenu, setPendingOptionMenu] = useState<MenuItem | null>(null);
  const [itemOptionSelections, setItemOptionSelections] = useState<string[]>([]);

  // Option modal state (for editing existing cart item)
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [tempSelectedOptions, setTempSelectedOptions] = useState<string[]>([]);
  const [customOptionName, setCustomOptionName] = useState('');
  const [customOptionPrice, setCustomOptionPrice] = useState(500);

  // Filter menu items by active category
  const filteredMenuItems = menuItems.filter(
    (m) => m.category === activeCategory || (activeCategory === 'DRINK' && m.category === '음료')
  );

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalDiscount = cart.reduce((sum, item) => sum + item.discount * item.quantity, 0);
  const packagingFee = cartOrderType === '포장' && takeoutPackaging === '캐리어' ? 1000 : 0;
  const amountDue = Math.max(0, subtotal - totalDiscount + packagingFee);
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

  const handleOpenOptionModal = () => {
    let targetId = selectedCartItemId;
    if (!targetId && cart.length === 1) {
      targetId = cart[0].id;
      setSelectedCartItemId(targetId);
    }
    if (!targetId) {
      showToast('옵션을 추가할 항목을 장바구니에서 먼저 선택해주세요.');
      return;
    }
    const item = cart.find((c) => c.id === targetId);
    setTempSelectedOptions(item?.selectedOptions ? [...item.selectedOptions] : []);
    setIsOptionModalOpen(true);
  };

  const handleToggleOption = (optName: string) => {
    if (tempSelectedOptions.includes(optName)) {
      setTempSelectedOptions(tempSelectedOptions.filter((o) => o !== optName));
    } else {
      setTempSelectedOptions([...tempSelectedOptions, optName]);
    }
  };

  // Direct Menu Item Click Handler (opens option modal if item has options)
  const handleMenuItemClick = (menu: MenuItem) => {
    if (menu.hasOptions && menu.options && menu.options.length > 0) {
      setPendingOptionMenu(menu);
      setItemOptionSelections([]);
    } else {
      addToCart(menu);
    }
  };

  const handleToggleItemOption = (optName: string) => {
    if (itemOptionSelections.includes(optName)) {
      setItemOptionSelections(itemOptionSelections.filter((o) => o !== optName));
    } else {
      setItemOptionSelections([...itemOptionSelections, optName]);
    }
  };

  const calculateItemOptionAddedPrice = (menu: MenuItem | null, selected: string[]) => {
    if (!menu) return 0;
    let sum = 0;
    selected.forEach((optName) => {
      const opt = menu.options?.find((o) => o.name === optName);
      if (opt !== undefined) {
        sum += opt.price;
      } else if (optName === '딸기맛 추가') {
        sum += 0;
      } else if (optName === '초코맛 추가') {
        sum += 500;
      } else if (optName === '초코웨이퍼 추가' || optName === '체리 토핑 추가') {
        sum += 700;
      } else if (optName.includes('사이즈 업')) {
        sum += 1000;
      } else if (optName.includes('추가') || optName.includes('변경')) {
        sum += 500;
      }
    });
    return sum;
  };

  const handleConfirmItemOptions = (withOptions: boolean) => {
    if (!pendingOptionMenu) return;
    const opts = withOptions ? itemOptionSelections : [];
    addToCart(pendingOptionMenu, opts);
    if (opts.length > 0) {
      showToast(`'${pendingOptionMenu.name}' (${opts.join(', ')}) 장바구니에 담겼습니다.`);
    } else {
      showToast(`'${pendingOptionMenu.name}' 장바구니에 담겼습니다.`);
    }
    setPendingOptionMenu(null);
    setItemOptionSelections([]);
  };

  const handleSaveOptions = () => {
    if (!selectedCartItemId) return;
    const item = cart.find((c) => c.id === selectedCartItemId);
    if (!item) return;

    const baseMenu = menuItems.find((m) => m.id === item.menuId);
    let addedPrice = 0;

    tempSelectedOptions.forEach((optName) => {
      const menuOpt = baseMenu?.options?.find((o) => o.name === optName);
      if (menuOpt !== undefined) {
        addedPrice += menuOpt.price;
      } else if (optName === '딸기맛 추가') {
        addedPrice += 0;
      } else if (optName === '초코맛 추가') {
        addedPrice += 500;
      } else if (optName === '초코웨이퍼 추가' || optName === '체리 토핑 추가') {
        addedPrice += 700;
      } else if (optName.includes('사이즈 업')) {
        addedPrice += 1000;
      } else if (optName.includes('텀블러 할인')) {
        addedPrice -= 300;
      } else if (optName.includes('추가') || optName.includes('변경')) {
        addedPrice += 500;
      }
    });

    updateCartItemOptions(selectedCartItemId, tempSelectedOptions, addedPrice);
    setIsOptionModalOpen(false);
    showToast(`'${item.name}'의 옵션이 저장되었습니다.`);
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

          {cartOrderType === '포장' && (
            <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-xs px-2 py-0.5 rounded border border-white/30 text-xs">
              <span className="font-bold text-white text-[11px]">포장재:</span>
              <button
                type="button"
                onClick={() => {
                  if (soundEnabled) playPosBeep();
                  setTakeoutPackaging('일회용비닐');
                  showToast('포장 부자재: 일회용비닐 (+0원) 선택');
                }}
                className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${
                  takeoutPackaging === '일회용비닐'
                    ? 'bg-white text-[#1b5c9c] shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                일회용비닐 (+0원)
              </button>
              <button
                type="button"
                onClick={() => {
                  if (soundEnabled) playPosBeep();
                  setTakeoutPackaging('캐리어');
                  showToast('포장 부자재: 캐리어 (+1,000원) 선택');
                }}
                className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${
                  takeoutPackaging === '캐리어'
                    ? 'bg-amber-300 text-amber-950 shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                캐리어 (+1000원)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Split: Top (Order Cart & Menu Grid) + Bottom (Payment Info, Keypad, Tender buttons) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Top-Left: Order Cart Table (col-span-5) */}
        <div className="lg:col-span-5 flex flex-col border-2 border-[#2b71b8] bg-white shadow-sm h-[380px]">
          {/* Table Header: No. | 메뉴명 | 단가 | 수량 | 할인 | 금액 | 비고 */}
          <div className="grid grid-cols-12 bg-[#2977ca] text-white text-center font-bold text-xs py-2 border-b border-[#2b71b8]">
            <div className="col-span-1 border-r border-blue-400">No.</div>
            <div className="col-span-3 border-r border-blue-400">메뉴명</div>
            <div className="col-span-2 border-r border-blue-400">단가</div>
            <div className="col-span-1 border-r border-blue-400">수량</div>
            <div className="col-span-1 border-r border-blue-400">할인</div>
            <div className="col-span-2 border-r border-blue-400">금액</div>
            <div className="col-span-2">비고</div>
          </div>

          {/* Cart Table Rows */}
          <div className="flex-1 divide-y divide-slate-100 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium px-4 text-center">
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
                    <div className="col-span-3 text-left font-bold text-slate-800 truncate px-1">
                      {item.name}
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <span className="block text-[10px] text-blue-600 font-normal truncate">
                          +{item.selectedOptions.join(', ')}
                        </span>
                      )}
                    </div>
                    <div className="col-span-2 text-slate-600 font-mono">
                      {item.unitPrice.toLocaleString()}
                    </div>
                    <div className="col-span-1 font-bold text-blue-700 font-mono">
                      {item.quantity}
                    </div>
                    <div className="col-span-1 text-rose-600 font-mono">
                      {item.discount > 0 ? `-${(item.discount * item.quantity).toLocaleString()}` : '-'}
                    </div>
                    <div className="col-span-2 font-bold text-slate-900 font-mono">
                      {item.totalPrice.toLocaleString()}
                    </div>
                    <div className="col-span-2 px-0.5 flex items-center justify-center">
                      {item.remark ? (
                        <span className="bg-[#2977ca] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap truncate max-w-full">
                          {item.remark}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
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
        <div className="lg:col-span-1 flex lg:flex-col justify-between gap-1.5">
          <button
            id="btn-pos-pay-primary"
            onClick={handleOpenPaymentModal}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2 rounded-none shadow transition-all active:scale-95 flex flex-col items-center justify-center text-center leading-tight gap-1 border-2 border-emerald-400"
          >
            <CreditCard size={15} />
            <span>결제하기</span>
          </button>
          <button
            id="btn-pos-clear-all"
            onClick={clearCart}
            className="flex-1 bg-[#2977ca] hover:bg-[#1f63ab] text-white font-bold text-xs py-1.5 rounded-none shadow transition-all active:scale-95 flex items-center justify-center text-center leading-tight"
          >
            전체취소
          </button>
          <button
            id="btn-pos-clear-selected"
            onClick={handleRemoveSelected}
            className="flex-1 bg-[#2977ca] hover:bg-[#1f63ab] text-white font-bold text-xs py-1.5 rounded-none shadow transition-all active:scale-95 flex items-center justify-center text-center leading-tight"
          >
            선택취소
          </button>
          <button
            id="btn-pos-discount"
            onClick={handleApplyDiscount}
            className="flex-1 bg-[#2977ca] hover:bg-[#1f63ab] text-white font-bold text-xs py-1.5 rounded-none shadow transition-all active:scale-95 flex items-center justify-center text-center leading-tight"
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
            className="flex-1 bg-[#2977ca] hover:bg-[#1f63ab] text-white font-bold text-xs py-1.5 rounded-none shadow transition-all active:scale-95 flex items-center justify-center text-center leading-tight"
          >
            수량변경
          </button>
          {/* 옵션추가 버튼 (수량변경 바로 밑) */}
          <button
            id="btn-pos-add-option"
            onClick={handleOpenOptionModal}
            className="flex-1 bg-[#1b5c9c] hover:bg-[#154677] text-white font-bold text-xs py-1.5 rounded-none shadow transition-all active:scale-95 flex items-center justify-center text-center leading-tight border border-blue-400"
          >
            옵션추가
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

          {/* Menu Items Grid Tiles - 가로가 긴 직사각형 */}
          <div className="flex-1 p-3 grid grid-cols-3 sm:grid-cols-4 gap-2.5 overflow-y-auto bg-slate-50/50">
            {filteredMenuItems.map((menu) => (
              <button
                key={menu.id}
                onClick={() => handleMenuItemClick(menu)}
                className="h-20 bg-white border-2 border-[#2b71b8] p-2.5 flex flex-col justify-between text-left hover:bg-blue-50 transition-transform active:scale-95 shadow-sm group relative"
              >
                <div className="font-black text-slate-800 text-xs md:text-sm line-clamp-2 leading-tight group-hover:text-blue-700">
                  {menu.name}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-xs md:text-sm font-black text-[#1b5c9c]">
                    {menu.price.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-1">
                    {menu.hasOptions && (
                      <span className="text-[9px] bg-blue-50 text-blue-700 border border-blue-200 px-1 py-0.5 rounded font-bold">
                        옵션
                      </span>
                    )}
                    {menu.remark && (
                      <span className="text-[9px] bg-blue-100 text-blue-800 px-1 py-0.5 rounded font-bold">
                        {menu.remark}
                      </span>
                    )}
                  </div>
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
              {cartOrderType === '포장' && (
                <div className="flex justify-between items-center border-b border-amber-200 pb-1 bg-amber-50/60 px-1 rounded">
                  <span className="font-bold text-amber-900 text-xs">
                    포장 부자재 ({takeoutPackaging})
                  </span>
                  <span className="font-black font-mono text-sm text-amber-900">
                    +{packagingFee.toLocaleString()} 원
                  </span>
                </div>
              )}
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

      {/* Direct Menu Item Option Selection Modal (아이스크림 등 메뉴 터치 시 옵션 선택창) */}
      {pendingOptionMenu && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 select-none">
          <div className="bg-white rounded-none shadow-2xl max-w-md w-full border-2 border-[#2b71b8] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-[#1b5c9c] text-white px-4 py-2.5 flex items-center justify-between border-b-2 border-[#2b71b8]">
              <div>
                <h4 className="text-base font-bold flex items-center gap-1.5">
                  <Sparkles size={16} className="text-yellow-300" />
                  <span>[{pendingOptionMenu.name}] 옵션 선택</span>
                </h4>
                <p className="text-[11px] text-blue-100">원하시는 맛 및 토핑 옵션을 선택하세요.</p>
              </div>
              <button
                onClick={() => {
                  setPendingOptionMenu(null);
                  setItemOptionSelections([]);
                }}
                className="text-white/80 hover:text-white hover:bg-white/20 rounded px-2 py-0.5 font-bold text-sm transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col gap-3.5 bg-slate-50/50">
              {/* Base Item Info */}
              <div className="flex items-center justify-between p-2.5 bg-white border border-blue-200 rounded">
                <span className="font-bold text-slate-800 text-sm">{pendingOptionMenu.name}</span>
                <span className="font-mono font-black text-sm text-[#1b5c9c]">
                  기본가: {pendingOptionMenu.price.toLocaleString()}원
                </span>
              </div>

              {/* Options List */}
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2 flex items-center justify-between">
                  <span>추가 가능한 옵션 ({pendingOptionMenu.options?.length || 0}개)</span>
                  <span className="text-[11px] font-normal text-slate-500">다중 선택 가능</span>
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {pendingOptionMenu.options?.map((opt) => {
                    const isSelected = itemOptionSelections.includes(opt.name);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleToggleItemOption(opt.name)}
                        className={`p-3 rounded border text-left transition-all flex flex-col justify-between gap-1.5 relative ${
                          isSelected
                            ? 'bg-[#1b5c9c] text-white border-blue-900 shadow-sm ring-2 ring-blue-400/50'
                            : 'bg-white hover:bg-blue-50/50 text-slate-800 border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-bold text-xs leading-tight">{opt.name}</span>
                          <span
                            className={`w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0 ${
                              isSelected ? 'bg-white text-blue-900 font-black' : 'border border-slate-300'
                            }`}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span
                            className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              isSelected ? 'bg-white/20 text-yellow-200' : 'bg-slate-100 text-[#1b5c9c]'
                            }`}
                          >
                            +{opt.price.toLocaleString()}원
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Options Summary & Total Price Calculation */}
              {(() => {
                const added = calculateItemOptionAddedPrice(pendingOptionMenu, itemOptionSelections);
                const finalTotal = pendingOptionMenu.price + added;

                return (
                  <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>기본 가격:</span>
                      <span className="font-mono font-bold">{pendingOptionMenu.price.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between text-xs text-blue-700">
                      <span>선택 옵션 ({itemOptionSelections.length}개):</span>
                      <span className="font-mono font-bold">+{added.toLocaleString()}원</span>
                    </div>
                    {itemOptionSelections.length > 0 && (
                      <div className="text-[11px] text-blue-800 bg-white p-1.5 rounded border border-blue-200">
                        {itemOptionSelections.join(', ')}
                      </div>
                    )}
                    <div className="border-t border-blue-200 pt-1.5 flex justify-between items-center">
                      <span className="font-black text-xs text-slate-800">최종 금액:</span>
                      <span className="font-black font-mono text-base text-[#1b5c9c]">
                        ₩ {finalTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Footer Buttons */}
            <div className="p-3 bg-white border-t border-slate-200 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setPendingOptionMenu(null);
                  setItemOptionSelections([]);
                }}
                className="py-2.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded text-xs transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => handleConfirmItemOptions(false)}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded text-xs border border-slate-300 transition-colors"
              >
                기본으로 담기
              </button>
              <button
                type="button"
                onClick={() => handleConfirmItemOptions(true)}
                className="flex-1 py-2.5 bg-[#2977ca] hover:bg-[#1f63ab] text-white font-black rounded text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>장바구니 담기</span>
                {itemOptionSelections.length > 0 && (
                  <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                    +{calculateItemOptionAddedPrice(pendingOptionMenu, itemOptionSelections).toLocaleString()}원
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Option Addition Modal (옵션추가 모달) */}
      {isOptionModalOpen && selectedCartItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-5 border-2 border-[#2b71b8] flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <Sliders size={18} className="text-[#2b71b8]" />
                  <span>[{selectedCartItem.name}] 옵션 추가</span>
                </h4>
                <p className="text-xs text-slate-500">메뉴관리에서 등록된 옵션 및 추가 옵션을 선택하세요.</p>
              </div>
              <button
                onClick={() => setIsOptionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            {(() => {
              const baseMenu = menuItems.find((m) => m.id === selectedCartItem.menuId);
              const customMenuOptions = baseMenu?.options || [];

              return (
                <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1">
                  {/* Menu-specific options registered in 메뉴관리 */}
                  {customMenuOptions.length > 0 && (
                    <div className="bg-blue-50/70 border border-blue-200 rounded p-2.5">
                      <span className="text-xs font-bold text-blue-900 block mb-1.5 flex items-center gap-1">
                        <Sparkles size={13} className="text-blue-600" />
                        <span>메뉴관리에서 등록된 옵션 ({customMenuOptions.length}개)</span>
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {customMenuOptions.map((opt) => {
                          const isChecked = tempSelectedOptions.includes(opt.name);
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleToggleOption(opt.name)}
                              className={`p-2 rounded border text-left text-xs flex items-center justify-between transition-all ${
                                isChecked
                                  ? 'bg-[#1b5c9c] text-white border-blue-800 font-bold shadow-sm'
                                  : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                              }`}
                            >
                              <span className="truncate pr-1">{opt.name}</span>
                              <span className="font-mono text-[11px] font-bold shrink-0">
                                +{opt.price.toLocaleString()}원
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Standard store options */}
                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-1.5">
                      매장 추천 기본 옵션
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { name: '샷 추가', price: 500 },
                        { name: '시럽 추가', price: 500 },
                        { name: '디카페인 변경', price: 500 },
                        { name: '휘핑크림 추가', price: 500 },
                        { name: '사이즈 업 (L)', price: 1000 },
                        { name: '포장용기 추가', price: 500 },
                        { name: '얼음 많이', price: 0 },
                        { name: '얼음 적게', price: 0 },
                      ].map((std) => {
                        const isChecked = tempSelectedOptions.includes(std.name);
                        return (
                          <button
                            key={std.name}
                            type="button"
                            onClick={() => handleToggleOption(std.name)}
                            className={`p-2 rounded border text-left text-xs flex items-center justify-between transition-all ${
                              isChecked
                                ? 'bg-[#2977ca] text-white border-blue-700 font-bold shadow-sm'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                            }`}
                          >
                            <span className="truncate pr-1">{std.name}</span>
                            <span className="font-mono text-[11px] font-bold shrink-0">
                              +{std.price.toLocaleString()}원
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Direct custom option entry */}
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                    <span className="text-xs font-bold text-slate-700 block mb-1">직접 옵션 입력</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="옵션명 (예: 펄 추가)"
                        value={customOptionName}
                        onChange={(e) => setCustomOptionName(e.target.value)}
                        className="flex-1 border rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="금액"
                        value={customOptionPrice}
                        onChange={(e) => setCustomOptionPrice(Number(e.target.value))}
                        className="w-20 border rounded px-2 py-1 text-xs font-mono text-right bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!customOptionName.trim()) return;
                          if (!tempSelectedOptions.includes(customOptionName.trim())) {
                            setTempSelectedOptions([...tempSelectedOptions, customOptionName.trim()]);
                          }
                          setCustomOptionName('');
                        }}
                        className="bg-[#2977ca] hover:bg-[#1f63ab] text-white px-3 py-1 rounded text-xs font-bold"
                      >
                        추가
                      </button>
                    </div>
                  </div>

                  {/* Selected options tags display */}
                  <div className="pt-2 border-t text-xs flex flex-col gap-1">
                    <span className="text-slate-600 font-bold">
                      선택된 옵션 ({tempSelectedOptions.length}개):
                    </span>
                    <div className="flex flex-wrap gap-1 min-h-[28px] p-1 bg-slate-50 rounded border border-slate-200">
                      {tempSelectedOptions.length === 0 ? (
                        <span className="text-[11px] text-slate-400 italic">선택된 옵션이 없습니다.</span>
                      ) : (
                        tempSelectedOptions.map((opt) => (
                          <span
                            key={opt}
                            className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-xs"
                          >
                            <span>{opt}</span>
                            <button
                              type="button"
                              onClick={() => handleToggleOption(opt)}
                              className="text-rose-500 font-bold hover:text-rose-700 ml-0.5"
                            >
                              ✕
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Modal Actions */}
            <div className="flex gap-2 pt-2 border-t mt-1">
              <button
                type="button"
                onClick={() => setIsOptionModalOpen(false)}
                className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded text-xs"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSaveOptions}
                className="flex-1 py-2 bg-[#2977ca] hover:bg-[#1f63ab] text-white font-bold rounded text-xs shadow"
              >
                옵션 적용하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
