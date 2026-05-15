import { useEffect, useState } from 'react';
import { supabase } from '../../hooks/useSupabase';
import { useAuth } from '../../hooks/useAuth';
import type { Sale, Product } from '../../types';
import { DataTable } from '../../components/tables/DataTable';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { format, subDays } from 'date-fns';

const MOCK_SALES: Sale[] = [
  { id: '1', product_id: '1', products: { name: 'Coca Cola 1.5L', sale_price: 1800 }, quantity: 2, total: 3600, sold_at: subDays(new Date(), 1).toISOString() },
  { id: '2', product_id: '3', products: { name: 'Aceite Girasol 1L', sale_price: 11500 }, quantity: 1, total: 11500, sold_at: subDays(new Date(), 2).toISOString() },
  { id: '3', product_id: '2', products: { name: 'Pan Tajado Familiar', sale_price: 6000 }, quantity: 3, total: 18000, sold_at: new Date().toISOString() },
];

export const SalesList = () => {
  const { isGuest } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ product_id: '', quantity: 1 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSales = async () => {
    if (isGuest) {
      setSales(MOCK_SALES);
      return;
    }

    const { data } = await supabase
      .from('sales')
      .select('*, products(name, sale_price)')
      .order('sold_at', { ascending: false });
    
    setSales(data || []);
  };

  const fetchProducts = async () => {
    if (isGuest) {
      setProducts([
        { id: '1', name: 'Coca Cola 1.5L', category: 'Bebidas', purchase_price: 1200, sale_price: 1800, stock: 24 },
        { id: '2', name: 'Pan Tajado Familiar', category: 'Panadería', purchase_price: 4500, sale_price: 6000, stock: 4 },
        { id: '3', name: 'Aceite Girasol 1L', category: 'Abarrotes', purchase_price: 8000, sale_price: 11500, stock: 15 },
      ]);
      return;
    }

    const { data } = await supabase.from('products').select('*').gt('stock', 0).order('name');
    setProducts(data || []);
  };

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, [isGuest]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      alert('Las ventas no se registran en modo demo');
      setIsModalOpen(false);
      return;
    }

    if (!formData.product_id) return alert('Selecciona un producto');
    setIsSubmitting(true);
    
    try {
      const selectedProduct = products.find(p => p.id === formData.product_id);
      if (!selectedProduct) throw new Error('Producto no encontrado');
      if (selectedProduct.stock < formData.quantity) throw new Error('Stock insuficiente');

      const { error: saleError } = await supabase.from('sales').insert([{
        product_id: formData.product_id,
        quantity: formData.quantity
      }]);
      if (saleError) throw saleError;

      const { error: stockError } = await supabase
        .from('products')
        .update({ stock: selectedProduct.stock - formData.quantity })
        .eq('id', formData.product_id);
      if (stockError) throw stockError;

      setIsModalOpen(false);
      setFormData({ product_id: '', quantity: 1 });
      fetchSales();
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Error al procesar la venta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<Sale>[] = [
    { 
      accessorKey: 'products.name', 
      header: 'Producto',
      cell: ({ row }) => row.original.products?.name || 'Producto Eliminado'
    },
    { accessorKey: 'quantity', header: 'Cantidad' },
    { 
      accessorKey: 'total', 
      header: 'Total ($)',
      cell: ({ row }) => `$${Number(row.original.total).toLocaleString()}`
    },
    { 
      accessorKey: 'sold_at', 
      header: 'Fecha',
      cell: ({ row }) => row.original.sold_at ? format(new Date(row.original.sold_at), 'dd/MM/yyyy HH:mm') : ''
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Ventas</h1>
        {isGuest && (
          <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-500/20">
            Modo Preview
          </span>
        )}
      </div>
      
      <DataTable 
        data={sales} 
        columns={columns} 
        onAdd={() => setIsModalOpen(true)}
        addLabel="Registrar Venta"
      />

      <Modal isOpen={isModalOpen} onClose={() => !isSubmitting && setIsModalOpen(false)} title="Registrar Venta">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Producto</label>
            <select
              required
              value={formData.product_id}
              onChange={e => setFormData({...formData, product_id: e.target.value})}
              className="w-full h-10 px-3 bg-black/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
            >
              <option value="">Selecciona un producto...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} - ${p.sale_price.toLocaleString()} (Stock: {p.stock})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Cantidad</label>
            <input 
              required 
              type="number" 
              min="1"
              value={formData.quantity} 
              onChange={e => setFormData({...formData, quantity: parseInt(e.target.value, 10)})} 
              className="w-full h-10 px-3 bg-black/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white" 
            />
          </div>
          <div className="pt-4 flex justify-end space-x-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Procesando...' : 'Guardar Venta'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
