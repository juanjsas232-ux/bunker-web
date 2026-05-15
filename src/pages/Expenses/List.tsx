import { useEffect, useState } from 'react';
import { supabase } from '../../hooks/useSupabase';
import type { Expense } from '../../types';
import { DataTable } from '../../components/tables/DataTable';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { format } from 'date-fns';
import { TrashIcon } from '@heroicons/react/24/outline';

export const ExpensesList = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ category: '', amount: 0, description: '' });

  const fetchExpenses = async () => {
    const { data } = await supabase.from('expenses').select('*').order('incurred_at', { ascending: false });
    setExpenses(data || []);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este gasto?')) return;
    await supabase.from('expenses').delete().eq('id', id);
    fetchExpenses();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('expenses').insert([formData]);
    setIsModalOpen(false);
    setFormData({ category: '', amount: 0, description: '' });
    fetchExpenses();
  };

  const columns: ColumnDef<Expense>[] = [
    { accessorKey: 'category', header: 'Categoría' },
    { accessorKey: 'description', header: 'Descripción' },
    { 
      accessorKey: 'amount', 
      header: 'Monto ($)',
      cell: ({ row }) => `$${Number(row.original.amount).toFixed(2)}`
    },
    { 
      accessorKey: 'incurred_at', 
      header: 'Fecha',
      cell: ({ row }) => row.original.incurred_at ? format(new Date(row.original.incurred_at), 'dd/MM/yyyy HH:mm') : ''
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => handleDelete(row.original.id)} className="text-red-400 hover:text-red-300">
          <TrashIcon className="h-4 w-4" />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Gastos</h1>
      
      <DataTable 
        data={expenses} 
        columns={columns} 
        onAdd={() => setIsModalOpen(true)}
        addLabel="Registrar Gasto"
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Gasto">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Categoría</label>
            <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full h-10 px-3 bg-black/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white" placeholder="Ej: Servicios, Alquiler" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Monto ($)</label>
            <input required type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} className="w-full h-10 px-3 bg-black/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Descripción</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3 bg-black/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white h-24 resize-none" placeholder="Detalles adicionales..." />
          </div>
          <div className="pt-4 flex justify-end space-x-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Guardar Gasto</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
