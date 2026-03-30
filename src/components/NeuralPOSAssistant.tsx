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
      className="w-full flex flex-col md:flex-row items-center justify-between px-6 py-3 rounded-2xl mb-4 gap-4 bg-white/80 backdrop-blur-xl border border-emerald-100 shadow-sm shadow-emerald-950/5"
    >
      {/* Target Progress */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100/50">
             <IconBrain size={22} />
           </div>
           <div className="flex flex-col">
              <div className="flex items-center gap-2 leading-none mb-1.5">
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Neural Sales Pulse</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-emerald-950 text-xs font-black tracking-tight uppercase">{data.healthScore}% Business Health</span>
                 <Badge status={data.healthScore > 70 ? 'success' : 'warning'} />
              </div>
           </div>
        </div>

        <div className="hidden md:block w-px h-8 bg-gray-100" />

        {currentStock && (
           <div className="flex flex-col">
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Active Location</span>
              <Tag color="emerald" className="m-0 border-emerald-100/50 font-black text-[9px] px-2 py-1 rounded-lg flex items-center gap-1.5 bg-emerald-50 text-emerald-600">
                 <IconMapPin size={10} /> {currentStock.label || currentStock.name}
              </Tag>
           </div>
        )}

        <div className="hidden md:block w-px h-8 bg-gray-100" />

        <div className="flex items-center gap-3">
           <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <IconTargetArrow size={18} />
           </div>
           <div>
              <div className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1.5">Daily Target Tracker</div>
              <div className="flex items-center gap-3">
                 <div className="h-2 w-24 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                    <div 
                       className="h-full bg-emerald-500 transition-all duration-1000" 
                       style={{ width: `${progressPercent}%` }} 
                    />
                 </div>
                 <span className="text-[10px] font-black text-emerald-950">{progressPercent}%</span>
              </div>
           </div>
        </div>
      </div>

      {/* Dynamic Neural Insight */}
      <div className="flex-1 flex justify-center px-4">
          {remaining > 0 ? (
             <Text className="text-emerald-950/40 text-[11px] font-bold leading-none italic">
                Rs {remaining.toLocaleString()} left to reach today&apos;s neural growth forecast.
             </Text>
          ) : (
             <Text className="text-emerald-600 text-[11px] font-black leading-none animate-pulse">
                NEURAL TARGET REACHED: +{Math.abs(data.reality.comparison.percentageChange.revenue)}% MOMENTUM.
             </Text>
          )}
      </div>

      {/* Critical Stock Alerts */}
      <div className="flex items-center gap-3">
         {data.reality?.neuralRisks?.length > 0 && (
            <Tooltip title={`${data.reality.neuralRisks.length} critical inventory alerts.`}>
               <div className="flex items-center gap-3 px-4 py-2 bg-red-50 border border-red-100 rounded-xl shadow-sm shadow-red-950/5">
                  <IconAlertTriangle size={16} className="text-red-500" />
                  <span className="text-[10px] font-black text-red-700 uppercase tracking-tight">Stock Alarms</span>
                  <Badge count={data.reality.neuralRisks.length} size="small" style={{ backgroundColor: '#ef4444' }} />
               </div>
            </Tooltip>
         )}
      </div>
    </div>
  );
};

export default NeuralPOSAssistant;
