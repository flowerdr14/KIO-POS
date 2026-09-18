import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { Tag, Sparkles } from 'lucide-react';

export const DailyDiscountModal: React.FC = () => {
  const {
    isDailyDiscountModalOpen,
    setIsDailyDiscountModalOpen,
    dailyDiscount,
    updateDailyDiscount,
    showToast,
  } = usePos();

  const [eventName, setEventName] = useState(dailyDiscount.eventName);
  const [discountType, setDiscountType] = useState<'PERCENT' | 'FIXED'>(dailyDiscount.discountType);
  const [discountValue, setDiscountValue] = useState<number>(dailyDiscount.discountValue);
  const [targetCategory, setTargetCategory] = useState<string>(dailyDiscount.targetCategory);

  if (!isDailyDiscountModalOpen) return null;

  const handleToggle = () => {
    const nextState = !dailyDiscount.isActive;
    updateDailyDiscount({ isActive: nextState });
    showToast(`오늘의 할인 이벤트가 ${nextState ? '활성화(ON)' : '중지(OFF)'} 되었습니다.`);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim()) {
      showToast('이벤트명을 입력해주세요.');
      return;
    }

    updateDailyDiscount({
      eventName: eventName.trim(),
      discountType,
      discountValue: Number(discountValue) || 0,
      targetCategory,
      isActive: true,
    });

    showToast('오늘의 할인 설정이 저장 및 적용되었습니다.');
    setIsDailyDiscountModalOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-white border-2 border-[#2b71b8] shadow-2xl w-full max-w-xl overflow-hidden rounded-none flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#1e6199] text-white px-4 py-2 flex items-center justify-between border-b-2 border-[#2b71b8]">
          <span className="font-bold text-lg md:text-xl flex items-center gap-2">
            <Tag size={20} />
            오늘의 할인 및 프로모션 행사 설정
          </span>
          <button
            onClick={() => setIsDailyDiscountModalOpen(false)}
            className="hover:bg-rose-600 w-6 h-6 flex items-center justify-center rounded font-bold text-white"
          >
            ✕
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4 overflow-y-auto bg-slate-50 flex-1">
          {/* Current Active Status Card */}
          <div
            className={`p-4 border rounded flex items-center justify-between bg-white transition-all ${
              dailyDiscount.isActive ? 'border-blue-500 shadow-sm' : 'border-slate-200 opacity-70'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-sm">{dailyDiscount.eventName}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                  {dailyDiscount.targetCategory} 대상
                </span>
              </div>
              <div className="text-xs font-mono font-bold text-rose-600 mt-1">
                {dailyDiscount.discountType === 'PERCENT'
                  ? `${dailyDiscount.discountValue}% 할인`
                  : `${dailyDiscount.discountValue.toLocaleString()}원 할인`}
              </div>
            </div>

            <button
              onClick={handleToggle}
              className={`px-4 py-2 rounded text-xs font-bold transition-colors shadow-sm ${
                dailyDiscount.isActive
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {dailyDiscount.isActive ? '적용중 (ON)' : '중지됨 (OFF)'}
            </button>
          </div>

          {/* Configuration Form */}
          <form onSubmit={handleSave} className="bg-white border rounded p-4 flex flex-col gap-3">
            <div className="font-bold text-xs text-slate-800 border-b pb-1.5 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              <span>할인 프로모션 상세 설정</span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1 text-xs">프로모션 이름</label>
              <input
                type="text"
                required
                placeholder="예: 모닝 커피 10% 타임세일, 비오는 날 할인 등"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full border rounded p-2 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1 text-xs">할인 방식</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as 'PERCENT' | 'FIXED')}
                  className="w-full border rounded p-2 text-xs bg-white"
                >
                  <option value="PERCENT">퍼센트 비율 할인 (%)</option>
                  <option value="FIXED">정액 금액 할인 (원)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 text-xs">
                  {discountType === 'PERCENT' ? '할인율 (%)' : '할인금액 (원)'}
                </label>
                <input
                  type="number"
                  required
                  placeholder={discountType === 'PERCENT' ? '10' : '1000'}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full border rounded p-2 text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1 text-xs">적용 카테고리</label>
              <select
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                className="w-full border rounded p-2 text-xs bg-white"
              >
                <option value="전체">전체 메뉴 적용</option>
                <option value="커피">커피류만 적용</option>
                <option value="DRINK">DRINK 음료 적용</option>
                <option value="DOUGNUT">DOUGNUT 도넛 적용</option>
                <option value="디저트">디저트 적용</option>
              </select>
            </div>

            <button
              type="submit"
              className="mt-1 w-full py-2.5 bg-[#1e6199] hover:bg-[#164d7a] text-white font-bold text-xs rounded shadow"
            >
              설정 저장 및 즉시 적용
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-white p-3 border-t flex justify-end">
          <button
            onClick={() => setIsDailyDiscountModalOpen(false)}
            className="px-6 py-2 bg-slate-800 hover:bg-black text-white font-bold text-sm"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
