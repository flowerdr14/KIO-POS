import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { MenuItem, MenuCategory, MenuOption, REMARK_STATUSES } from '../types';
import { INITIAL_MENU_ITEMS } from '../data/initialData';
import { Search, Plus, Trash2, Edit, Camera, Info, RotateCcw } from 'lucide-react';

export const MenuManagementView: React.FC = () => {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem, resetMenuPricesToDefault, showToast } = usePos();

  const [categoryFilter, setCategoryFilter] = useState<string>('전체');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected menu item for the right detail form
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(menuItems[0] || null);

  // Form State for Right Pane
  const [formName, setFormName] = useState(selectedItem?.name || '');
  const [formCategory, setFormCategory] = useState<MenuCategory>(selectedItem?.category || '커피');
  const [formPrice, setFormPrice] = useState<number>(selectedItem?.price || 4000);
  const [formStatus, setFormStatus] = useState<MenuItem['status']>(selectedItem?.status || '판매중');
  const [formHasOptions, setFormHasOptions] = useState<boolean>(selectedItem?.hasOptions || false);
  const [formOptions, setFormOptions] = useState<MenuOption[]>(selectedItem?.options || []);
  const [formDescription, setFormDescription] = useState<string>(selectedItem?.description || '');
  const [formIsAvailable, setFormIsAvailable] = useState<boolean>(selectedItem?.isAvailable ?? true);
  const [formRemark, setFormRemark] = useState<string>(selectedItem?.remark || '');
  const [formRemarks, setFormRemarks] = useState<string[]>(
    selectedItem?.remarks || (selectedItem?.remark ? [selectedItem.remark] : [])
  );
  const [formDiscountAmount, setFormDiscountAmount] = useState<number>(selectedItem?.discountAmount || 0);

  const isDiscountRelatedRemark = (status: string) => {
    if (!status) return false;
    return (
      status.includes('할인') ||
      status.includes('특가') ||
      status.includes('행사') ||
      status.includes('쿠폰')
    );
  };

  const hasDiscountRemark = formRemarks.some(isDiscountRelatedRemark);

  // When selection changes, update form fields
  const handleSelectItem = (item: MenuItem) => {
    setSelectedItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormPrice(item.price);
    setFormStatus(item.status);
    setFormHasOptions(item.hasOptions || false);
    setFormOptions(item.options || []);
    setFormDescription(item.description || '');
    setFormIsAvailable(item.isAvailable ?? true);
    setFormRemark(item.remark || (item.remarks && item.remarks[0]) || '');
    setFormRemarks(item.remarks || (item.remark ? [item.remark] : []));
    setFormDiscountAmount(item.discountAmount || 0);
  };

  const handleAddNewOption = () => {
    const newOpt: MenuOption = {
      id: `opt_${Date.now()}`,
      name: '',
      price: 500,
    };
    setFormOptions([...formOptions, newOpt]);
  };

  const handleUpdateOption = (id: string, field: 'name' | 'price', value: string | number) => {
    setFormOptions(formOptions.map((opt) => (opt.id === id ? { ...opt, [field]: value } : opt)));
  };

  const handleRemoveOption = (id: string) => {
    setFormOptions(formOptions.filter((opt) => opt.id !== id));
  };

  // Submit Save / Edit
  const handleSaveUpdate = () => {
    if (!selectedItem) {
      showToast('수정할 메뉴를 먼저 선택해주세요.');
      return;
    }
    if (!formName.trim()) {
      showToast('메뉴명을 입력해주세요.');
      return;
    }
    updateMenuItem(selectedItem.id, {
      name: formName,
      category: formCategory,
      price: Number(formPrice) || 0,
      status: formStatus,
      hasOptions: formHasOptions,
      options: formOptions,
      description: formDescription,
      isAvailable: formIsAvailable,
      remark: formRemark || formRemarks[0] || '',
      remarks: formRemarks,
      discountAmount: hasDiscountRemark ? (Number(formDiscountAmount) || 0) : 0,
    });
  };

  const handleCreateNew = () => {
    if (!formName.trim()) {
      showToast('새로 등록할 메뉴명을 입력해주세요.');
      return;
    }
    const code = `MN-${Math.floor(100 + Math.random() * 900)}`;
    const barcode = `880${Date.now().toString().slice(-7)}`;
    addMenuItem({
      code,
      name: formName,
      category: formCategory,
      price: Number(formPrice) || 0,
      status: formStatus,
      isAvailable: formIsAvailable,
      barcode,
      description: formDescription,
      hasOptions: formHasOptions,
      options: formOptions,
      remark: formRemark || formRemarks[0] || '',
      remarks: formRemarks,
      discountAmount: hasDiscountRemark ? (Number(formDiscountAmount) || 0) : 0,
      memo: '신규 등록 메뉴',
      recipe: '',
    });
  };

  const handleDelete = () => {
    if (!selectedItem) return;
    if (window.confirm(`'${selectedItem.name}' 메뉴를 삭제하시겠습니까?`)) {
      deleteMenuItem(selectedItem.id);
      setSelectedItem(null);
    }
  };

  const categoryPills = ['전체', '커피', '음료', '라떼', '에이드', '티', '디저트', '기타'];

  const filteredList = menuItems.filter((item) => {
    const matchesCat = categoryFilter === '전체' || item.category === categoryFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barcode.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const recentAdded = menuItems.slice(0, 5);

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 flex flex-col gap-6 select-none min-h-[calc(100vh-80px)]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Column: Menu List & Recent Added & Guide (col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Top Box: 메뉴 목록 */}
          <div className="border-2 border-[#2b71b8] bg-white shadow-sm flex flex-col">
            {/* Header with Search & Reset Price Button */}
            <div className="bg-[#4d94d8] px-4 py-2 flex items-center justify-between border-b-2 border-[#2b71b8] flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <h2 className="text-white text-xl font-bold">메뉴 목록</h2>
                <button
                  onClick={resetMenuPricesToDefault}
                  className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-2.5 py-1 rounded shadow flex items-center gap-1 transition-all active:scale-95"
                  title="모든 메뉴의 가격을 원래 기본 가격으로 초기화합니다."
                >
                  <RotateCcw size={13} />
                  <span>원래 가격으로 초기화</span>
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="메뉴명 / 코드로 검색하세요."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white text-slate-800 text-xs md:text-sm px-3 py-1 rounded w-56 border focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                <button className="bg-[#1b5c9c] hover:bg-[#154677] text-white text-xs md:text-sm font-bold px-3 py-1 rounded shadow-sm">
                  검색
                </button>
              </div>
            </div>

            {/* Category Filter Pills (Slide 9 exact tabs) */}
            <div className="flex items-center gap-1.5 p-2 bg-slate-50 border-b border-blue-200 overflow-x-auto">
              {categoryPills.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 text-xs font-bold rounded transition-all whitespace-nowrap ${
                    categoryFilter === cat
                      ? 'bg-[#1b5c9c] text-white shadow-sm'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 bg-[#1b5c9c] text-white text-center font-bold text-xs py-2 border-b border-[#2b71b8]">
              <div className="col-span-1 border-r border-blue-400">선택</div>
              <div className="col-span-1 border-r border-blue-400">번호</div>
              <div className="col-span-4 border-r border-blue-400">메뉴명</div>
              <div className="col-span-2 border-r border-blue-400">카테고리</div>
              <div className="col-span-2 border-r border-blue-400">가격</div>
              <div className="col-span-1 border-r border-blue-400">상태</div>
              <div className="col-span-1">관리</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-slate-100 min-h-[220px] max-h-[300px] overflow-y-auto">
              {filteredList.length === 0 ? (
                <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    ≡
                  </div>
                  <span className="text-sm font-medium">등록된 메뉴가 없습니다.</span>
                </div>
              ) : (
                filteredList.map((item, idx) => {
                  const isSelected = selectedItem?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      className={`grid grid-cols-12 text-center text-xs py-2 px-1 cursor-pointer transition-colors items-center ${
                        isSelected ? 'bg-blue-50 font-bold text-blue-900 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="col-span-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectItem(item)}
                          className="rounded text-blue-600 focus:ring-0"
                        />
                      </div>
                      <div className="col-span-1 font-mono text-slate-500">{idx + 1}</div>
                      <div className="col-span-4 text-left font-bold text-slate-800 truncate px-2 flex items-center gap-1">
                        <span className="truncate">{item.name}</span>
                        {item.discountAmount && item.discountAmount > 0 ? (
                          <span className="shrink-0 text-[9px] bg-rose-100 text-rose-700 px-1 py-0.5 rounded font-bold">
                            할인
                          </span>
                        ) : null}
                      </div>
                      <div className="col-span-2 text-slate-600">{item.category}</div>
                      <div className="col-span-2 font-mono font-bold text-slate-900 flex flex-col items-center justify-center leading-tight">
                        <span>{item.price.toLocaleString()} 원</span>
                        {item.discountAmount && item.discountAmount > 0 ? (
                          <span className="text-[10px] text-rose-600 font-normal">
                            (-{item.discountAmount.toLocaleString()}원)
                          </span>
                        ) : null}
                      </div>
                      <div className="col-span-1">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            item.status === '판매중'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div className="col-span-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectItem(item);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-bold text-xs"
                        >
                          선택
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Bottom Split: 추가된 메뉴 + 메뉴 관리 안내 (Slide 9 exact layout) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* 추가된 메뉴 (col-span-7) */}
            <div className="md:col-span-7 border-2 border-[#2b71b8] bg-white shadow-sm flex flex-col">
              <div className="bg-[#4d94d8] text-white px-4 py-1.5 text-lg font-bold border-b-2 border-[#2b71b8]">
                추가된 메뉴
              </div>
              <div className="grid grid-cols-12 bg-[#1b5c9c] text-white text-center font-bold text-[11px] py-1.5 border-b border-[#2b71b8]">
                <div className="col-span-1">번호</div>
                <div className="col-span-4">메뉴명</div>
                <div className="col-span-2">카테고리</div>
                <div className="col-span-2">가격</div>
                <div className="col-span-2">등록일</div>
                <div className="col-span-1">상태</div>
              </div>
              <div className="divide-y divide-slate-100 max-h-[160px] overflow-y-auto text-xs">
                {recentAdded.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className="grid grid-cols-12 text-center py-2 px-1 hover:bg-blue-50 cursor-pointer items-center"
                  >
                    <div className="col-span-1 font-mono text-slate-500">{idx + 1}</div>
                    <div className="col-span-4 text-left font-bold text-slate-800 truncate px-1">
                      {item.name}
                    </div>
                    <div className="col-span-2 text-slate-600 truncate">{item.category}</div>
                    <div className="col-span-2 font-mono font-bold">{item.price.toLocaleString()}</div>
                    <div className="col-span-2 text-[10px] text-slate-400">{item.createdAt}</div>
                    <div className="col-span-1 text-[10px] font-bold text-emerald-600">{item.status}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 메뉴 관리 안내 (col-span-5) */}
            <div className="md:col-span-5 border-2 border-[#2b71b8] bg-blue-50/50 p-4 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-2 font-bold text-[#1b5c9c] text-sm mb-3">
                <Info size={18} className="text-blue-600" />
                <span>메뉴 관리 안내</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
                <li>• 메뉴 추가, 수정, 삭제를 통해 매장 메뉴를 관리할 수 있습니다.</li>
                <li>• 카테고리별로 분류하여 더 편리하게 이용하세요.</li>
                <li>• 이미 판매 중인 메뉴는 삭제 시 신중하게 확인 후 삭제할 수 있습니다.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Menu Detail Info Editor (col-span-4, matches Slide 9) */}
        <div className="lg:col-span-4 border-2 border-[#2b71b8] bg-white shadow-sm flex flex-col">
          <div className="bg-[#4d94d8] text-white px-4 py-2 text-xl font-bold border-b-2 border-[#2b71b8]">
            메뉴 상세정보
          </div>

          <div className="p-4 flex-1 flex flex-col gap-3 overflow-y-auto text-xs">
            {/* Top row: Image Placeholder + Remarks Dropdown + Basic Inputs */}
            <div className="grid grid-cols-12 gap-3">
              {/* Image Box and Remarks under image (col-span-5) */}
              <div className="col-span-5 flex flex-col gap-2">
                <div className="aspect-square bg-slate-100 border border-slate-300 rounded flex flex-col items-center justify-center text-slate-400 gap-1 hover:bg-slate-200 cursor-pointer transition-colors shadow-inner">
                  <Camera size={26} />
                  <span className="text-[10px] font-medium">이미지 없음</span>
                </div>

                {/* 이미지 밑 비고 추가 영역 (28개 비고 상태 드롭다운) */}
                <div className="bg-blue-50/50 border border-blue-200 rounded p-2 flex flex-col gap-1.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                      <span>비고</span>
                      <span className="text-[10px] text-blue-600 font-normal">(28개 상태)</span>
                    </label>
                    {formRemarks.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormRemarks([]);
                          setFormRemark('');
                        }}
                        className="text-[10px] text-rose-500 hover:underline"
                      >
                        전체삭제
                      </button>
                    )}
                  </div>

                  <select
                    value=""
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      if (!formRemarks.includes(val)) {
                        const updated = [...formRemarks, val];
                        setFormRemarks(updated);
                        setFormRemark(val);
                        if (isDiscountRelatedRemark(val) && (!formDiscountAmount || formDiscountAmount === 0)) {
                          setFormDiscountAmount(500);
                        }
                      } else {
                        setFormRemark(val);
                      }
                    }}
                    className="w-full border border-[#2b71b8] rounded px-1.5 py-1 text-xs bg-white text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm"
                  >
                    <option value="">+ 비고 상태 드롭다운 추가...</option>
                    {REMARK_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  {/* Added remarks tags */}
                  <div className="flex flex-wrap gap-1 mt-0.5 max-h-24 overflow-y-auto">
                    {formRemarks.length === 0 ? (
                      <span className="text-[10px] text-slate-400 italic">비고 상태를 드롭다운에서 선택하세요.</span>
                    ) : (
                      formRemarks.map((status) => (
                        <span
                          key={status}
                          className="bg-[#2b82d9] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm inline-flex items-center gap-1"
                        >
                          <span>{status}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formRemarks.filter((r) => r !== status);
                              setFormRemarks(updated);
                              if (formRemark === status) {
                                setFormRemark(updated[0] || '');
                              }
                            }}
                            className="hover:text-rose-200 font-bold text-xs"
                            title="삭제"
                          >
                            ✕
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* 할인 관련 비고 선택 시 노출되는 할인 금액 입력 칸 */}
                  {hasDiscountRemark && (
                    <div className="mt-1.5 p-2 bg-rose-50/90 border border-rose-300 rounded flex flex-col gap-1.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-rose-800 text-[11px] flex items-center gap-1">
                          <span>할인 금액 입력</span>
                          <span className="text-[10px] text-rose-500 font-normal">(직접입력)</span>
                        </label>
                        <span className="text-[10px] font-mono font-bold text-rose-700">
                          할인적용가: {Math.max(0, (Number(formPrice) || 0) - (Number(formDiscountAmount) || 0)).toLocaleString()}원
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={formDiscountAmount || ''}
                          onChange={(e) => setFormDiscountAmount(Math.max(0, Number(e.target.value)))}
                          placeholder="할인 금액 입력"
                          className="w-full border border-rose-300 rounded px-2 py-1 text-xs bg-white text-rose-900 font-black focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono text-right"
                          min={0}
                          step={100}
                        />
                        <span className="text-xs font-bold text-rose-800 shrink-0">원</span>
                      </div>

                      {/* Quick discount buttons */}
                      <div className="grid grid-cols-4 gap-1">
                        {[500, 1000, 1500, 2000].map((quick) => (
                          <button
                            key={quick}
                            type="button"
                            onClick={() => setFormDiscountAmount(quick)}
                            className={`py-0.5 text-[10px] font-mono font-bold rounded border transition-colors ${
                              formDiscountAmount === quick
                                ? 'bg-rose-600 text-white border-rose-700'
                                : 'bg-white hover:bg-rose-100 text-rose-700 border-rose-200'
                            }`}
                          >
                            -{quick}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Inputs (col-span-7) */}
              <div className="col-span-7 flex flex-col gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">메뉴명</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="메뉴명 입력"
                    className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">카테고리</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as MenuCategory)}
                    className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="커피">커피</option>
                    <option value="음료">음료</option>
                    <option value="라떼">라떼</option>
                    <option value="에이드">에이드</option>
                    <option value="티">티</option>
                    <option value="디저트">디저트</option>
                    <option value="기타">기타</option>
                    <option value="DRINK">DRINK</option>
                    <option value="DOUGNUT">DOUGNUT</option>
                    <option value="TEA">TEA</option>
                    <option value="FRIED">FRIED</option>
                    <option value="DESERT">DESERT</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="font-bold text-slate-700">가격</label>
                    <button
                      type="button"
                      onClick={() => {
                        const canonical = INITIAL_MENU_ITEMS.find((m) => m.name === formName || m.id === selectedItem?.id);
                        if (canonical) {
                          setFormPrice(canonical.price);
                          showToast(`원래 가격(${canonical.price.toLocaleString()}원)으로 복원되었습니다.`);
                        } else {
                          setFormPrice(4000);
                        }
                      }}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-bold hover:underline"
                    >
                      원래 가격으로 변경
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={formPrice}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      className="w-full border rounded px-2 py-1 text-xs font-mono font-bold text-right"
                    />
                    <span className="text-slate-600 font-bold">원</span>
                  </div>
                  {hasDiscountRemark && (
                    <div className="mt-1 p-1.5 bg-rose-50 border border-rose-200 rounded text-[11px] flex items-center justify-between text-rose-800 font-bold">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>
                        할인적용: -{Number(formDiscountAmount || 0).toLocaleString()}원
                      </span>
                      <span className="font-mono text-xs text-rose-700">
                        최종 {Math.max(0, (Number(formPrice) || 0) - (Number(formDiscountAmount) || 0)).toLocaleString()}원
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">상태</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as MenuItem['status'])}
                    className="w-full border rounded px-2 py-1 text-xs bg-white"
                  >
                    <option value="판매중">판매중</option>
                    <option value="품절">품절</option>
                    <option value="판매중지">판매중지</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Options Configuration */}
            <div className="border border-blue-200 rounded p-2.5 bg-slate-50/50 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formHasOptions}
                    onChange={(e) => setFormHasOptions(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>옵션 설정 (옵션 사용함)</span>
                </label>
              </div>

              {formHasOptions && (
                <div className="space-y-1.5 mt-1">
                  {formOptions.map((opt) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="옵션명 (예: 샷 추가)"
                        value={opt.name}
                        onChange={(e) => handleUpdateOption(opt.id, 'name', e.target.value)}
                        className="flex-1 border rounded px-2 py-0.5 text-xs bg-white"
                      />
                      <input
                        type="number"
                        placeholder="추가금액"
                        value={opt.price}
                        onChange={(e) => handleUpdateOption(opt.id, 'price', Number(e.target.value))}
                        className="w-20 border rounded px-2 py-0.5 text-xs font-mono text-right bg-white"
                      />
                      <button
                        onClick={() => handleRemoveOption(opt.id)}
                        className="text-slate-400 hover:text-rose-600 p-0.5"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleAddNewOption}
                    className="w-full py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs flex items-center justify-center gap-1 mt-1"
                  >
                    <Plus size={14} />
                    <span>옵션 추가</span>
                  </button>
                </div>
              )}
            </div>

            {/* Menu Description */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700">메뉴 설명</label>
                <span className="text-[10px] text-slate-400">{formDescription.length} / 500</span>
              </div>
              <textarea
                rows={3}
                maxLength={500}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="메뉴에 대한 상세 설명을 입력하세요."
                className="w-full border rounded p-2 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Radio: 판매 여부 */}
            <div className="flex items-center gap-4 pt-1">
              <span className="font-bold text-slate-700">판매 여부:</span>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="availability"
                  checked={formIsAvailable === true}
                  onChange={() => setFormIsAvailable(true)}
                  className="text-blue-600"
                />
                <span>판매중</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="availability"
                  checked={formIsAvailable === false}
                  onChange={() => setFormIsAvailable(false)}
                  className="text-blue-600"
                />
                <span>판매중지</span>
              </label>
            </div>

            {/* Bottom Action Buttons (메뉴 추가, 메뉴 수정, 메뉴 삭제) */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t mt-auto">
              <button
                id="btn-menu-add-new"
                onClick={handleCreateNew}
                className="bg-[#2977ca] hover:bg-[#1f63ab] text-white font-bold py-2.5 rounded text-xs flex items-center justify-center gap-1 shadow"
              >
                <Plus size={14} />
                <span>메뉴 추가</span>
              </button>

              <button
                id="btn-menu-modify"
                onClick={handleSaveUpdate}
                className="bg-[#2977ca] hover:bg-[#1f63ab] text-white font-bold py-2.5 rounded text-xs flex items-center justify-center gap-1 shadow"
              >
                <Edit size={14} />
                <span>메뉴 수정</span>
              </button>

              <button
                id="btn-menu-delete"
                onClick={handleDelete}
                className="bg-[#c80000] hover:bg-[#a30000] text-white font-bold py-2.5 rounded text-xs flex items-center justify-center gap-1 shadow"
              >
                <Trash2 size={14} />
                <span>메뉴 삭제</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
