import React, { useEffect, useState } from "react";
import { Space, Badge, Typography, Spin, Tooltip, Tag } from "antd";
import { IconBrain, IconTargetArrow, IconAlertTriangle, IconMapPin } from "@tabler/icons-react";
import api from "@/lib/api";
import { usePOS } from "../context/POSContext";

const { Text } = Typography;

const NeuralPOSAssistant: React.FC = () => {
   const { selectedStockId, stocks } = usePOS();
   const [loading, setLoading] = useState(true);
   const [data, setData] = useState<any>(null);

   const currentStock = stocks?.find?.((s: any) => s.id === selectedStockId);

   const fetchNeural = async () => {
      try {
         const resp = await api.get("/api/v1/erp/ai/neural");
         if (resp.data.success) {
            setData(resp.data.data);
         }
      } catch (err) {
         console.error("Neural POS Assistant Err", err);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchNeural();
      const interval = setInterval(fetchNeural, 60000); // 1-minute auto-refresh
      return () => clearInterval(interval);
   }, []);

   if (loading) return null;
   if (!data) return null;

   const currentSales = data.reality?.snapshot?.totalNetSales || 0;
   const targetSales = data.projections?.avgForecastedDaily || 0;
   const progressPercent = Math.min(100, Math.round((currentSales / (targetSales || 1)) * 100));
   const remaining = Math.max(0, Math.round(targetSales - currentSales));

   return (
      <div
         className="w-full flex flex-col md:flex-row items-center justify-between px-6 py-4 md:py-3 rounded-[1.5rem] mb-3 gap-y-6 md:gap-4 bg-white/80 backdrop-blur-xl border border-emerald-100 shadow-sm shadow-emerald-950/5 overflow-hidden"
      >
         {/* 🚀 LEFT: CORE PULSE & LOCATION */}
         <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-6">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100/50 shadow-sm">
                  <IconBrain size={22} />
               </div>
               <div className="flex flex-col">
                  <div className="flex items-center gap-2 leading-none mb-1.5">
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Neural Sales Pulse</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-emerald-950 text-xs font-black tracking-tight uppercase tracking-tighter">{data.healthScore}% Business Health</span>
                     <Badge status={data.healthScore > 70 ? 'success' : 'warning'} />
                  </div>
               </div>
            </div>

            <div className="hidden sm:block w-px h-8 bg-gray-100" />

            {currentStock && (
               <div className="flex flex-col items-center sm:items-start">
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1 leading-none italic opacity-80">Store Location</span>
                  <Tag color="emerald" className="m-0 border-emerald-100/50 font-black text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 bg-emerald-50 text-emerald-700 shadow-inner">
                     <IconMapPin size={10} /> {currentStock.label || currentStock.name}
                  </Tag>
               </div>
            )}
         </div>

         {/* 📈 CENTER: TARGET TRACKER (RESPONSIVE) */}
         <div className="w-full md:flex-1 flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="hidden lg:block w-px h-8 bg-gray-100" />

            <div className="flex items-center gap-3">
               <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100/30">
                  <IconTargetArrow size={18} />
               </div>
               <div className="flex flex-col">
                  <div className="text-[10px] font-black text-gray-400 uppercase leading-none mb-2 tracking-wide">Daily Target Tracker</div>
                  <div className="flex items-center gap-4">
                     <div className="h-2.5 w-32 sm:w-40 bg-gray-100 rounded-full overflow-hidden border border-gray-200/50 relative shadow-inner">
                        <div
                           className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                           style={{ width: `${progressPercent}%` }}
                        />
                     </div>
                     <span className="text-[11px] font-black text-emerald-950 min-w-[3ch]">{progressPercent}%</span>
                  </div>
               </div>
            </div>

            <div className="flex-1 hidden md:flex justify-center px-4">
               {remaining > 0 ? (
                  <Text className="text-emerald-950/50 text-[11px] font-bold leading-none italic tracking-tight">
                     Rs {remaining.toLocaleString()} more needed for target.
                  </Text>
               ) : (
                  <Text className="text-emerald-600 text-[11px] font-black leading-none animate-pulse flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                     TARGET REACHED: +{Math.abs(data.reality?.comparison?.percentageChange?.revenue || 0)}% MOMENTUM.
                  </Text>
               )}
            </div>
         </div>

         {/* ⚠️ RIGHT: ALARMS */}
         <div className="w-full md:auto flex items-center justify-center md:justify-end gap-3 mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-none border-gray-50">
            {data.reality?.neuralRisks?.length > 0 && (
               <Tooltip title={`${data.reality.neuralRisks.length} critical inventory alerts detected.`}>
                  <div className="flex items-center gap-3 px-4 py-2 bg-red-50 border border-red-100 rounded-xl shadow-sm shadow-red-950/5 active:scale-95 transition-transform cursor-pointer">
                     <IconAlertTriangle size={18} className="text-red-500 animate-pulse" />
                     <span className="text-[10px] font-black text-red-700 uppercase tracking-tight">Stock Alarms</span>
                     <Badge count={data.reality.neuralRisks.length} size="small" offset={[2, 0]} style={{ backgroundColor: '#ef4444' }} />
                  </div>
               </Tooltip>
            )}
         </div>
      </div>
   );
};

export default NeuralPOSAssistant;
