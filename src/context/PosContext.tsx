import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  MenuItem,
  TableItem,
  Order,
  OrderItem,
  OrderStatus,
  ReceiptSettings,
  PrinterDevice,
  StoreShift,
  DailyDiscount,
  PostPaymentRecord
} from '../types';
import {
  INITIAL_MENU_ITEMS,
  INITIAL_TABLES,
  INITIAL_ORDERS,
  INITIAL_RESERVATIONS,
  DEFAULT_RECEIPT_SETTINGS,
  DEFAULT_PRINTERS,
  DEFAULT_SHIFT,
  DEFAULT_DAILY_DISCOUNT
} from '../data/initialData';
import { playPosBeep, playSuccessChime, playCashRegisterSound, playPrintSound } from '../utils/audio';
import { broadcastSyncMessage, getSyncChannel } from '../utils/syncBus';
import { getPopupWindowRef, setPopupWindowRef } from '../utils/popup';

export type MainTab = 'DASHBOARD' | 'ORDERS' | 'HALL' | 'CHECKOUT' | 'MENUS';

interface PosContextType {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  
  // Menus
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id' | 'createdAt'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  resetMenuPricesToDefault: () => void;
  
  // Tables
  tables: TableItem[];
  selectedTable: TableItem | null;
  setSelectedTable: (table: TableItem | null) => void;
  updateTableStatus: (id: string, status: TableItem['status'], memo?: string) => void;
  
  // Orders
  orders: Order[];
  reservations: Order[];
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  cancelOrder: (orderId: string) => void;
  updateOrderMemo: (orderId: string, memo: string) => void;
  updateOrderSpecialRequests: (orderId: string, req: string) => void;
  
  // Active Checkout Cart
  cart: OrderItem[];
  addToCart: (menu: MenuItem, selectedOptions?: string[]) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  updateCartItemQty: (itemId: string, qty: number) => void;
  updateCartItemDiscount: (itemId: string, discount: number) => void;
  updateCartItemRemark: (itemId: string, remark: string) => void;
  updateCartItemOptions: (itemId: string, selectedOptions: string[], addedPrice?: number) => void;
  cartTable: TableItem | null;
  setCartTable: (table: TableItem | null) => void;
  cartOrderType: '매장' | '포장';
  setCartOrderType: (type: '매장' | '포장') => void;
  completePayment: (
    method: Order['paymentMethod'], 
    receivedCash?: number, 
    paymentDetails?: { cardInfo?: string; autoOpenReceipt?: boolean; approvalNumber?: string }
  ) => Order;
  
  // Shift & Store Stats
  shift: StoreShift;
  startShift: (initialCash: number) => void;
  closeShift: () => void;
  
  // Settings & Modals
  receiptSettings: ReceiptSettings;
  updateReceiptSettings: (settings: Partial<ReceiptSettings>) => void;
  printers: PrinterDevice[];
  updatePrinterStatus: (id: string, status: PrinterDevice['status']) => void;
  testPrint: (printerId: string) => void;
  
  dailyDiscount: DailyDiscount;
  updateDailyDiscount: (discount: Partial<DailyDiscount>) => void;
  
  postPayments: PostPaymentRecord[];
  addPostPayment: (record: Omit<PostPaymentRecord, 'id' | 'createdAt' | 'isPaid'>) => void;
  settlePostPayment: (id: string) => void;
  
  // Modals state
  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: (open: boolean) => void;
  isAddMenuModalOpen: boolean;
  setIsAddMenuModalOpen: (open: boolean) => void;
  isDeleteMenuModalOpen: boolean;
  setIsDeleteMenuModalOpen: (open: boolean) => void;
  isReceiptModalOpen: boolean;
  setIsReceiptModalOpen: (open: boolean) => void;
  receiptOrderToPrint: Order | null;
  openReceiptModalWithOrder: (order: Order) => void;
  isPrinterModalOpen: boolean;
  setIsPrinterModalOpen: (open: boolean) => void;
  isPostPaymentModalOpen: boolean;
  setIsPostPaymentModalOpen: (open: boolean) => void;
  isCalculatorModalOpen: boolean;
  setIsCalculatorModalOpen: (open: boolean) => void;
  isBarcodeModalOpen: boolean;
  setIsBarcodeModalOpen: (open: boolean) => void;
  isDailyDiscountModalOpen: boolean;
  setIsDailyDiscountModalOpen: (open: boolean) => void;
  isShiftModalOpen: boolean;
  setIsShiftModalOpen: (open: boolean) => void;
  shiftModalMode: 'START' | 'END';
  setShiftModalMode: (mode: 'START' | 'END') => void;
  
  clearAllOrders: () => void;
  clearAllTables: () => void;

  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const PosContext = createContext<PosContextType | undefined>(undefined);

export const PosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Guaranteed clean slate reset to empty all previous orders and restore original clean prices
  const CLEAN_SLATE_STAMP = 'kio_pos_v6_no_auto_discount';
  if (typeof window !== 'undefined' && localStorage.getItem('kio_pos_stamp') !== CLEAN_SLATE_STAMP) {
    localStorage.removeItem('kio_pos_orders');
    localStorage.removeItem('kio_pos_reservations');
    localStorage.removeItem('kio_pos_menus'); // Reset menus back to initial canonical original prices
    localStorage.removeItem('kio_pos_daily_discount'); // Clear any stored auto discount
    localStorage.setItem('kio_pos_tables', JSON.stringify(INITIAL_TABLES));
    localStorage.setItem('kio_pos_stamp', CLEAN_SLATE_STAMP);
  }

  // Load from local storage or fallback to defaults
  const [activeTab, setActiveTabState] = useState<MainTab>('DASHBOARD');
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('kio_pos_menus');
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  const [tables, setTables] = useState<TableItem[]>(() => {
    const saved = localStorage.getItem('kio_pos_tables');
    if (!saved) return INITIAL_TABLES;
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_TABLES;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('kio_pos_orders');
    if (!saved) return [];
    try {
      const parsed: Order[] = JSON.parse(saved);
      // Clean up corrupt entries without items, but never delete valid orders
      const cleaned = parsed.filter(
        (o) => o && o.id && Array.isArray(o.items) && o.items.length > 0
      );
      if (cleaned.length !== parsed.length) {
        localStorage.setItem('kio_pos_orders', JSON.stringify(cleaned));
      }
      return cleaned;
    } catch {
      return [];
    }
  });

  const [reservations, setReservations] = useState<Order[]>(() => {
    const saved = localStorage.getItem('kio_pos_reservations');
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  const [shift, setShift] = useState<StoreShift>(() => {
    const saved = localStorage.getItem('kio_pos_shift');
    if (!saved) return DEFAULT_SHIFT;
    try {
      const parsed = JSON.parse(saved);
      if (parsed.totalSales === 642000) return DEFAULT_SHIFT;
      return parsed;
    } catch {
      return DEFAULT_SHIFT;
    }
  });

  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings>(() => {
    const saved = localStorage.getItem('kio_pos_receipt_settings');
    return saved ? JSON.parse(saved) : DEFAULT_RECEIPT_SETTINGS;
  });

  const [printers, setPrinters] = useState<PrinterDevice[]>(() => {
    const saved = localStorage.getItem('kio_pos_printers');
    return saved ? JSON.parse(saved) : DEFAULT_PRINTERS;
  });

  const [dailyDiscount, setDailyDiscount] = useState<DailyDiscount>(() => {
    const saved = localStorage.getItem('kio_pos_daily_discount');
    return saved ? JSON.parse(saved) : DEFAULT_DAILY_DISCOUNT;
  });

  const [postPayments, setPostPayments] = useState<PostPaymentRecord[]>(() => {
    const saved = localStorage.getItem('kio_pos_post_payments');
    if (!saved) return [];
    try {
      const parsed: PostPaymentRecord[] = JSON.parse(saved);
      return parsed.filter(p => p.id !== 'pp-1');
    } catch {
      return [];
    }
  });

  // Sound and feedback
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 3000);
  };

  const playBeep = () => {
    if (soundEnabled) playPosBeep();
  };

  const setActiveTab = (tab: MainTab) => {
    playBeep();
    setActiveTabState(tab);
  };

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('kio_pos_menus', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('kio_pos_tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('kio_pos_orders', JSON.stringify(orders));
  }, [orders]);

  const ordersRef = useRef(orders);
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  // Listen for storage, BroadcastChannel, and direct window.postMessage between Main POS and Popup
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'kio_pos_orders') {
        if (e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (Array.isArray(parsed)) {
              setOrders(parsed.filter((o: Order) => o && o.id));
            }
          } catch {}
        } else {
          setOrders([]);
        }
      }
      if (e.key === 'kio_pos_tables' && e.newValue) {
        try {
          setTables(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    const bus = getSyncChannel();
    const handleSyncMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;
      if (data.type === 'SYNC_ORDERS' || data.type === 'ORDER_ADDED' || data.type === 'CLEAR_ORDERS') {
        if (Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      } else if (data.type === 'ORDER_STATUS_CHANGED') {
        if (Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          setOrders((prev) =>
            prev.map((o) => (o.id === data.orderId ? { ...o, status: data.status } : o))
          );
        }
      }
    };
    bus?.addEventListener('message', handleSyncMessage);

    // Direct Window postMessage for cross-partition popup <-> opener sync
    const handleWindowPostMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      // Popup connected or requesting current state
      if (data.type === 'POPUP_READY' || data.type === 'REQUEST_ORDERS') {
        if (event.source && typeof (event.source as Window).postMessage === 'function') {
          setPopupWindowRef(event.source as Window);
          try {
            (event.source as Window).postMessage({
              type: 'SYNC_ORDERS',
              orders: ordersRef.current,
            }, '*');
          } catch {}
        }
      }

      // Orders payload received
      if (data.type === 'SYNC_ORDERS' || data.type === 'ORDER_ADDED' || data.type === 'CLEAR_ORDERS') {
        if (Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      } else if (data.type === 'ORDER_STATUS_CHANGED') {
        if (Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else if (data.orderId) {
          setOrders((prev) =>
            prev.map((o) => (o.id === data.orderId ? { ...o, status: data.status } : o))
          );
        }
      }
    };
    window.addEventListener('message', handleWindowPostMessage);

    // If this window is the standalone popup, notify opener immediately
    if (typeof window !== 'undefined' && window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage({ type: 'POPUP_READY' }, '*');
      } catch {}
    }

    // 300ms High-frequency sync across active windows
    const interval = setInterval(() => {
      // If we are opener and have an active popup, push latest orders directly
      const popup = getPopupWindowRef();
      if (popup && !popup.closed) {
        try {
          popup.postMessage({
            type: 'SYNC_ORDERS',
            orders: ordersRef.current,
          }, '*');
        } catch {}
      }

      // If we are the popup, periodically request fresh orders from opener
      if (typeof window !== 'undefined' && window.opener && !window.opener.closed) {
        try {
          window.opener.postMessage({ type: 'REQUEST_ORDERS' }, '*');
        } catch {}
      }

      // Also check localStorage
      try {
        const raw = localStorage.getItem('kio_pos_orders');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setOrders((prev) => {
              if (prev.length !== parsed.length) return parsed;
              const isDifferent = prev.some(
                (p, idx) => p.id !== parsed[idx]?.id || p.status !== parsed[idx]?.status
              );
              return isDifferent ? parsed : prev;
            });
          }
        }
      } catch {}
    }, 300);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      bus?.removeEventListener('message', handleSyncMessage);
      window.removeEventListener('message', handleWindowPostMessage);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('kio_pos_reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('kio_pos_shift', JSON.stringify(shift));
  }, [shift]);

  useEffect(() => {
    localStorage.setItem('kio_pos_receipt_settings', JSON.stringify(receiptSettings));
  }, [receiptSettings]);

  useEffect(() => {
    localStorage.setItem('kio_pos_printers', JSON.stringify(printers));
  }, [printers]);

  useEffect(() => {
    localStorage.setItem('kio_pos_daily_discount', JSON.stringify(dailyDiscount));
  }, [dailyDiscount]);

  useEffect(() => {
    localStorage.setItem('kio_pos_post_payments', JSON.stringify(postPayments));
  }, [postPayments]);

  // Selected states
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0] || null);

  // Cart for Checkout
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [cartTable, setCartTable] = useState<TableItem | null>(null);
  const [cartOrderType, setCartOrderType] = useState<'매장' | '포장'>('매장');

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAddMenuModalOpen, setIsAddMenuModalOpen] = useState(false);
  const [isDeleteMenuModalOpen, setIsDeleteMenuModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptOrderToPrint, setReceiptOrderToPrint] = useState<Order | null>(null);
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
  const [isPostPaymentModalOpen, setIsPostPaymentModalOpen] = useState(false);
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isDailyDiscountModalOpen, setIsDailyDiscountModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [shiftModalMode, setShiftModalMode] = useState<'START' | 'END'>('START');

  // Menu methods
  const addMenuItem = (item: Omit<MenuItem, 'id' | 'createdAt'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `m_${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setMenuItems(prev => [newItem, ...prev]);
    if (soundEnabled) playSuccessChime();
    showToast(`'${newItem.name}' 메뉴가 등록되었습니다.`);
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    playBeep();
    showToast('메뉴 정보가 수정되었습니다.');
  };

  const deleteMenuItem = (id: string) => {
    const target = menuItems.find(m => m.id === id);
    setMenuItems(prev => prev.filter(m => m.id !== id));
    playBeep();
    showToast(`'${target?.name || ''}' 메뉴가 삭제되었습니다.`);
  };

  // Table methods
  const updateTableStatus = (id: string, status: TableItem['status'], memo?: string) => {
    setTables(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status,
          ...(memo !== undefined ? { memo } : {})
        };
      }
      return t;
    }));
    playBeep();
  };

  // Order methods
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const existing = orders.find(o => o.id === orderId) || reservations.find(r => r.id === orderId);
    const tableName = existing?.tableName || '';
    const orderNumber = existing?.orderNumber || '';

    let updatedOrders: Order[] = [];
    setOrders(prev => {
      const updated = prev.map(o => (o.id === orderId ? { ...o, status } : o));
      updatedOrders = updated;
      try {
        localStorage.setItem('kio_pos_orders', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setReservations(prev => {
      const updated = prev.map(r => (r.id === orderId ? { ...r, status } : r));
      try {
        localStorage.setItem('kio_pos_reservations', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (status === '준비완료') {
      playSuccessChime();
      showToast('🔔 [준비완료] 호출 전광판에 실시간 자동 반영되었습니다.');
    } else {
      playBeep();
      showToast(`주문 상태가 [${status}]로 변경되었습니다.`);
    }

    // Broadcast to other windows/popups immediately with complete updated payload
    broadcastSyncMessage({
      type: 'ORDER_STATUS_CHANGED',
      orderId,
      status,
      tableName,
      orderNumber,
      orders: updatedOrders
    });
  };

  const cancelOrder = (orderId: string) => {
    setOrders(prev => {
      const updated = prev.map(o => o.id === orderId ? { ...o, status: '취소됨' as OrderStatus } : o);
      try {
        localStorage.setItem('kio_pos_orders', JSON.stringify(updated));
      } catch {}
      broadcastSyncMessage({
        type: 'ORDER_STATUS_CHANGED',
        orderId,
        status: '취소됨',
        orders: updated
      });
      return updated;
    });
    playBeep();
    showToast('주문이 취소되었습니다.');
  };

  const updateOrderMemo = (orderId: string, memo: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, memo } : o));
    setReservations(prev => prev.map(r => r.id === orderId ? { ...r, memo } : r));
    playBeep();
    showToast('메모가 저장되었습니다.');
  };

  const updateOrderSpecialRequests = (orderId: string, req: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, specialRequests: req } : o));
    playBeep();
    showToast('요청사항이 수정되었습니다.');
  };

  // Cart operations
  const addToCart = (menu: MenuItem, selectedOptions?: string[]) => {
    playBeep();
    
    setCart(prev => {
      const optKey = (selectedOptions || []).sort().join(',');
      const existingIdx = prev.findIndex(item => item.menuId === menu.id && (item.selectedOptions || []).sort().join(',') === optKey);
      
      if (existingIdx > -1) {
        const updated = [...prev];
        const item = updated[existingIdx];
        const newQty = item.quantity + 1;
        const total = (item.unitPrice * newQty) - (item.discount * newQty);
        updated[existingIdx] = {
          ...item,
          quantity: newQty,
          totalPrice: Math.max(0, total)
        };
        return updated;
      } else {
        const itemDiscount = (menu.discountAmount && menu.discountAmount > 0) ? menu.discountAmount : 0;
        const newItem: OrderItem = {
          id: `ci_${Date.now()}_${Math.random()}`,
          menuId: menu.id,
          name: menu.name,
          unitPrice: menu.price,
          quantity: 1,
          discount: itemDiscount,
          totalPrice: Math.max(0, menu.price - itemDiscount),
          remark: menu.remark || (menu.remarks && menu.remarks[0]) || '',
          selectedOptions: selectedOptions || []
        };
        return [...prev, newItem];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    playBeep();
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    playBeep();
    setCart([]);
  };

  const updateCartItemQty = (itemId: string, qty: number) => {
    playBeep();
    if (qty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity: qty,
          totalPrice: Math.max(0, (item.unitPrice * qty) - (item.discount * qty))
        };
      }
      return item;
    }));
  };

  const updateCartItemDiscount = (itemId: string, discount: number) => {
    playBeep();
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          discount,
          totalPrice: Math.max(0, (item.unitPrice * item.quantity) - (discount * item.quantity))
        };
      }
      return item;
    }));
  };

  const updateCartItemRemark = (itemId: string, remark: string) => {
    playBeep();
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        // Toggle if same remark clicked
        const newRemark = item.remark === remark ? '' : remark;
        return {
          ...item,
          remark: newRemark,
        };
      }
      return item;
    }));
  };

  const updateCartItemOptions = (itemId: string, selectedOptions: string[], addedPrice: number = 0) => {
    playBeep();
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const baseMenu = menuItems.find(m => m.id === item.menuId);
        const basePrice = baseMenu ? baseMenu.price : item.unitPrice;
        const newUnitPrice = basePrice + addedPrice;
        const total = (newUnitPrice * item.quantity) - (item.discount * item.quantity);
        return {
          ...item,
          unitPrice: newUnitPrice,
          selectedOptions,
          totalPrice: Math.max(0, total)
        };
      }
      return item;
    }));
  };

  const resetMenuPricesToDefault = () => {
    setMenuItems(INITIAL_MENU_ITEMS);
    localStorage.setItem('kio_pos_menus', JSON.stringify(INITIAL_MENU_ITEMS));
    showToast('모든 메뉴 가격이 원래 기본 가격으로 초기화되었습니다.');
  };

  const completePayment = (
    method: Order['paymentMethod'], 
    receivedCash = 0,
    paymentDetails?: { cardInfo?: string; autoOpenReceipt?: boolean; approvalNumber?: string }
  ): Order => {
    const subtotal = cart.reduce((sum, it) => sum + (it.unitPrice * it.quantity), 0);
    const discountTotal = cart.reduce((sum, it) => sum + (it.discount * it.quantity), 0);
    const totalAmount = Math.max(0, subtotal - discountTotal);
    const change = method === '현금' || method === '단순현금' ? Math.max(0, receivedCash - totalAmount) : 0;

    const orderNum = `A-${String(orders.length + 101).padStart(4, '0')}`;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const approvalNum = paymentDetails?.approvalNumber || `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber: orderNum,
      customerName: cartTable ? `${cartTable.name} 고객` : '현장 고객',
      orderType: cartOrderType,
      tableId: cartTable?.id,
      tableName: cartTable?.name || (cartOrderType === '포장' ? '포장주문' : '카운터'),
      orderTime: timeStr,
      status: '접수',
      paymentStatus: method === '후불' ? '후불' : '결제완료',
      paymentMethod: method,
      cardInfo: paymentDetails?.cardInfo,
      approvalNumber: approvalNum,
      items: [...cart],
      subtotal,
      discountTotal,
      totalAmount,
      receivedAmount: receivedCash > 0 ? receivedCash : totalAmount,
      changeAmount: change,
      memo: `${method} 결제`
    };

    setOrders(prev => {
      const updated = [newOrder, ...prev];
      try {
        localStorage.setItem('kio_pos_orders', JSON.stringify(updated));
      } catch {}
      broadcastSyncMessage({
        type: 'ORDER_ADDED',
        order: newOrder,
        orders: updated,
      });
      return updated;
    });

    // Update table state if table was assigned
    if (cartTable) {
      updateTableStatus(cartTable.id, '식사중', `${newOrder.orderNumber} 이용중`);
    }

    // Update shift stats
    setShift(prev => {
      const isCash = method === '현금' || method === '단순현금';
      const isCard = method === '신용카드';
      return {
        ...prev,
        cashSales: isCash ? prev.cashSales + totalAmount : prev.cashSales,
        cardSales: isCard ? prev.cardSales + totalAmount : prev.cardSales,
        otherSales: (!isCash && !isCard) ? prev.otherSales + totalAmount : prev.otherSales,
        totalSales: prev.totalSales + totalAmount,
        orderCount: prev.orderCount + 1,
      };
    });

    if (method === '후불') {
      addPostPayment({
        customerName: cartTable?.name || '현장고객',
        phone: '010-0000-0000',
        orderId: newOrder.orderNumber,
        amount: totalAmount,
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        memo: '후불 주문 등록',
      });
    }

    if (soundEnabled) {
      if (method === '현금' || method === '단순현금') {
        playCashRegisterSound();
      } else {
        playSuccessChime();
      }
    }

    // Clear cart and prepare for next
    setCart([]);
    setCartTable(null);
    showToast(`주문번호 [${newOrder.orderNumber}] ${totalAmount.toLocaleString()}원 ${method} 결제 완료!`);
    
    // Automatically set order to print and optionally open receipt modal
    setReceiptOrderToPrint(newOrder);
    if (paymentDetails?.autoOpenReceipt !== false) {
      setIsReceiptModalOpen(true);
    }

    return newOrder;
  };


  const openReceiptModalWithOrder = (order: Order) => {
    playBeep();
    setReceiptOrderToPrint(order);
    setIsReceiptModalOpen(true);
  };

  // Shift
  const startShift = (initialCash: number) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setShift({
      isOpen: true,
      openedAt: timeStr,
      startCash: initialCash,
      cashSales: 0,
      cardSales: 0,
      otherSales: 0,
      totalSales: 0,
      orderCount: 0,
    });
    if (soundEnabled) playSuccessChime();
    showToast(`영업이 시작되었습니다. (준비금: ${initialCash.toLocaleString()}원)`);
  };

  const closeShift = () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setShift(prev => ({
      ...prev,
      isOpen: false,
      closedAt: timeStr,
    }));
    playBeep();
    showToast('영업이 마감되었습니다. 일일 정산이 완료되었습니다.');
  };

  // Receipt Settings
  const updateReceiptSettings = (settings: Partial<ReceiptSettings>) => {
    setReceiptSettings(prev => ({ ...prev, ...settings }));
    playBeep();
    showToast('영수증 양식 설정이 저장되었습니다.');
  };

  // Printers
  const updatePrinterStatus = (id: string, status: PrinterDevice['status']) => {
    setPrinters(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const testPrint = (printerId: string) => {
    const target = printers.find(p => p.id === printerId);
    if (soundEnabled) playPrintSound();
    showToast(`'${target?.name || '프린터'}'로 테스트 출력 신호를 전송했습니다.`);
  };

  // Daily discount
  const updateDailyDiscount = (discount: Partial<DailyDiscount>) => {
    setDailyDiscount(prev => ({ ...prev, ...discount }));
    playBeep();
    showToast('오늘의 할인 설정이 적용되었습니다.');
  };

  // Post payments
  const addPostPayment = (record: Omit<PostPaymentRecord, 'id' | 'createdAt' | 'isPaid'>) => {
    const newRecord: PostPaymentRecord = {
      ...record,
      id: `pp_${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
      isPaid: false,
    };
    setPostPayments(prev => [newRecord, ...prev]);
  };

  const settlePostPayment = (id: string) => {
    setPostPayments(prev => prev.map(p => p.id === id ? { ...p, isPaid: true } : p));
    if (soundEnabled) playCashRegisterSound();
    showToast('후불 결제 정산 처리가 완료되었습니다.');
  };

  const clearAllOrders = () => {
    setOrders([]);
    localStorage.removeItem('kio_pos_orders');
    setSelectedOrder(null);
    broadcastSyncMessage({
      type: 'CLEAR_ORDERS',
      orders: [],
    });
    showToast('최근 주문 내역이 완전히 비워졌습니다.');
  };

  const clearAllTables = () => {
    const cleanTables: TableItem[] = INITIAL_TABLES.map(t => ({
      ...t,
      status: '빈테이블' as const,
      memo: ''
    }));
    setTables(cleanTables);
    localStorage.setItem('kio_pos_tables', JSON.stringify(cleanTables));
    setCartTable(null);
    setSelectedTable(null);
    showToast('현재 테이블 상태가 완전히 깨끗하게 비워졌습니다.');
  };

  return (
    <PosContext.Provider
      value={{
        activeTab,
        setActiveTab,
        menuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        resetMenuPricesToDefault,
        tables,
        selectedTable,
        setSelectedTable,
        updateTableStatus,
        orders,
        reservations,
        selectedOrder,
        setSelectedOrder,
        updateOrderStatus,
        cancelOrder,
        updateOrderMemo,
        updateOrderSpecialRequests,
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
        completePayment,
        shift,
        startShift,
        closeShift,
        receiptSettings,
        updateReceiptSettings,
        printers,
        updatePrinterStatus,
        testPrint,
        dailyDiscount,
        updateDailyDiscount,
        postPayments,
        addPostPayment,
        settlePostPayment,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
        isAddMenuModalOpen,
        setIsAddMenuModalOpen,
        isDeleteMenuModalOpen,
        setIsDeleteMenuModalOpen,
        isReceiptModalOpen,
        setIsReceiptModalOpen,
        receiptOrderToPrint,
        openReceiptModalWithOrder,
        isPrinterModalOpen,
        setIsPrinterModalOpen,
        isPostPaymentModalOpen,
        setIsPostPaymentModalOpen,
        isCalculatorModalOpen,
        setIsCalculatorModalOpen,
        isBarcodeModalOpen,
        setIsBarcodeModalOpen,
        isDailyDiscountModalOpen,
        setIsDailyDiscountModalOpen,
        isShiftModalOpen,
        setIsShiftModalOpen,
        shiftModalMode,
        setShiftModalMode,
        clearAllOrders,
        clearAllTables,
        soundEnabled,
        setSoundEnabled,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </PosContext.Provider>
  );
};

export const usePos = () => {
  const context = useContext(PosContext);
  if (!context) {
    throw new Error('usePos must be used within a PosProvider');
  }
  return context;
};
