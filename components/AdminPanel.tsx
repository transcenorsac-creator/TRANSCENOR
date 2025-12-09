import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types';
import { generateProductDescription } from '../services/geminiService';
import { Sparkles, Upload, X, Save, Image as ImageIcon, Eye } from 'lucide-react';

interface AdminPanelProps {
  products: Product[];
  onSave: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ products, onSave, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: Category.OTROS,
    description: '',
    image: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize form when editing
  useEffect(() => {
    if (editingId) {
      const product = products.find(p => p.id === editingId);
      if (product) setFormData(product);
    } else {
      setFormData({
        name: '',
        price: 0,
        category: Category.OTROS,
        description: '',
        image: '',
      });
    }
  }, [editingId, products]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.name || !formData.price) {
      alert("Ingresa el nombre y precio para generar la descripción");
      return;
    }
    
    setIsGenerating(true);
    try {
      const desc = await generateProductDescription(
        formData.name, 
        formData.price, 
        formData.category || 'General'
      );
      setFormData(prev => ({ ...prev, description: desc }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    const newProduct: Product = {
      id: editingId || Date.now().toString(),
      name: formData.name,
      price: Number(formData.price),
      description: formData.description || '',
      category: formData.category as Category,
      image: formData.image || 'https://picsum.photos/400/400',
      views: formData.views || 0,
    };

    onSave(newProduct);
    setEditingId(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md h-fit sticky top-24">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          {editingId ? 'Editar Producto' : 'Nuevo Producto'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none"
              placeholder="Ej. Smart TV 50 pulgadas"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio (S/)</label>
              <input
                type="number"
                value={formData.price}
                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as Category})}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none"
              >
                {Object.values(Category).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
            <div className="flex items-center gap-2">
              <label className="flex-1 cursor-pointer bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3 text-center hover:bg-gray-100 transition">
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                <div className="flex flex-col items-center justify-center text-gray-500">
                  <Upload size={20} />
                  <span className="text-xs mt-1">Subir Foto</span>
                </div>
              </label>
              {formData.image && (
                <div className="w-16 h-16 rounded-lg overflow-hidden border">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Descripción</label>
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={isGenerating}
                className="text-xs flex items-center gap-1 text-purple-600 font-bold hover:text-purple-800 disabled:opacity-50"
              >
                <Sparkles size={12} />
                {isGenerating ? 'Generando...' : 'Generar con AI'}
              </button>
            </div>
            <textarea
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full border rounded-lg p-2 h-24 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
              placeholder="Descripción del producto..."
            />
          </div>

          <div className="flex gap-2 pt-2">
            {editingId && (
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="flex-1 bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-gray-800 flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>

      {/* List Section */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-xl font-bold mb-4">Inventario ({products.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map(product => (
            <div key={product.id} className="bg-white p-3 rounded-xl shadow-sm border flex gap-3 items-center">
               <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                 <img src={product.image} alt="" className="w-full h-full object-cover" />
               </div>
               <div className="flex-1 min-w-0">
                 <h4 className="font-bold text-gray-900 truncate">{product.name}</h4>
                 <p className="text-sm text-gray-500">{product.category} • S/ {product.price}</p>
                 <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                    <Eye size={12} /> {product.views} vistas
                 </div>
               </div>
               <div className="flex gap-2">
                 <button 
                  onClick={() => setEditingId(product.id)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                 >
                   <ImageIcon size={18} />
                 </button>
                 <button 
                  onClick={() => onDelete(product.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                 >
                   <X size={18} />
                 </button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};