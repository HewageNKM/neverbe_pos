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
      className="w-full flex flex-col xl:flex-row items-center justify-between px-6 py-2.5 rounded-2xl mb-4 gap-y-4 xl:gap-8 bg-white/90 backdrop-blur-md border border-emerald-100 shadow-sm shadow-emerald-950/5"
    >
      {/* 🚀 LEFT: CORE PULSE & LOCATION */}
      <div className="flex flex-shrink-0 items-center gap-6">
        <div className="flex items-center gap-3 min-w-fit">
           <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100/50 shadow-sm flex-shrink-0">
             <IconBrain size={22} />
           </div>
           <div className="flex flex-col flex-shrink-0">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 leading-none mb-1">Neural Pulse</span>
              <div className="flex items-center gap-2 whitespace-nowrap">
                 <span className="text-emerald-950 text-xs font-black tracking-tight uppercase">{data.healthScore}% Health</span>
                 <Badge status={data.healthScore > 70 ? 'success' : 'warning'} />
              </div>
           </div>
        </div>

        <div className="hidden sm:block w-px h-8 bg-gray-100 flex-shrink-0" />

        {currentStock && (
           <div className="flex flex-col flex-shrink-0 min-w-fit">
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-0.5 leading-none italic opacity-80">Location</span>
              <Tag color="emerald" className="m-0 border-emerald-100/50 font-black text-[10px] px-2 py-0.5 rounded-lg flex items-center gap-1.5 bg-emerald-50 text-emerald-700 shadow-inner whitespace-nowrap">
                 <IconMapPin size={10} /> {currentStock.label || currentStock.name}
              </Tag>
           </div>
        )}
      </div>

      {/* 📈 CENTER: TARGET TRACKER (STABILIZED) */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-x-8 gap-y-2 w-full">
         <div className="flex items-center gap-3 flex-shrink-0">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100/30 flex-shrink-0">
               <IconTargetArrow size={18} />
            </div>
            <div className="flex flex-col flex-shrink-0">
               <span className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1 tracking-wide">Daily Target</span>
               <div className="flex items-center gap-4 whitespace-nowrap">
                  <div className="h-2 w-24 sm:w-32 bg-gray-100 rounded-full overflow-hidden border border-gray-200/50 relative shadow-inner flex-shrink-0">
                     <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(16,185,129,0.3)]" 
                        style={{ width: `${progressPercent}%` }} 
                     />
                  </div>
                  <span className="text-[10px] font-black text-emerald-950">{progressPercent}%</span>
               </div>
            </div>
         </div>

         <div className="hidden md:block w-px h-6 bg-gray-100 flex-shrink-0" />

         <div className="min-w-fit flex-shrink-0">
             {remaining > 0 ? (
                <Text className="text-emerald-950/50 text-[11px] font-bold leading-none italic tracking-tight whitespace-nowrap">
                   Rs {remaining.toLocaleString()} more needed for target.
                </Text>
             ) : (
                <Text className="text-emerald-600 text-[11px] font-black leading-none animate-pulse flex items-center gap-2 whitespace-nowrap">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" />
                   TARGET REACHED: +{Math.abs(data.reality?.comparison?.percentageChange?.revenue || 0)}%
                </Text>
             )}
         </div>
      </div>

      {/* ⚠️ RIGHT: ALARMS */}
      <div className="flex-shrink-0 min-w-fit">
         {data.reality?.neuralRisks?.length > 0 && (
            <Tooltip title={`${data.reality.neuralRisks.length} inventory alerts.`}>
               <div className="flex items-center gap-3 px-4 py-1.5 bg-red-50 border border-red-100 rounded-xl shadow-sm shadow-red-950/5 active:scale-95 transition-transform cursor-pointer whitespace-nowrap">
                  <IconAlertTriangle size={16} className="text-red-500 animate-pulse" />
                  <span className="text-[10px] font-black text-red-700 uppercase tracking-tight">Alarms</span>
                  <Badge count={data.reality.neuralRisks.length} size="small" offset={[2, 0]} style={{ backgroundColor: '#ef4444' }} />
               </div>
            </Tooltip>
         )}
      </div>
    </div>
   );
};

export default NeuralPOSAssistant;
