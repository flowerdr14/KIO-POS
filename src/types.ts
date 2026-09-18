export type MenuCategory = 
  | 'DRINK' 
  | 'DOUGNUT' 
  | 'TEA' 
  | 'FRIED' 
  | 'DESERT' 
  | '커피' 
  | '음료' 
  | '라떼' 
  | '에이드' 
  | '티' 
  | '디저트' 
  | '기타';

export interface MenuOption {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  code: string;
  name: string;
  category: MenuCategory;
  price: number;
  status: '판매중' | '품절' | '판매중지';
  isAvailable: boolean;
  barcode: string;
  memo?: string;
  recipe?: string;
  description?: string;
  imageUrl?: string;
  options?: MenuOption[];
  hasOptions?: boolean;
  createdAt: string;
}

export type OrderStatus = '준비중' | '접수' | '준비완료' | '제공완료' | '취소됨';
export type PaymentStatus = '결제완료' | '미결제' | '후불' | '부분결제';
export type OrderType = '매장' | '포장' | '배달';

export interface OrderItem {
  id: string;
  menuId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  totalPrice: number;
  note?: string;
  selectedOptions?: string[];
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  orderType: OrderType;
  tableId?: string;
  tableName: string;
  orderTime: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: '현금' | '신용카드' | '복합결제' | '단순현금' | '서비스' | '후불' | '포인트' | '간편결제';
  cardInfo?: string;
  approvalNumber?: string;
  items: OrderItem[];
  subtotal: number;
  discountTotal: number;
  totalAmount: number;
  receivedAmount?: number;
  changeAmount?: number;
  specialRequests?: string;
  memo?: string;
  isReservation?: boolean;
  reservationTime?: string;
}

export interface TableItem {
  id: string;
  floor: 1 | 2;
  name: string;
  seats: number;
  status: '빈테이블' | '주문중' | '식사중' | '예약석' | '정리필요';
  currentOrderId?: string;
  memo?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface DailyDiscount {
  isActive: boolean;
  eventName: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number; // e.g. 10% or 1000 won
  targetCategory: string; // '전체' or specific category
}

export interface StoreShift {
  isOpen: boolean;
  openedAt?: string;
  closedAt?: string;
  startCash: number;
  cashSales: number;
  cardSales: number;
  otherSales: number;
  totalSales: number;
  orderCount: number;
}

export interface ReceiptSettings {
  storeName: string;
  storeBranch: string;
  businessNumber: string;
  ownerName: string;
  tel: string;
  address: string;
  footerMessage: string;
  printCustomerCopy: boolean;
}

export interface PostPaymentRecord {
  id: string;
  customerName: string;
  phone: string;
  orderId: string;
  amount: number;
  createdAt: string;
  dueDate: string;
  isPaid: boolean;
  memo?: string;
}

export interface PrinterDevice {
  id: string;
  name: string;
  type: 'RECEIPT' | 'KITCHEN';
  status: 'connected' | 'disconnected' | 'error';
  paperStatus: 'normal' | 'low';
  ipAddress: string;
}
