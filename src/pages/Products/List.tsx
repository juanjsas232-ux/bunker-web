import { useEffect, useState } from 'react';
import { supabase } from '../../hooks/useSupabase';
import { useAuth } from '../../hooks/useAuth';
import type { Product } from '../../types';
import { DataTable } from '../../components/tables/DataTable';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Coca Cola 1.5L', category: 'Bebidas', purchase_price: 1200, sale_price: 1800, stock: 24 },
  { id: '2', name: 'Pan Tajado Familiar', category: 'Panadería', purchase_price: 4500, sale_price: 6000, stock: 4 },
  { id: '3', name: 'Aceite Girasol 1L', category: 'Abarrotes', purchase_price: 8000, sale_price: 11500, stock: 15 },
  { id: '4', name: 'Detergente Líquido', category: 'Limpieza', purchase_price: 15000, sale_price: 22000, stock: 8 },
];

export const ProductsList = () => {
  const { isGuest } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '', category: '', purchase_price: 0, sale_price: 0, stock: 0
  });

  const fetchProducts = async () => {
    if (isGuest) {
      setProducts(MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase())));
      return;
    }

    let query = supabase.from('products').select('*').order('name');
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data } = await query;
    setProducts(data || []);
  };

  useEffect(() => {
    fetchProducts();
  }, [search, isGuest]);

  const handleDelete = async (id: string) => {
    if (isGuest) return alert('No se puede eliminar en modo demo');
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    await supabase.from('products').delete().eq('id', id);
    fetchProducts();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      alert('Los cambios no se guardan en modo demo');
      setIsModalOpen(false);
      return;
    }

    if (editingProduct) {
      await supabase.from('products').update(formData).eq('id', editingProduct.id);
    } else {
      await supabase.from('products').insert([formData]);
    }
    setIsModalOpen(false);
    fetchProducts();
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category: p.category || '',
      purchase_price: p.purchase_price,
      sale_price: p.sale_price,
      stock: p.stock
    });
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingProduct(null);
    setFormData({ name: '', category: '', purchase_price: 0, sale_price: 0, stock: 0 });
    setIsModalOpen(true);
  };

  const columns: ColumnDef<Product>[] = [
    { accessorKey: 'name', header: 'Nombre' },
    { accessorKey: 'category', header: 'Categoría' },
    { 
      accessorKey: 'sale_price', 
      header: 'Precio Venta',
      cell: ({ row }) => `$${Number(row.original.sale_price).toLocaleString()}`
    },
    { 
      accessorKey: 'stock', 
      header: 'Stock',
      cell: ({ row }) => {
        const val = row.original.stock;
        return <span className={val < 5 ? 'text-red-400 font-bold' : 'text-gray-200'}>{val}</span>;
      }
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => openEdit(row.original)}>
            <PencilSquareIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row.original.id)} className="text-red-400 hover:text-red-300">
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Inventario</h1>
        {isGuest && (
          <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-500/20">
            Modo Preview
          </span>
        )}
      </div>
      
      <DataTable 
        data={products} 
        columns={columns} 
        onAdd={openCreate}
        addLabel="Nuevo Producto"
        headerContent={
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-10 px-4 bg-black/30 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full max-w-sm"
          />
        }
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Nombre</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-10 px-3 bg-black/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Categoría</label>
            <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full h-10 px-3 bg-black/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Costo ($)</label>
              <input required type="number" step="0.01" value={formData.purchase_price} onChange={e => setFormData({...formData, purchase_price: parseFloat(e.target.value)})} className="w-full h-10 px-3 bg-black/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Precio Venta ($)</label>
              <input required type="number" step="0.01" value={formData.sale_price} onChange={e => setFormData({...formData, sale_price: parseFloat(e.target.value)})} className="w-full h-10 px-3 bg-black/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Stock</label>
            <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value, 10)})} className="w-full h-10 px-3 bg-black/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white" />
          </div>
          <div className="pt-4 flex justify-end space-x-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
