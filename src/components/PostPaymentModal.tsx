import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { CreditCard, Check, Plus, AlertCircle } from 'lucide-react';

export const PostPaymentModal: React.FC = () => {
  const {
    isPostPaymentModalOpen,
    setIsPostPaymentModalOpen,
    postPayments,
    addPostPayment,
    settlePostPayment,
    showToast,
  } = usePos();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    return new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  });
  const [isAddingNew, setIsAddingNew] = useState(false);

  if (!isPostPaymentModalOpen) return null;

  const totalUnpaid = postPayments
    .filter((p) => !p.isPaid)
    .reduce((sum, p) => sum + p.amount, 0);

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !amount) {
      showToast('고객명과 금액을 입력해주세요.');
      return;
    }

    addPostPayment({
      customerName: customerName.trim(),
      phone: phone.trim() || '010-0000-0000',
      orderId: `PP-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: Number(amount) || 0,
      dueDate,
      memo: memo.trim(),
    });

    setCustomerName('');
    setPhone('');
    setAmount('');
    setMemo('');
    setIsAddingNew(false);
    showToast('신규 후불 결제 장부가 등록되었습니다.');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-white border-2 border-[#2b71b8] shadow-2xl w-full max-w-2xl overflow-hidden rounded-none flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#2377c4] text-white px-4 py-2 flex items-center justify-between border-b-2 border-[#2b71b8]">
          <span className="font-bold text-lg md:text-xl flex items-center gap-2">
            <CreditCard size={20} />
            후불결제 / 외상 장부 관리
          </span>
          <button
            onClick={() => setIsPostPaymentModalOpen(false)}
            className="hover:bg-rose-600 w-6 h-6 flex items-center justify-center rounded font-bold text-white"
          >
            ✕
          </button>
        </div>

        {/* Summary Card */}
        <div className="bg-blue-50 p-4 border-b border-blue-200 flex items-center justify-between">
          <div>
            <div className="text-xs text-blue-800 font-bold">현재 미결제 후불 잔액 합계</div>
            <div className="text-2xl font-black font-mono text-blue-900 mt-0.5">
              ₩ {totalUnpaid.toLocaleString()}
            </div>
          </div>
          <button
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="bg-[#2377c4] hover:bg-[#1b5f9e] text-white text-xs font-bold px-4 py-2 rounded flex items-center gap-1.5 shadow"
          >
            <Plus size={14} />
            <span>{isAddingNew ? '목록으로 돌아가기' : '신규 후불 장부 등록'}</span>
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          {isAddingNew ? (
            /* Add New Form */
            <form onSubmit={handleAddNew} className="space-y-3 text-xs bg-slate-50 p-4 border rounded">
              <h4 className="font-bold text-sm text-slate-800 border-b pb-2">신규 후불/외상 거래 등록</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">고객명 / 거래처</label>
                  <input
                    type="text"
                    required
                    placeholder="(주)회사명 또는 고객 성함"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full border rounded p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">연락처</label>
                  <input
                    type="text"
                    placeholder="010-0000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border rounded p-2 text-xs font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">후불 금액 (원)</label>
                  <input
                    type="number"
                    required
                    placeholder="금액 입력"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full border rounded p-2 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">정산 예정일</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full border rounded p-2 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">관리 메모</label>
                <input
                  type="text"
                  placeholder="예: 월말 세금계산서 발행 후 계좌 입금"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="w-full border rounded p-2 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded"
                >
                  등록 완료
                </button>
              </div>
            </form>
          ) : (
            /* Records Table */
            <div className="border border-slate-200 rounded overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1b5c9c] text-white">
                  <tr>
                    <th className="py-2 px-3">고객/거래처</th>
                    <th className="py-2 px-3">연락처</th>
                    <th className="py-2 px-3">후불금액</th>
                    <th className="py-2 px-3">예정일</th>
                    <th className="py-2 px-3">메모</th>
                    <th className="py-2 px-3 text-center">상태 / 정산</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {postPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                        등록된 후불 결제 내역이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    postPayments.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-800">{record.customerName}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{record.phone}</td>
                        <td className="py-2.5 px-3 font-mono font-black text-blue-900">
                          ₩{record.amount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{record.dueDate}</td>
                        <td className="py-2.5 px-3 text-slate-600 max-w-[120px] truncate">
                          {record.memo || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {record.isPaid ? (
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-bold text-[11px]">
                              정산완료
                            </span>
                          ) : (
                            <button
                              onClick={() => settlePostPayment(record.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-sm text-[11px] active:scale-95 transition-transform"
                            >
                              정산처리
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white p-3 border-t flex justify-end">
          <button
            onClick={() => setIsPostPaymentModalOpen(false)}
            className="px-6 py-2 bg-slate-800 hover:bg-black text-white font-bold text-sm"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
