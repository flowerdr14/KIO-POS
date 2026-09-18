import React from 'react';
import { usePos } from '../context/PosContext';
import { Printer, Wifi, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

export const PrinterModal: React.FC = () => {
  const { isPrinterModalOpen, setIsPrinterModalOpen, printers, updatePrinterStatus, testPrint, showToast } = usePos();

  if (!isPrinterModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-white border-2 border-[#2b71b8] shadow-2xl w-full max-w-xl overflow-hidden rounded-none flex flex-col">
        {/* Header */}
        <div className="bg-[#145388] text-white px-4 py-2 flex items-center justify-between border-b-2 border-[#2b71b8]">
          <span className="font-bold text-lg md:text-xl flex items-center gap-2">
            <Printer size={20} />
            인쇄관리 (네트워크 영수증 및 주방 프린터)
          </span>
          <button
            onClick={() => setIsPrinterModalOpen(false)}
            className="hover:bg-rose-600 w-6 h-6 flex items-center justify-center rounded font-bold text-white"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4 bg-slate-50">
          <div className="text-xs text-slate-600 leading-relaxed">
            현재 매장에 연결된 POS 영수증 프린터 및 주방 전송 프린터의 네트워크 연결 상태와 용지 잔량을 확인하고, 테스트 인쇄를 진행할 수 있습니다.
          </div>

          <div className="space-y-3">
            {printers.map((p) => (
              <div
                key={p.id}
                className="bg-white p-4 border border-slate-300 rounded shadow-sm flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      {p.type === 'RECEIPT' ? '카운터 고객용' : '주방 오더용'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                    <CheckCircle size={14} />
                    <span>연결 정상</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 text-xs text-slate-500 font-mono pt-1 border-t">
                  <div>IP 주소: {p.ipAddress}</div>
                  <div>용지 상태: {p.paperStatus === 'normal' ? '정상 (80mm 롤)' : '용지 부족'}</div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      showToast(`'${p.name}' 상태를 다시 점검 중입니다...`);
                      setTimeout(() => {
                        updatePrinterStatus(p.id, 'connected');
                        showToast(`'${p.name}' 정상 연결 확인`);
                      }, 600);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded flex items-center gap-1"
                  >
                    <RefreshCw size={13} />
                    <span>핑 테스트</span>
                  </button>

                  <button
                    onClick={() => testPrint(p.id)}
                    className="px-4 py-1.5 bg-[#145388] hover:bg-[#0f4470] text-white text-xs font-bold rounded shadow flex items-center gap-1.5"
                  >
                    <Printer size={13} />
                    <span>테스트 인쇄</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200 p-3 rounded text-xs text-amber-800 flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <span>용지 교체 시 덮개를 완전히 닫고 삐- 소리가 나는지 확인하세요. 영수증 글자가 흐릿하게 인쇄될 경우 헤드 청소 모드를 실행하세요.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white p-3 border-t flex justify-end">
          <button
            onClick={() => setIsPrinterModalOpen(false)}
            className="px-6 py-2 bg-slate-800 hover:bg-black text-white font-bold text-sm rounded-none"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
