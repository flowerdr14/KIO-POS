import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { MenuItem, MenuCategory, MenuOption, MenuIngredient, REMARK_STATUSES } from '../types';
import { INITIAL_MENU_ITEMS } from '../data/initialData';
import { Search, Plus, Trash2, Edit, Camera, Info, RotateCcw, Truck, MapPin, CheckSquare, Square, ShoppingCart, CheckCircle2, PackageCheck, Printer, Package, RefreshCw } from 'lucide-react';

export interface IngredientItem {
  id: string;
  name: string;
  spec: string;
  unitPrice: number;
}

export const getDefaultIngredientsForMenu = (menuName: string, category: string, recipe?: string): MenuIngredient[] => {
  if (recipe && recipe.includes('+')) {
    return recipe.split('+').map((part, idx) => {
      const trimmed = part.trim();
      return {
        id: `recipe_ing_${idx}_${Date.now()}`,
        name: trimmed,
        amount: '1회분'
      };
    });
  }
  if (menuName.includes('아이스크림 (컵)')) {
    return [
      { id: 'def_ing_1', name: '소프트 아이스크림 원액 (상하목장 1등급)', amount: '150ml' },
      { id: 'def_ing_2', name: '10oz 전용 아이스크림 컵 & 투명 리드', amount: '1세트' },
      { id: 'def_ing_3', name: '친환경 우드 미니 스푼', amount: '1개' }
    ];
  }
  if (menuName.includes('아이스크림 (콘)')) {
    return [
      { id: 'def_ing_4', name: '수제 바삭 버터 와플 콘', amount: '1개' },
      { id: 'def_ing_5', name: '소프트 아이스크림 원액 (상하목장 1등급)', amount: '150ml' },
      { id: 'def_ing_6', name: '와플 콘 전용 로고 종이 슬리브', amount: '1개' }
    ];
  }
  if (menuName.includes('아메리카노') || menuName.includes('커피')) {
    return [
      { id: 'def_ing_7', name: '에스프레소 시그니처 블렌드 원두', amount: '2샷 (30g)' },
      { id: 'def_ing_8', name: '정제수 (온수/냉수)', amount: '180ml' },
      { id: 'def_ing_9', name: '전용 테이크아웃 컵 & 리드', amount: '1세트' }
    ];
  }
  if (menuName.includes('라떼') || menuName.includes('카푸치노')) {
    return [
      { id: 'def_ing_10', name: '에스프레소 시그니처 블렌드 원두', amount: '2샷 (30g)' },
      { id: 'def_ing_11', name: '바리스타 전용 신선 매일우유', amount: '200ml' },
      { id: 'def_ing_12', name: '스팀 밀크폼', amount: '적당량' }
    ];
  }
  if (menuName.includes('도넛') || category === 'DOUGNUT') {
    return [
      { id: 'def_ing_13', name: '도넛 전용 냉동 생지 베이스', amount: '1개' },
      { id: 'def_ing_14', name: '글레이즈 슈가 코팅 시럽 & 아이싱', amount: '20g' },
      { id: 'def_ing_15', name: '도넛 개별 포장 유산지', amount: '1장' }
    ];
  }
  if (menuName.includes('티') || category === 'TEA') {
    return [
      { id: 'def_ing_16', name: '유기농 삼각 피라미드 티백', amount: '1팩' },
      { id: 'def_ing_17', name: '온수 (90도)', amount: '250ml' },
      { id: 'def_ing_18', name: '내열 종이컵 & 리드', amount: '1세트' }
    ];
  }
  return [
    { id: 'def_ing_gen_1', name: `${menuName} 전용 제조 원재료`, amount: '1회분' },
    { id: 'def_ing_gen_2', name: '전용 용기 / 컵 세트', amount: '1개' }
  ];
};

export const getIngredientsForMenu = (menuName: string, customIngredients?: MenuIngredient[]): IngredientItem[] => {
  if (customIngredients && customIngredients.length > 0) {
    return customIngredients.map((ci, idx) => ({
      id: ci.id || `custom_ing_${idx}`,
      name: ci.name,
      spec: ci.amount ? `업소용 대용량 (${ci.amount} 규격)` : '1박스 / 500개입',
      unitPrice: ci.unitPrice || (idx % 2 === 0 ? 18000 : 12000),
    }));
  }
  if (menuName.includes('아이스크림 (컵)')) {
    return [
      { id: 'ing_cup_1', name: '소프트 아이스크림 원액 (상하목장 1등급)', spec: '10L / 1박스', unitPrice: 25000 },
      { id: 'ing_cup_2', name: '아이스크림 전용 투명 컵 & 스푼 세트', spec: '500개입 / 1박스', unitPrice: 18000 },
      { id: 'ing_cup_3', name: '딸기맛 시럽 & 퓨레 베이스', spec: '1.2kg / 1병', unitPrice: 8500 },
      { id: 'ing_cup_4', name: '진한 초콜릿 디핑 소스/시럽', spec: '1.2kg / 1병', unitPrice: 9000 },
      { id: 'ing_cup_5', name: '바삭 초코웨이퍼 롱스틱 토핑', spec: '1kg / 1봉지', unitPrice: 12000 },
      { id: 'ing_cup_6', name: '마라스키노 체리 통조림 토핑', spec: '1kg / 1캔', unitPrice: 14000 },
    ];
  }
  if (menuName.includes('아이스크림 (콘)')) {
    return [
      { id: 'ing_cone_1', name: '수제 바삭 버터 와플 콘', spec: '100개입 / 1박스', unitPrice: 22000 },
      { id: 'ing_cone_2', name: '소프트 아이스크림 원액 (상하목장 1등급)', spec: '10L / 1박스', unitPrice: 25000 },
      { id: 'ing_cone_3', name: '와플 콘 전용 로고 종이 슬리브', spec: '500개입 / 1박스', unitPrice: 9500 },
      { id: 'ing_cone_4', name: '딸기맛 시럽 & 퓨레 베이스', spec: '1.2kg / 1병', unitPrice: 8500 },
      { id: 'ing_cone_5', name: '진한 초콜릿 디핑 소스/시럽', spec: '1.2kg / 1병', unitPrice: 9000 },
      { id: 'ing_cone_6', name: '바삭 초코웨이퍼 롱스틱 토핑', spec: '1kg / 1봉지', unitPrice: 12000 },
      { id: 'ing_cone_7', name: '마라스키노 체리 통조림 토핑', spec: '1kg / 1캔', unitPrice: 14000 },
    ];
  }
  if (menuName.includes('아메리카노') || menuName.includes('커피')) {
    return [
      { id: 'ing_ame_1', name: '에스프레소 시그니처 블렌드 원두', spec: '1kg / 1봉', unitPrice: 24000 },
      { id: 'ing_ame_2', name: '16oz 테이크아웃 컵 & 리드 세트', spec: '500개입 / 1박스', unitPrice: 19000 },
      { id: 'ing_ame_3', name: '친환경 생분해 종이 빨대', spec: '1,000개입 / 1박스', unitPrice: 7000 },
      { id: 'ing_ame_4', name: '크라프트 컵홀더 & 2구 캐리어', spec: '500개입 / 1박스', unitPrice: 9500 },
    ];
  }
  if (menuName.includes('라떼') || menuName.includes('카푸치노')) {
    return [
      { id: 'ing_lat_1', name: '에스프레소 시그니처 블렌드 원두', spec: '1kg / 1봉', unitPrice: 24000 },
      { id: 'ing_lat_2', name: '바리스타 전용 신선 매일우유 1L', spec: '10팩 / 1박스', unitPrice: 23000 },
      { id: 'ing_lat_3', name: '프리미엄 바닐라 시럽', spec: '1L / 1병', unitPrice: 11000 },
      { id: 'ing_lat_4', name: '카푸치노 전용 시나몬 파우더', spec: '500g / 1통', unitPrice: 6500 },
    ];
  }
  if (menuName.includes('도넛') || menuName.includes('DOUGNUT')) {
    return [
      { id: 'ing_dnt_1', name: '수제 도넛 전용 프리미엄 냉동 생지', spec: '50개입 / 1박스', unitPrice: 32000 },
      { id: 'ing_dnt_2', name: '글레이즈 슈가 코팅 시럽 & 아이싱', spec: '2kg / 1통', unitPrice: 12000 },
      { id: 'ing_dnt_3', name: '도넛 전용 선물 박스 & 유산지', spec: '200세트 / 1박스', unitPrice: 16000 },
      { id: 'ing_dnt_4', name: '초콜릿 드리즐 & 크런치 토핑', spec: '1kg / 1팩', unitPrice: 11000 },
    ];
  }
  if (menuName.includes('티') || menuName.includes('TEA') || menuName.includes('캐모마일') || menuName.includes('얼그레이')) {
    return [
      { id: 'ing_tea_1', name: '유기농 삼각 피라미드 티백 세트', spec: '50개입 / 1팩', unitPrice: 18000 },
      { id: 'ing_tea_2', name: '벌꿀 & 아카시아 액상 스위트너', spec: '1kg / 1통', unitPrice: 8500 },
      { id: 'ing_tea_3', name: '말린 레몬 슬라이스 & 허브 토핑', spec: '200g / 1봉', unitPrice: 9000 },
      { id: 'ing_tea_4', name: '내열 종이컵 & 전용 리드 (13oz)', spec: '500개입 / 1박스', unitPrice: 17000 },
    ];
  }
  return [
    { id: `ing_gen_1_${menuName}`, name: `${menuName} 전용 제조 베이스 원재료`, spec: '1박스', unitPrice: 22000 },
    { id: `ing_gen_2_${menuName}`, name: `${menuName} 전용 포장 용기 & 스푼/스트로우`, spec: '500세트 / 1박스', unitPrice: 15000 },
    { id: `ing_gen_3_${menuName}`, name: '토핑용 부재료 & 파우더 믹스', spec: '1kg / 1봉', unitPrice: 8500 },
    { id: `ing_gen_4_${menuName}`, name: '전용 소스 & 시럽', spec: '1.2kg / 1통', unitPrice: 9500 },
  ];
};

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

  // 만들기 위한 재료 (레시피 원재료) State
  const [formIngredients, setFormIngredients] = useState<MenuIngredient[]>(() => {
    if (selectedItem?.recipeIngredients && selectedItem.recipeIngredients.length > 0) {
      return selectedItem.recipeIngredients;
    }
    return selectedItem ? getDefaultIngredientsForMenu(selectedItem.name, selectedItem.category, selectedItem.recipe) : [];
  });
  const [newIngName, setNewIngName] = useState('');
  const [newIngAmount, setNewIngAmount] = useState('');

  const handleAddIngredient = (name?: string, amount?: string) => {
    const targetName = (name !== undefined ? name : newIngName).trim();
    if (!targetName) {
      showToast('추가할 재료명을 입력해주세요.');
      return;
    }
    const targetAmount = (amount !== undefined ? amount : newIngAmount).trim() || '1회분';
    const newIng: MenuIngredient = {
      id: `ing_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: targetName,
      amount: targetAmount,
    };
    setFormIngredients((prev) => [...prev, newIng]);
    if (name === undefined) {
      setNewIngName('');
      setNewIngAmount('');
    }
    showToast(`'${targetName}' (${targetAmount}) 재료가 추가되었습니다.`);
  };

  const handleRemoveIngredient = (id: string) => {
    setFormIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  const handleUpdateIngredient = (id: string, field: 'name' | 'amount', value: string) => {
    setFormIngredients((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  const handleResetDefaultIngredients = () => {
    if (!formName.trim()) return;
    const defaults = getDefaultIngredientsForMenu(formName, formCategory, selectedItem?.recipe);
    setFormIngredients(defaults);
    showToast(`'${formName}'의 기본 추천 재료(${defaults.length}개)가 설정되었습니다.`);
  };

  // 우리 매장 배송 주소
  const OUR_STORE_ADDRESS = '로블시 입양구 블록스로 67-1';

  // 재료 발주하기 (Material Ordering) State
  const [orderSupplier, setOrderSupplier] = useState<'키오포스도매매장' | '스타로벅스재료발주매장'>('키오포스도매매장');
  const [orderMenuId, setOrderMenuId] = useState<string>(() => {
    const ice = menuItems.find((m) => m.name.includes('아이스크림'));
    return ice ? ice.id : (menuItems[0]?.id || '');
  });

  // Find active menu for order
  const activeOrderMenu = menuItems.find((m) => m.id === orderMenuId) || menuItems[0];
  const currentIngredients = activeOrderMenu
    ? getIngredientsForMenu(activeOrderMenu.name, activeOrderMenu.recipeIngredients)
    : [];

  // Selected ingredients state (list of ingredient IDs)
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>(() => {
    const initial = activeOrderMenu
      ? getIngredientsForMenu(activeOrderMenu.name, activeOrderMenu.recipeIngredients)
      : [];
    return initial.slice(0, 2).map((i) => i.id);
  });
  const [ingredientQuantities, setIngredientQuantities] = useState<Record<string, number>>({});

  // Success Confirmation Modal
  const [orderSuccessModal, setOrderSuccessModal] = useState<{
    orderId: string;
    supplier: string;
    menuName: string;
    items: Array<{ name: string; spec: string; qty: number; total: number }>;
    totalPrice: number;
    orderDate: string;
  } | null>(null);

  const handleOrderMenuChange = (newMenuId: string) => {
    setOrderMenuId(newMenuId);
    const targetMenu = menuItems.find((m) => m.id === newMenuId);
    if (targetMenu) {
      const ings = getIngredientsForMenu(targetMenu.name, targetMenu.recipeIngredients);
      setSelectedIngredientIds(ings.slice(0, 2).map((i) => i.id));
    } else {
      setSelectedIngredientIds([]);
    }
  };

  const handleToggleIngredient = (ingId: string) => {
    if (selectedIngredientIds.includes(ingId)) {
      setSelectedIngredientIds(selectedIngredientIds.filter((id) => id !== ingId));
    } else {
      setSelectedIngredientIds([...selectedIngredientIds, ingId]);
      if (!ingredientQuantities[ingId]) {
        setIngredientQuantities((prev) => ({ ...prev, [ingId]: 1 }));
      }
    }
  };

  const handleSelectAllIngredients = () => {
    setSelectedIngredientIds(currentIngredients.map((i) => i.id));
  };

  const handleDeselectAllIngredients = () => {
    setSelectedIngredientIds([]);
  };

  const handleQtyChange = (ingId: string, delta: number) => {
    setIngredientQuantities((prev) => {
      const cur = prev[ingId] || 1;
      const next = Math.max(1, cur + delta);
      return { ...prev, [ingId]: next };
    });
  };

  const totalOrderPrice = currentIngredients
    .filter((ing) => selectedIngredientIds.includes(ing.id))
    .reduce((sum, ing) => sum + ing.unitPrice * (ingredientQuantities[ing.id] || 1), 0);

  const handleSubmitIngredientOrder = () => {
    if (selectedIngredientIds.length === 0) {
      showToast('발주할 재료를 1개 이상 선택해주세요.');
      return;
    }
    const ordered = currentIngredients
      .filter((ing) => selectedIngredientIds.includes(ing.id))
      .map((ing) => ({
        name: ing.name,
        spec: ing.spec,
        qty: ingredientQuantities[ing.id] || 1,
        total: ing.unitPrice * (ingredientQuantities[ing.id] || 1),
      }));

    const record = {
      orderId: `PO-${Date.now().toString().slice(-6)}`,
      supplier: orderSupplier,
      menuName: activeOrderMenu?.name || '선택 메뉴',
      items: ordered,
      totalPrice: totalOrderPrice,
      orderDate: new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setOrderSuccessModal(record);
    showToast(`[${orderSupplier}]으로 총 ${totalOrderPrice.toLocaleString()}원 재료 발주가 접수되었습니다.`);
  };

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

    // Load recipe ingredients
    if (item.recipeIngredients && item.recipeIngredients.length > 0) {
      setFormIngredients(item.recipeIngredients);
    } else if (item.ingredients && item.ingredients.length > 0) {
      setFormIngredients(item.ingredients.map((ing, idx) => ({
        id: `ing_${idx}_${Date.now()}`,
        name: ing,
        amount: '1회분'
      })));
    } else {
      setFormIngredients(getDefaultIngredientsForMenu(item.name, item.category, item.recipe));
    }
    setNewIngName('');
    setNewIngAmount('');
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
      recipeIngredients: formIngredients,
      ingredients: formIngredients.map((i) => i.name),
      recipe: formIngredients.map((i) => `${i.name} ${i.amount || ''}`.trim()).join(' + '),
      description: formDescription,
      isAvailable: formIsAvailable,
      remark: formRemark || formRemarks[0] || '',
      remarks: formRemarks,
      discountAmount: hasDiscountRemark ? (Number(formDiscountAmount) || 0) : 0,
    });
    showToast(`'${formName}' 메뉴 상세정보 및 만들기 재료(${formIngredients.length}개)가 저장되었습니다.`);
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
      recipeIngredients: formIngredients,
      ingredients: formIngredients.map((i) => i.name),
      recipe: formIngredients.map((i) => `${i.name} ${i.amount || ''}`.trim()).join(' + '),
      remark: formRemark || formRemarks[0] || '',
      remarks: formRemarks,
      discountAmount: hasDiscountRemark ? (Number(formDiscountAmount) || 0) : 0,
      memo: '신규 등록 메뉴',
    });
    showToast(`'${formName}' 신규 메뉴 및 만들기 재료(${formIngredients.length}개)가 추가되었습니다.`);
  };

  const handleDelete = () => {
    if (!selectedItem) return;
    if (window.confirm(`'${selectedItem.name}' 메뉴를 삭제하시겠습니까?`)) {
      deleteMenuItem(selectedItem.id);
      setSelectedItem(null);
    }
  };

  const categoryPills = ['전체', 'DRINK', 'DOUGNUT', 'TEA', 'ICE CREAM', 'DESERT', '커피', '음료', '라떼', '에이드', '티', '디저트', '기타'];

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
                        {item.recipeIngredients && item.recipeIngredients.length > 0 ? (
                          <span
                            className="shrink-0 text-[9px] bg-blue-100 text-[#1b5c9c] px-1 py-0.5 rounded font-bold"
                            title={`만들기 재료: ${item.recipeIngredients.map((i) => i.name).join(', ')}`}
                          >
                            재료 {item.recipeIngredients.length}
                          </span>
                        ) : null}
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

          {/* Bottom Split: 추가된 메뉴 + 재료 발주하기 */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            {/* 추가된 메뉴 (col-span-5) */}
            <div className="xl:col-span-5 border-2 border-[#2b71b8] bg-white shadow-sm flex flex-col">
              <div className="bg-[#4d94d8] text-white px-3 py-1.5 text-base font-bold border-b-2 border-[#2b71b8] flex items-center justify-between">
                <span>추가된 메뉴</span>
                <span className="text-xs font-normal text-blue-100">{recentAdded.length}개 항목</span>
              </div>
              <div className="grid grid-cols-12 bg-[#1b5c9c] text-white text-center font-bold text-[11px] py-1.5 border-b border-[#2b71b8]">
                <div className="col-span-1">No</div>
                <div className="col-span-4">메뉴명</div>
                <div className="col-span-3">카테고리</div>
                <div className="col-span-2">가격</div>
                <div className="col-span-2">상태</div>
              </div>
              <div className="divide-y divide-slate-100 max-h-[260px] overflow-y-auto text-xs">
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
                    <div className="col-span-3 text-slate-600 truncate">{item.category}</div>
                    <div className="col-span-2 font-mono font-bold text-[#1b5c9c]">{item.price.toLocaleString()}</div>
                    <div className="col-span-2 text-[10px] font-bold text-emerald-600">{item.status}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 재료 발주하기 (col-span-7) */}
            <div className="xl:col-span-7 border-2 border-[#2b71b8] bg-white shadow-sm flex flex-col overflow-hidden">
              {/* Header */}
              <div className="bg-[#1b5c9c] text-white px-3 py-2 flex items-center justify-between border-b-2 border-[#2b71b8]">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Truck size={17} className="text-yellow-300" />
                  <span>재료 발주하기</span>
                </div>
                <span className="text-[10px] bg-blue-700/80 text-blue-100 px-2 py-0.5 rounded font-mono border border-blue-400/40">
                  직접 발주 시스템
                </span>
              </div>

              <div className="p-3 flex flex-col gap-2 bg-slate-50/50 text-xs flex-1">
                {/* 우리 매장 주소 배너 */}
                <div className="bg-amber-50 border border-amber-300 px-2.5 py-1.5 rounded flex items-center gap-2 text-amber-900 shadow-xs">
                  <MapPin size={15} className="text-amber-600 shrink-0" />
                  <div className="flex-1 flex flex-wrap items-center justify-between gap-1 text-[11px]">
                    <span className="font-bold text-slate-800">우리 매장 주소:</span>
                    <span className="font-black text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded border border-amber-300">
                      {OUR_STORE_ADDRESS}
                    </span>
                  </div>
                </div>

                {/* 발주매장 드롭다운 + 메뉴 선택하기 드롭다운 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5 text-[11px]">
                      발주매장 선택
                    </label>
                    <select
                      value={orderSupplier}
                      onChange={(e) => setOrderSupplier(e.target.value as '키오포스도매매장' | '스타로벅스재료발주매장')}
                      className="w-full border border-blue-400 rounded px-2 py-1 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
                    >
                      <option value="키오포스도매매장">키오포스도매매장</option>
                      <option value="스타로벅스재료발주매장">스타로벅스재료발주매장</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5 text-[11px]">
                      메뉴 선택하기
                    </label>
                    <select
                      value={orderMenuId}
                      onChange={(e) => handleOrderMenuChange(e.target.value)}
                      className="w-full border border-blue-400 rounded px-2 py-1 text-xs font-bold text-[#1b5c9c] bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
                    >
                      {menuItems.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} [{m.category}] ({m.price.toLocaleString()}원)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 재료 선택 영역 ("내가 직접 발주할 재료만 선택") */}
                <div className="border border-slate-300 rounded bg-white p-2 flex flex-col gap-1.5 shadow-xs">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200 text-[11px]">
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <PackageCheck size={14} className="text-[#1b5c9c]" />
                      <span>[{activeOrderMenu?.name}] 발주할 재료 선택</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        ({selectedIngredientIds.length}/{currentIngredients.length}개 선택됨)
                      </span>
                    </span>
                    <div className="flex gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={handleSelectAllIngredients}
                        className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 font-bold border border-blue-200"
                      >
                        전체선택
                      </button>
                      <button
                        type="button"
                        onClick={handleDeselectAllIngredients}
                        className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 font-bold border border-slate-200"
                      >
                        선택해제
                      </button>
                    </div>
                  </div>

                  {/* 재료 리스트 */}
                  <div className="max-h-[135px] overflow-y-auto divide-y divide-slate-100 pr-1">
                    {currentIngredients.map((ing) => {
                      const isChecked = selectedIngredientIds.includes(ing.id);
                      const qty = ingredientQuantities[ing.id] || 1;
                      const lineTotal = ing.unitPrice * qty;

                      return (
                        <div
                          key={ing.id}
                          className={`py-1 px-1.5 flex items-center justify-between gap-1.5 rounded transition-colors ${
                            isChecked ? 'bg-blue-50/80 text-slate-900 font-bold' : 'text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <label className="flex items-center gap-1.5 cursor-pointer flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleIngredient(ing.id)}
                              className="w-3.5 h-3.5 text-[#1b5c9c] rounded border-slate-300 focus:ring-blue-500 cursor-pointer shrink-0"
                            />
                            <div className="truncate">
                              <span className="text-xs">{ing.name}</span>
                              <span className="text-[10px] text-slate-400 font-normal ml-1">({ing.spec})</span>
                            </div>
                          </label>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono text-[11px] text-slate-600">
                              {ing.unitPrice.toLocaleString()}원
                            </span>

                            <div className="flex items-center border border-slate-300 rounded bg-white">
                              <button
                                type="button"
                                disabled={!isChecked}
                                onClick={() => handleQtyChange(ing.id, -1)}
                                className="w-4 h-4 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-20 text-xs"
                              >
                                -
                              </button>
                              <span className="w-5 text-center font-mono text-[11px] font-bold">
                                {qty}
                              </span>
                              <button
                                type="button"
                                disabled={!isChecked}
                                onClick={() => handleQtyChange(ing.id, 1)}
                                className="w-4 h-4 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-20 text-xs"
                              >
                                +
                              </button>
                            </div>

                            <span className="font-mono text-xs font-black text-[#1b5c9c] w-14 text-right">
                              ₩ {lineTotal.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 하단 총 주문 가격 & 발주 신청 버튼 */}
                <div className="p-2 bg-blue-50 border border-blue-200 rounded flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-bold text-slate-700">총 주문 가격:</span>
                    <span className="font-mono text-base font-black text-[#1b5c9c]">
                      ₩ {totalOrderPrice.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      ({selectedIngredientIds.length}개 선택)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmitIngredientOrder}
                    disabled={selectedIngredientIds.length === 0}
                    className="w-full sm:w-auto px-3.5 py-1.5 bg-[#2977ca] hover:bg-[#1f63ab] disabled:bg-slate-300 text-white font-bold rounded text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <ShoppingCart size={13} />
                    <span>재료 발주 신청하기</span>
                  </button>
                </div>
              </div>
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
                    <option value="ICE CREAM">ICE CREAM</option>
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

            {/* 만들기 위한 재료 (레시피 원재료) 추가 및 관리 */}
            <div className="border border-blue-300 rounded p-2.5 bg-blue-50/40 flex flex-col gap-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                  <Package size={15} className="text-[#1b5c9c]" />
                  <span>만들기 위한 재료 (레시피 원재료)</span>
                  <span className="bg-[#1b5c9c] text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                    {formIngredients.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleResetDefaultIngredients}
                  className="text-[10px] text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1 font-bold"
                  title="이 메뉴의 기본 추천 재료 자동 불러오기"
                >
                  <RefreshCw size={11} />
                  <span>기본재료 추천</span>
                </button>
              </div>

              {/* Current ingredients list */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                {formIngredients.length === 0 ? (
                  <div className="p-3 bg-white rounded border border-dashed border-slate-300 text-center text-slate-400 text-[11px]">
                    등록된 만들기 재료가 없습니다. 아래에서 재료를 추가해주세요.
                  </div>
                ) : (
                  formIngredients.map((ing, idx) => (
                    <div
                      key={ing.id}
                      className="flex items-center gap-1.5 bg-white p-1.5 rounded border border-blue-100 shadow-2xs hover:border-blue-300 transition-colors"
                    >
                      <span className="w-5 text-center text-[10px] font-mono text-slate-400 font-bold">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={ing.name}
                        onChange={(e) => handleUpdateIngredient(ing.id, 'name', e.target.value)}
                        placeholder="재료명 (예: 소프트 아이스크림 원액)"
                        className="flex-1 border border-slate-200 rounded px-1.5 py-0.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={ing.amount || ''}
                        onChange={(e) => handleUpdateIngredient(ing.id, 'amount', e.target.value)}
                        placeholder="분량 (예: 150ml)"
                        className="w-24 border border-slate-200 rounded px-1.5 py-0.5 text-xs font-mono text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 text-right"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(ing.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="재료 삭제"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Input Row for Adding a New Ingredient */}
              <div className="bg-white p-2 rounded border border-blue-200 shadow-2xs flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span>새 재료 직접 추가</span>
                  <span className="text-[10px] text-slate-400 font-normal">재료명 및 소요 분량</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="재료명 (예: 초코시럽, 우유, 원두)"
                    value={newIngName}
                    onChange={(e) => setNewIngName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddIngredient();
                      }
                    }}
                    className="flex-1 border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="분량 (예: 20g, 1회분)"
                    value={newIngAmount}
                    onChange={(e) => setNewIngAmount(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddIngredient();
                      }
                    }}
                    className="w-24 border rounded px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 text-right"
                  />
                  <button
                    type="button"
                    id="btn-add-ingredient"
                    onClick={() => handleAddIngredient()}
                    className="bg-[#2977ca] hover:bg-[#1f63ab] text-white font-bold px-3 py-1 rounded text-xs flex items-center gap-1 shadow-xs shrink-0"
                  >
                    <Plus size={13} />
                    <span>재료 추가</span>
                  </button>
                </div>

                {/* Quick add recommendation chips */}
                <div className="flex items-center gap-1 flex-wrap pt-0.5">
                  <span className="text-[10px] text-slate-400 font-medium">빠른 추가:</span>
                  {['에스프레소 샷', '신선우유', '바닐라 시럽', '초코 시럽', '각얼음', '와플콘', '토핑 믹스', '전용컵'].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleAddIngredient(chip, '1회분')}
                      className="text-[10px] bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 px-1.5 py-0.5 rounded border border-slate-200 transition-colors font-medium"
                    >
                      +{chip}
                    </button>
                  ))}
                </div>
              </div>
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

      {/* 재료 발주 완료 확인 모달 */}
      {orderSuccessModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 select-none">
          <div className="bg-white rounded-none shadow-2xl max-w-lg w-full border-2 border-[#1b5c9c] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-[#1b5c9c] text-white px-4 py-3 flex items-center justify-between border-b-2 border-[#2b71b8]">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-300" />
                <span className="font-black text-base">재료 발주 접수 완료 확인서</span>
              </div>
              <button
                onClick={() => setOrderSuccessModal(null)}
                className="text-white hover:bg-white/20 rounded px-2 py-0.5 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col gap-3 text-xs bg-slate-50/50">
              {/* Order Info Card */}
              <div className="bg-white p-3 rounded border border-slate-200 shadow-xs flex flex-col gap-2 font-mono">
                <div className="flex justify-between border-b pb-1.5 text-slate-600">
                  <span className="font-sans font-bold text-slate-800">발주 번호</span>
                  <span className="font-bold text-[#1b5c9c]">{orderSuccessModal.orderId}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5 text-slate-600">
                  <span className="font-sans font-bold text-slate-800">발주 매장</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-sans">
                    {orderSuccessModal.supplier}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-1.5 text-slate-600">
                  <span className="font-sans font-bold text-slate-800">배송 주소</span>
                  <span className="font-bold text-slate-900 font-sans">{OUR_STORE_ADDRESS}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5 text-slate-600">
                  <span className="font-sans font-bold text-slate-800">대상 메뉴</span>
                  <span className="font-bold text-slate-800 font-sans">{orderSuccessModal.menuName}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-sans font-bold text-slate-800">접수 일시</span>
                  <span>{orderSuccessModal.orderDate}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="border border-slate-200 rounded bg-white overflow-hidden shadow-xs">
                <div className="grid grid-cols-12 bg-slate-100 px-3 py-1.5 font-bold text-[11px] text-slate-700 border-b">
                  <span className="col-span-6">품목명 (규격)</span>
                  <span className="col-span-2 text-center">수량</span>
                  <span className="col-span-4 text-right">금액</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-[160px] overflow-y-auto px-3 py-1">
                  {orderSuccessModal.items.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-12 py-1.5 text-[11px] items-center">
                      <div className="col-span-6 truncate pr-1">
                        <span className="font-bold text-slate-800">{it.name}</span>
                        <span className="text-[10px] text-slate-400 block font-normal">{it.spec}</span>
                      </div>
                      <span className="col-span-2 text-center font-mono font-bold">{it.qty}개</span>
                      <span className="col-span-4 text-right font-mono font-bold text-[#1b5c9c]">
                        ₩ {it.total.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Price Card */}
              <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700">총 발주 금액 (총 주문 가격)</span>
                  <span className="block text-[10px] text-slate-500">배송비 무료 (도매 직배송)</span>
                </div>
                <span className="font-mono text-xl font-black text-[#1b5c9c]">
                  ₩ {orderSuccessModal.totalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-white border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOrderSuccessModal(null)}
                className="px-5 py-2 bg-[#2977ca] hover:bg-[#1f63ab] text-white font-bold rounded text-xs shadow transition-colors"
              >
                발주 확인 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
