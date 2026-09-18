import React from 'react';
import { usePos } from '../context/PosContext';

export const DeleteMenuModal: React.FC = () => {
  const { isDeleteMenuModalOpen, setIsDeleteMenuModalOpen, menuItems, deleteMenuItem } = usePos();

  if (!isDeleteMenuModalOpen) return null;

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`'${name}' 메뉴를 정말 삭제하시겠습니까?`)) {
      deleteMenuItem(id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-white border-4 border-[#2b71b8] shadow-2xl w-full max-w-4xl overflow-hidden rounded-none flex flex-col max-h-[85vh]">
        {/* Table Header matching Slide 3 */}
        <div className="grid grid-cols-12 bg-[#4d94d8] text-white text-center font-bold text-base md:text-xl py-3 border-b-2 border-[#2b71b8]">
          <div className="col-span-1 border-r border-[#2b71b8]/40">No</div>
          <div className="col-span-4 border-r border-[#2b71b8]/40">메뉴명</div>
          <div className="col-span-3 border-r border-[#2b71b8]/40">가격</div>
          <div className="col-span-2 border-r border-[#2b71b8]/40">상태</div>
          <div className="col-span-2">삭제</div>
        </div>

        {/* Table Content Rows matching Slide 3 */}
        <div className="divide-y divide-[#6ea8e0] overflow-y-auto flex-1">
          {menuItems.length === 0 ? (
            <div className="py-20 text-center text-slate-400 font-bold text-lg">
              삭제 가능한 메뉴가 없습니다.
            </div>
          ) : (
            menuItems.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-12 text-center text-sm md:text-base py-3 px-2 hover:bg-red-50/50 items-center transition-colors"
              >
                {/* No */}
                <div className="col-span-1 font-mono font-bold text-slate-700 border-r border-[#6ea8e0]/40 py-1">
                  {index + 1}
                </div>

                {/* 메뉴명 */}
                <div className="col-span-4 font-bold text-slate-900 text-left px-4 truncate border-r border-[#6ea8e0]/40 py-1">
                  {item.name}
                </div>

                {/* 가격 */}
                <div className="col-span-3 font-mono font-bold text-slate-800 border-r border-[#6ea8e0]/40 py-1">
                  {item.price.toLocaleString()} 원
                </div>

                {/* 상태 */}
                <div className="col-span-2 border-r border-[#6ea8e0]/40 py-1">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold ${
                      item.status === '판매중'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                {/* 삭제 버튼 (Solid Red Button matching Slide 3) */}
                <div className="col-span-2 px-2">
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    className="w-full bg-[#c80000] hover:bg-[#a60000] text-white font-bold text-sm py-2 rounded-none shadow transition-all active:scale-95 flex items-center justify-center"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer with Close button */}
        <div className="bg-[#eef5fc] p-3 border-t-2 border-[#2b71b8] flex justify-between items-center">
          <span className="text-xs text-slate-500 font-medium pl-2">
            총 {menuItems.length}개의 메뉴가 등록되어 있습니다.
          </span>
          <button
            onClick={() => setIsDeleteMenuModalOpen(false)}
            className="bg-[#1b5c9c] hover:bg-[#154677] text-white font-bold px-6 py-2 rounded-none text-sm transition-colors shadow"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
