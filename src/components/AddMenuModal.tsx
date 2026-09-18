import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { MenuCategory } from '../types';

export const AddMenuModal: React.FC = () => {
  const { isAddMenuModalOpen, setIsAddMenuModalOpen, addMenuItem, showToast } = usePos();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('커피');
  const [barcode, setBarcode] = useState('');
  const [memo, setMemo] = useState('');
  const [recipe, setRecipe] = useState('');

  if (!isAddMenuModalOpen) return null;

  const handleBarcodeGenerate = () => {
    const p = price || '0';
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const rand = Math.floor(10 + Math.random() * 90);
    const gen = `${p}${date}${rand}`;
    setBarcode(gen);
    showToast('바코드 번호가 자동 생성되었습니다.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('메뉴명을 입력해주세요.');
      return;
    }
    const numPrice = Number(price) || 0;
    const finalBarcode = barcode || `880${Date.now().toString().slice(-7)}`;
    const code = `MN-${Math.floor(100 + Math.random() * 900)}`;

    addMenuItem({
      code,
      name: name.trim(),
      price: numPrice,
      category: category as MenuCategory,
      status: '판매중',
      isAvailable: true,
      barcode: finalBarcode,
      memo: memo.trim(),
      recipe: recipe.trim(),
      description: memo.trim(),
    });

    // Reset and close
    setName('');
    setPrice('');
    setCategory('커피');
    setBarcode('');
    setMemo('');
    setRecipe('');
    setIsAddMenuModalOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 select-none">
      {/* Modal Container with Windows Classic Style Titlebar as in Slide 2 */}
      <div className="bg-white border-2 border-[#2b71b8] shadow-2xl w-full max-w-2xl overflow-hidden rounded-none flex flex-col">
        {/* Title Bar */}
        <div className="bg-[#4d94d8] text-white px-4 py-2 flex items-center justify-between border-b-2 border-[#2b71b8]">
          <span className="font-bold text-lg md:text-xl tracking-wide">+ 메뉴 추가</span>
          {/* Windows-like controls - □ X */}
          <div className="flex items-center space-x-2 text-white font-bold text-sm">
            <button
              type="button"
              onClick={() => setIsAddMenuModalOpen(false)}
              className="hover:bg-white/20 w-6 h-6 flex items-center justify-center rounded"
            >
              -
            </button>
            <button
              type="button"
              className="hover:bg-white/20 w-6 h-6 flex items-center justify-center rounded"
            >
              □
            </button>
            <button
              type="button"
              onClick={() => setIsAddMenuModalOpen(false)}
              className="hover:bg-rose-600 w-6 h-6 flex items-center justify-center rounded font-bold"
            >
              X
            </button>
          </div>
        </div>

        {/* Modal Body Form matching Slide 2 layout */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: 메뉴명, 메뉴가격, 분류, 바코드 */}
            <div className="md:col-span-6 flex flex-col gap-3">
              {/* 메뉴명 */}
              <div className="flex items-center gap-3">
                <label className="w-20 text-base font-bold text-slate-800">메뉴명</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="메뉴명 입력"
                  className="flex-1 border-2 border-[#2b71b8] px-3 py-1.5 text-base focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* 메뉴가격 */}
              <div className="flex items-center gap-3">
                <label className="w-20 text-base font-bold text-slate-800">메뉴가격</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  placeholder="가격 (숫자)"
                  className="flex-1 border-2 border-[#2b71b8] px-3 py-1.5 text-base font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* 분류 */}
              <div className="flex items-center gap-3">
                <label className="w-20 text-base font-bold text-slate-800">분류</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="커피 / 음료 / 디저트 등"
                  className="flex-1 border-2 border-[#2b71b8] px-3 py-1.5 text-base focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* 바코드 */}
              <div className="flex items-center gap-3">
                <label className="w-20 text-base font-bold text-slate-800">바코드</label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="바코드 번호"
                  className="flex-1 border-2 border-[#2b71b8] px-3 py-1.5 text-base font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* 바코드 제작 링크 info */}
              <div className="text-xs text-slate-700 pl-2">
                <div className="font-semibold mb-1 flex items-center justify-between">
                  <span>- 바코드 제작</span>
                  <button
                    type="button"
                    onClick={handleBarcodeGenerate}
                    className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-0.5 rounded font-bold"
                  >
                    번호 자동생성
                  </button>
                </div>
                <div className="border border-blue-300 p-1.5 bg-blue-50/50 rounded font-mono text-[11px] text-blue-900 truncate">
                  https://wepplication.github.io/tools/barcodeGen/
                </div>
              </div>
            </div>

            {/* Right Column: 메모 & 바코드 번호 설명 */}
            <div className="md:col-span-6 flex flex-col gap-2">
              <label className="text-base font-bold text-slate-800">메모</label>
              <textarea
                rows={4}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="원두 품종, 보관 방법, 알레르기 유발 물질 등..."
                className="w-full border-2 border-[#2b71b8] p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 flex-1"
              />
              <div className="text-xs font-bold text-blue-600 mt-1">
                ** 바코드 번호: &#123;가격&#125;+&#123;등록일&#125;+&#123;등록번호&#125; **
              </div>
            </div>
          </div>

          {/* Bottom Recipe field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-base font-bold text-slate-800">레시피</label>
            <textarea
              rows={3}
              value={recipe}
              onChange={(e) => setRecipe(e.target.value)}
              placeholder="제조 순서, 계량, 추출 시간 등의 상세 레시피를 입력하세요."
              className="w-full border-2 border-[#2b71b8] p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              id="btn-add-menu-submit"
              className="bg-[#2977ca] hover:bg-[#1f63ab] text-white font-black text-lg px-8 py-2.5 rounded-none shadow transition-all active:scale-95"
            >
              등록완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
