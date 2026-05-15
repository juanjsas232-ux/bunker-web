import { useState } from 'react';
import { supabase } from '../hooks/useSupabase';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export const Settings = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportTableToCSV = async (tableName: string) => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase.from(tableName).select('*');
      if (error) throw error;
      if (!data || !data.length) return alert(`No hay datos en ${tableName}`);

      const headers = Object.keys(data[0]).join(',');
      const csv = data.map(row => 
        Object.values(row).map(val => 
          typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
        ).join(',')
      );
      
      const blob = new Blob([[headers, ...csv].join('\n')], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `bunker_${tableName}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (err: any) {
      alert('Error exportando datos: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Ajustes y Exportación</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Exportar Datos (CSV)">
          <p className="text-sm text-gray-400 mb-4 mt-2">
            Descarga la información de tu sistema en formato CSV para usar en Excel o realizar backups manuales.
          </p>
          <div className="space-y-3">
            <Button 
              variant="secondary" 
              className="w-full justify-start" 
              onClick={() => exportTableToCSV('products')}
              disabled={isExporting}
            >
              <ArrowDownTrayIcon className="w-5 h-5 mr-3" />
              Exportar Inventario
            </Button>
            <Button 
              variant="secondary" 
              className="w-full justify-start" 
              onClick={() => exportTableToCSV('sales')}
              disabled={isExporting}
            >
              <ArrowDownTrayIcon className="w-5 h-5 mr-3" />
              Exportar Ventas
            </Button>
            <Button 
              variant="secondary" 
              className="w-full justify-start" 
              onClick={() => exportTableToCSV('expenses')}
              disabled={isExporting}
            >
              <ArrowDownTrayIcon className="w-5 h-5 mr-3" />
              Exportar Gastos
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
