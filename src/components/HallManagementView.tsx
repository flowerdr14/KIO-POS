import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { TableItem } from '../types';
import { Utensils, Clock, Users, Coffee, Edit3, ArrowRight, RotateCcw } from 'lucide-react';

export const HallManagementView: React.FC = () => {
  const {
    tables,
    orders,
    updateTableStatus,
    setCartTable,
    setActiveTab,
    setSelectedOrder,
    openReceiptModalWithOrder,
    clearAllTables,
    showToast
  } = usePos();

  const [activeFloor, setActiveFloor] = useState<1 | 2>(1);
  const [activeTableModal, setActiveTableModal] = useState<TableItem | null>(null);
  const [tableMemoInput, setTableMemoInput] = useState('');

  const floor1Tables = tables.filter((t) => t.floor === 1);
  const floor2Tables = tables.filter((t) => t.floor === 2);

  // Find active order for a table
  const getTableOrder = (tableName: string) => {
    return orders.find(
      (o) => (o.tableId === tableName || o.tableName === tableName) && o.status !== '제공완료' && o.status !== '취소됨'
    ) || orders.find((o) => o.tableId === tableName || o.tableName === tableName);
  };

  const handleTableClick = (table: TableItem) => {
    setActiveTableModal(table);
    setTableMemoInput(table.memo || '');
  };

  const handleStartOrderForTable = (table: TableItem) => {
    setCartTable(table);
    setActiveTab('CHECKOUT');
  };

  const handleClearTable = (tableId: string) => {
    updateTableStatus(tableId, '빈테이블', '');
    setActiveTableModal(null);
    showToast('테이블이 빈 테이블로 정리되었습니다.');
  };

  const renderTableButton = (tbl?: TableItem, customSize = 'w-36 h-48') => {
    if (!tbl) return null;
    const tableOrder = getTableOrder(tbl.name);
    const isOccupied = tbl.status === '식사중';
    return (
      <button
        onClick={() => handleTableClick(tbl)}
        className={`${customSize} border-2 transition-all p-3 flex flex-col justify-between items-center text-center shadow-sm group hover:scale-105 active:scale-95 ${
          isOccupied
            ? 'border-emerald-500 bg-emerald-50/70 hover:bg-emerald-100'
            : tbl.status === '예약석'
            ? 'border-amber-500 bg-amber-50/70 hover:bg-amber-100'
            : 'border-[#2b71b8] bg-white hover:bg-blue-50/80'
        }`}
      >
        <div>
          <div className="text-2xl font-black text-[#1f5b94]">{tbl.name}</div>
          <div className="text-sm font-semibold text-slate-500">({tbl.seats}인석)</div>
        </div>

        {isOccupied && tableOrder ? (
          <div className="w-full bg-emerald-600 text-white rounded py-1 px-1 text-xs">
            <div className="font-bold font-mono">₩{tableOrder.totalAmount.toLocaleString()}</div>
            <div className="text-[10px] opacity-90 truncate">{tableOrder.items.length}개 품목</div>
          </div>
        ) : tbl.status === '예약석' ? (
          <div className="w-full bg-amber-500 text-white rounded py-1 px-1 text-xs font-bold">
            예약석
          </div>
        ) : (
          <div className="text-xs text-slate-400 font-medium">빈 테이블</div>
        )}

        <div className="text-[11px] text-blue-600 font-bold group-hover:underline">
          터치하여 관리
        </div>
      </button>
    );
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 flex flex-col gap-4 min-h-[calc(100vh-80px)] select-none">
      {/* Floor Tab Selector */}
      <div className="flex items-center justify-between border-b-2 border-[#6ba0d6] pb-3">
        <div className="w-32 hidden sm:block"></div>
        <div className="flex items-center space-x-2 bg-white/80 p-1.5 rounded-lg border border-[#8cb2dc] shadow-sm">
          <button
            id="btn-floor-1"
            onClick={() => setActiveFloor(1)}
            className={`px-8 py-2 rounded font-black text-xl transition-all ${
              activeFloor === 1
                ? 'bg-[#6ba0d6] text-white shadow-md'
                : 'text-[#1e3a8a] hover:bg-[#e4effa]'
            }`}
          >
            1 Floor
          </button>
          <span className="text-slate-300 font-bold">|</span>
          <button
            id="btn-floor-2"
            onClick={() => setActiveFloor(2)}
            className={`px-8 py-2 rounded font-black text-xl transition-all ${
              activeFloor === 2
                ? 'bg-[#6ba0d6] text-white shadow-md'
                : 'text-[#1e3a8a] hover:bg-[#e4effa]'
            }`}
          >
            2 Floor
          </button>
        </div>
        <button
          id="btn-hall-clear-all-tables"
          onClick={clearAllTables}
          className="text-xs md:text-sm font-bold px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 rounded transition-colors shadow-sm flex items-center gap-1.5"
          title="모든 테이블을 빈 테이블로 깨끗하게 비우기"
        >
          <RotateCcw size={15} />
          <span>테이블 전체 비우기</span>
        </button>
      </div>

      {/* Main Floor Plan Canvas Box */}
      <div className="border-4 border-[#2b71b8] bg-white shadow-md relative min-h-[600px] p-6 rounded-none flex-1 flex flex-col justify-between overflow-hidden">
        {activeFloor === 1 ? (
          /* =================== 1 FLOOR LAYOUT (Matches Slide 6) =================== */
          <div className="relative w-full h-[580px]">
            {/* Architectural element: Door [문] */}
            <div className="absolute top-0 left-24 w-28 h-16 bg-[#4388cc] text-white font-black text-2xl flex items-center justify-center shadow-sm border border-[#2b71b8]">
              문
            </div>

            {/* Architectural element: Window [창문] */}
            <div className="absolute top-0 right-12 left-[50%] h-14 bg-[#4388cc] text-white font-black text-2xl flex items-center justify-center shadow-sm border border-[#2b71b8]">
              창문
            </div>

            {/* Architectural element: Cabinet [장식장] */}
            <div className="absolute top-[38%] left-[38%] w-36 h-20 bg-[#4388cc] text-white font-black text-2xl flex items-center justify-center shadow-sm border border-[#2b71b8]">
              장식장
            </div>

            {/* Tables on 1 Floor: 1F-1T, 1F-2T, 1F-3T */}
            <div className="absolute top-24 right-8 flex gap-6">
              {floor1Tables.map((tbl) => {
                const tableOrder = getTableOrder(tbl.name);
                const isOccupied = tbl.status === '식사중';
                return (
                  <button
                    key={tbl.id}
                    onClick={() => handleTableClick(tbl)}
                    className={`w-36 h-56 border-2 transition-all p-3 flex flex-col justify-between items-center text-center shadow-sm group hover:scale-105 active:scale-95 ${
                      isOccupied
                        ? 'border-emerald-500 bg-emerald-50/60 hover:bg-emerald-100/70'
                        : tbl.status === '예약석'
                        ? 'border-amber-500 bg-amber-50/60 hover:bg-amber-100/70'
                        : 'border-[#2b71b8] bg-white hover:bg-blue-50/80'
                    }`}
                  >
                    <div className="w-full">
                      <div className="text-2xl font-black text-[#1f5b94]">{tbl.name}</div>
                      <div className="text-sm font-semibold text-slate-500">({tbl.seats}인석)</div>
                    </div>

                    {isOccupied && tableOrder ? (
                      <div className="w-full bg-emerald-600 text-white rounded py-1 px-1 text-xs">
                        <div className="font-bold font-mono">₩{tableOrder.totalAmount.toLocaleString()}</div>
                        <div className="text-[10px] opacity-90 truncate">{tableOrder.items.length}개 품목</div>
                      </div>
                    ) : tbl.status === '예약석' ? (
                      <div className="w-full bg-amber-500 text-white rounded py-1 px-1 text-xs font-bold">
                        예약석
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 font-medium">빈 테이블</div>
                    )}

                    <div className="text-[11px] text-blue-600 font-bold group-hover:underline">
                      터치하여 관리
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Architectural element: Stairs [계단] */}
            <div className="absolute bottom-16 right-0 w-64 h-24 bg-[#4388cc] text-white font-black text-3xl flex items-center justify-center shadow-sm border border-[#2b71b8]">
              계단
            </div>

            {/* Architectural element: Counter [카운터] */}
            <div className="absolute bottom-0 left-0 w-[45%] h-24 bg-[#4388cc] text-white font-black text-3xl flex items-center justify-center shadow-sm border border-[#2b71b8]">
              카운터
            </div>
          </div>
        ) : (
          /* =================== 2 FLOOR LAYOUT (Matches Slide 7) =================== */
          <div className="relative w-full h-[580px]">
            {/* Table 2F-1T (2인석) */}
            <div className="absolute bottom-24 left-16">
              {renderTableButton(floor2Tables.find((t) => t.name === '2F-1T')!)}
            </div>

            {/* Table 2F-2T (4인석) */}
            <div className="absolute top-12 left-[32%]">
              {renderTableButton(floor2Tables.find((t) => t.name === '2F-2T')!)}
            </div>

            {/* Table 2F-3T (4인석) */}
            <div className="absolute bottom-10 left-[32%]">
              {renderTableButton(floor2Tables.find((t) => t.name === '2F-3T')!)}
            </div>

            {/* Table 2F-4T (2인석) */}
            <div className="absolute top-6 left-[48%]">
              {renderTableButton(floor2Tables.find((t) => t.name === '2F-4T')!, 'w-32 h-32')}
            </div>

            {/* Table 2F-5T (2인석) */}
            <div className="absolute top-44 left-[48%]">
              {renderTableButton(floor2Tables.find((t) => t.name === '2F-5T')!, 'w-32 h-32')}
            </div>

            {/* Table 2F-6T (5인석) */}
            <div className="absolute bottom-12 left-[48%]">
              {renderTableButton(floor2Tables.find((t) => t.name === '2F-6T')!, 'w-56 h-48')}
            </div>

            {/* Table 2F-7T (5인석) */}
            <div className="absolute bottom-10 right-4">
              {renderTableButton(floor2Tables.find((t) => t.name === '2F-7T')!, 'w-64 h-52')}
            </div>

            {/* Architectural element: Staff Room [직원휴게실] */}
            <div className="absolute top-0 right-0 w-[40%] h-52 bg-[#4388cc] text-white font-black text-3xl flex items-center justify-center shadow-sm border border-[#2b71b8]">
              직원휴게실
            </div>
          </div>
        )}
      </div>

      {/* Table Detail & Actions Modal */}
      {activeTableModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6 border-2 border-[#2b71b8] flex flex-col gap-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-2xl font-black text-[#1b5c9c] flex items-center gap-2">
                  <span>{activeTableModal.name}</span>
                  <span className="text-sm font-semibold text-slate-500">
                    ({activeTableModal.floor}층 • {activeTableModal.seats}인석)
                  </span>
                </h3>
              </div>
              <button
                onClick={() => setActiveTableModal(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-xl"
              >
                ✕
              </button>
            </div>

            {/* Status changer */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">테이블 상태 변경</label>
              <div className="grid grid-cols-4 gap-2">
                {(['빈테이블', '식사중', '예약석', '정리필요'] as TableItem['status'][]).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      updateTableStatus(activeTableModal.id, st);
                      setActiveTableModal({ ...activeTableModal, status: st });
                      showToast(`[${activeTableModal.name}] 상태가 '${st}'로 변경되었습니다.`);
                    }}
                    className={`py-2 text-xs font-bold rounded border transition-all ${
                      activeTableModal.status === st
                        ? 'bg-[#1b5c9c] text-white border-[#1b5c9c] shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Active Order if any */}
            {(() => {
              const currentOrder = getTableOrder(activeTableModal.name);
              return currentOrder ? (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-blue-900">현재 이용중인 주문</span>
                    <span className="font-mono text-xs font-bold text-blue-700">[{currentOrder.orderNumber}]</span>
                  </div>
                  <div className="text-xs text-slate-700">
                    {currentOrder.items.map((it) => `${it.name} ${it.quantity}개`).join(', ')}
                  </div>
                  <div className="flex justify-between items-center font-bold text-blue-900 pt-1 border-t border-blue-200">
                    <span>주문금액</span>
                    <span className="text-base font-mono">₩{currentOrder.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => {
                        setSelectedOrder(currentOrder);
                        openReceiptModalWithOrder(currentOrder);
                      }}
                      className="flex-1 bg-white hover:bg-blue-100 text-blue-800 text-xs font-bold py-1.5 rounded border border-blue-300"
                    >
                      영수증 확인 / 출력
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded border text-center text-xs text-slate-400">
                  현재 테이블에 진행 중인 주문이 없습니다.
                </div>
              );
            })()}

            {/* Table Memo */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">테이블 메모</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tableMemoInput}
                  onChange={(e) => setTableMemoInput(e.target.value)}
                  placeholder="단골 고객, 유모차 동반, 요청사항 등..."
                  className="flex-1 border rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => {
                    updateTableStatus(activeTableModal.id, activeTableModal.status, tableMemoInput);
                    showToast('테이블 메모가 저장되었습니다.');
                  }}
                  className="bg-[#2977ca] hover:bg-[#1f63ab] text-white text-xs font-bold px-3 py-1.5 rounded"
                >
                  메모저장
                </button>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t">
              <button
                onClick={() => handleClearTable(activeTableModal.id)}
                className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded flex items-center justify-center gap-1.5 text-sm transition-colors"
              >
                <RotateCcw size={16} />
                <span>테이블 비우기</span>
              </button>

              <button
                onClick={() => handleStartOrderForTable(activeTableModal)}
                className="py-3 bg-[#00a854] hover:bg-[#02934a] text-white font-bold rounded flex items-center justify-center gap-1.5 text-sm shadow transition-colors"
              >
                <span>주문 / 결제 진행</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
