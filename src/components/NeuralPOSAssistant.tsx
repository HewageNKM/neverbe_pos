import React, { useEffect, useState } from "react";
import { Space, Badge, Typography, Spin, Tooltip } from "antd";
import { IconBrain, IconTargetArrow, IconAlertTriangle } from "@tabler/icons-react";
import api from "@/lib/api";

const { Text } = Typography;

const NeuralPOSAssistant: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

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
      className="w-full flex flex-col md:flex-row items-center justify-between px-6 py-2 rounded-2xl mb-2 gap-4"
      style={{ 
        background: "linear-gradient(90deg, #022c22 0%, #064e3b 100%)",
        border: "1px solid rgba(16, 185, 129, 0.2)"
      }}
    >
      {/* Target Progress */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
             <IconBrain size={18} />
           </div>
           <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400/50 leading-none mb-1">Neural Sales Pulse</span>
              <div className="flex items-center gap-2">
                 <span className="text-white text-xs font-black tracking-tight">{data.healthScore}% HEALTH</span>
                 <Badge status={data.healthScore > 70 ? 'success' : 'warning'} />
              </div>
           </div>
        </div>

        <div className="hidden md:block w-px h-6 bg-white/10" />

        <div className="flex items-center gap-3">
           <IconTargetArrow size={18} className="text-emerald-400" />
           <div>
              <div className="text-[9px] font-bold text-white/40 uppercase leading-none mb-1">Daily Target Tracker</div>
              <div className="flex items-center gap-2">
                 <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                    <div 
                       className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] transition-all duration-1000" 
                       style={{ width: `${progressPercent}%` }} 
                    />
                 </div>
                 <span className="text-[10px] font-black text-white">{progressPercent}%</span>
              </div>
           </div>
        </div>
      </div>

      {/* Dynamic Neural Insight */}
      <div className="flex-1 flex justify-center px-4">
          {remaining > 0 ? (
             <Text className="text-emerald-100/60 text-[11px] font-medium leading-none">
                Rs {remaining.toLocaleString()} left to reach today&apos;s neural growth forecast.
             </Text>
          ) : (
             <Text className="text-emerald-400 text-[11px] font-black leading-none animate-pulse">
                Neural Target Achieved: Growing at {Math.abs(data.reality.comparison.percentageChange.revenue)}% Velocity.
             </Text>
          )}
      </div>

      {/* Critical Stock Alerts */}
      <div className="flex items-center gap-3">
         {data.reality?.neuralRisks?.length > 0 && (
            <Tooltip title={`${data.reality.neuralRisks.length} products at Ghost Stockout risk.`}>
               <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <IconAlertTriangle size={14} className="text-red-400 animate-pulse" />
                  <span className="text-[10px] font-black text-red-100 uppercase tracking-tighter">Stock Alarms</span>
                  <Badge count={data.reality.neuralRisks.length} size="small" style={{ backgroundColor: '#ef4444' }} />
               </div>
            </Tooltip>
         )}
      </div>
    </div>
  );
};

export default NeuralPOSAssistant;
