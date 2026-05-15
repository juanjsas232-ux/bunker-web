import { useEffect, useState } from 'react';
import { supabase } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Card } from '../components/ui/Card';
import { CurrencyDollarIcon, ChartBarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const Dashboard = () => {
  const { isGuest } = useAuth();
  const [stats, setStats] = useState({ income: 0, expense: 0, profit: 0, lowStock: 0 });
  const [trend, setTrend] = useState<number[]>([0,0,0,0,0,0,0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (isGuest) {
        setStats({ income: 12500.50, expense: 4300.20, profit: 8200.30, lowStock: 3 });
        setTrend([1200, 1900, 1500, 2100, 2400, 1800, 2600]);
        setLoading(false);
        return;
      }

      try {
        const [salesRes, expensesRes, stockRes, weekRes] = await Promise.all([
          supabase.from('sales').select('total'),
          supabase.from('expenses').select('amount'),
          supabase.from('products').select('id', { count: 'exact', head: true }).lt('stock', 5),
          supabase.from('sales').select('sold_at,total').order('sold_at', { ascending: true }).limit(7),
        ]);

        const income = salesRes.data?.reduce((a, s) => a + Number(s.total || 0), 0) ?? 0;
        const expense = expensesRes.data?.reduce((a, e) => a + Number(e.amount || 0), 0) ?? 0;

        setStats({
          income,
          expense,
          profit: income - expense,
          lowStock: stockRes.count ?? 0,
        });

        const last7 = Array(7).fill(0);
        weekRes.data?.forEach((s, i) => {
          if (i < 7) last7[i] = Number(s.total || 0);
        });
        setTrend(last7);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isGuest]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        {isGuest && (
          <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-500/20">
            Modo Preview
          </span>
        )}
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card 
          title="Ingresos Totales" 
          value={`$${stats.income.toLocaleString()}`} 
          icon={<CurrencyDollarIcon className="h-5 w-5" />}
        />
        <Card 
          title="Gastos Totales" 
          value={`$${stats.expense.toLocaleString()}`} 
          icon={<ChartBarIcon className="h-5 w-5 text-red-400" />}
        />
        <Card 
          title="Ganancia Neta" 
          value={`$${stats.profit.toLocaleString()}`} 
          icon={<CurrencyDollarIcon className="h-5 w-5 text-green-400" />}
        />
        <Card 
          title="Stock Bajo" 
          value={String(stats.lowStock)} 
          icon={<ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />}
        />
      </div>

      <Card title="Ventas — Últimos 7 días">
        <div className="h-64 w-full mt-4">
          <Bar
            data={{
              labels: ['Día 1','Día 2','Día 3','Día 4','Día 5','Día 6','Día 7'],
              datasets: [{ 
                label: 'Ventas ($)', 
                data: trend, 
                backgroundColor: 'rgba(59,130,246,0.7)',
                borderRadius: 6,
                borderSkipped: false,
              }],
            }}
            options={{ 
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { color: 'rgba(255,255,255,0.04)' },
                  ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 } }
                },
                x: {
                  grid: { display: false },
                  ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 } }
                }
              }
            }}
          />
        </div>
      </Card>
    </div>
  );
};
