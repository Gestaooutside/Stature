"use client";

import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  BarChart,
  Bar,
  Legend
} from "recharts";

interface ChartData {
  date: string;
  orders: number;
  paidOrders: number;
  revenue: number;
}

interface DashboardChartsProps {
  data: ChartData[];
  isLoading: boolean;
}

export function DashboardCharts({ data, isLoading }: DashboardChartsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="h-[300px] rounded-xl border border-neutral-200 bg-white p-6 animate-pulse"
          >
            <div className="h-6 w-32 bg-neutral-100 rounded mb-8" />
            <div className="h-48 w-full bg-neutral-50 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Se não houver dados, mostra estado vazio mas bonito
  if (!data || data.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        <div className="h-[300px] rounded-xl border border-neutral-200 bg-white p-6 flex items-center justify-center">
          <p className="text-neutral-500">Sem dados suficientes para gráficos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
      {/* Gráfico de Evolução (Pedidos vs Pagos) */}
      <div className="h-[350px] w-full rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-sm font-semibold text-neutral-900">Pedidos x Pagos (30 dias)</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e5e5e5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#e5e5e5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8d7f72" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8d7f72" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#a3a3a3' }} 
                axisLine={false}
                tickLine={false}
                tickMargin={10}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#a3a3a3' }} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                cursor={{ stroke: '#8d7f72', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area 
                type="monotone" 
                dataKey="orders" 
                name="Pedidos"
                stroke="#a3a3a3" 
                fillOpacity={1} 
                fill="url(#colorOrders)" 
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="paidOrders" 
                name="Pagos"
                stroke="#8d7f72" 
                fillOpacity={1} 
                fill="url(#colorPaid)" 
                strokeWidth={2}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Receita */}
      <div className="h-[350px] w-full rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-sm font-semibold text-neutral-900">Receita Confirmada</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#a3a3a3' }} 
                axisLine={false}
                tickLine={false}
                tickMargin={10}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#a3a3a3' }} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                cursor={{ fill: '#f5f5f5' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar 
                dataKey="revenue" 
                name="Receita Confirmada (R$)"
                fill="#8d7f72" 
                radius={[4, 4, 0, 0]}
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

