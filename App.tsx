import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Product, CartItem, Category, ViewMode } from './types';
import { getProducts, saveProduct, deleteProduct, incrementView } from './services/storage';
import { ProductCard } from './components/ProductCard';
import { AdminPanel } from './components/AdminPanel';
import { Store, ShoppingBag, Settings, Search, Menu, X, Trash2, Send } from 'lucide-react';

const App = () => {
  const [view, setView] = useState<ViewMode>('STORE');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Load initial data
    setProducts(getProducts());
  }, []);

  // --- Actions ---

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    incrementView(product.id); // Counting add to cart as interest/view
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleSaveProduct = (product: Product) => {
    saveProduct(product);
    setProducts(getProducts());
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      deleteProduct(id);
      setProducts(getProducts());
    }
  };

  const sendOrderViaWhatsApp = () => {
    if (cart.length === 0) return;
    
    let message = "Hola, me interesa hacer el siguiente pedido:\n\n";
    let total = 0;

    cart.forEach(item => {
      const subtotal = item.price * item.quantity;
      total += subtotal;
      message += `▪ ${item.quantity}x ${item.name} (S/ ${subtotal.toFixed(2)})\n`;
    });

    message += `\n*Total a pagar: S/ ${total.toFixed(2)}*`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const shareCatalog = () => {
     const catalogUrl = window.location.href;
     const message = `¡Mira nuestro catálogo completo de productos! Tenemos ofertas increíbles.\n\nVisítanos: ${catalogUrl}`;
     const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
     window.open(url, '_blank');
  };

  // --- Filtering ---

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // --- Render Helpers ---

  const renderStore = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar productos..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <button
            onClick={() => setSelectedCategory('Todas')}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${selectedCategory === 'Todas' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Todas
          </button>
          {Object.values(Category).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${selectedCategory === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={handleAddToCart} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
           <p className="text-gray-500">No se encontraron productos.</p>
        </div>
      )}
    </div>
  );

  const renderCart = () => {
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
           <h2 className="text-2xl font-bold text-gray-800">Tu Carrito</h2>
           <span className="text-gray-500">{cart.length} items</span>
        </div>
        
        {cart.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            Tu carrito está vacío. ¡Agrega productos!
            <button 
              onClick={() => setView('STORE')}
              className="block mx-auto mt-4 text-primary font-bold hover:underline"
            >
              Volver a la tienda
            </button>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {cart.map(item => (
                <div key={item.id} className="p-4 flex gap-4 items-center">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-md object-cover bg-gray-100" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-500">S/ {item.price} x {item.quantity}</p>
                  </div>
                  <div className="font-bold text-gray-900 mr-4">
                    S/ {(item.price * item.quantity).toFixed(2)}
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-400 hover:text-red-600 p-2"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="p-6 bg-gray-50">
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg text-gray-600">Total Estimado</span>
                <span className="text-3xl font-bold text-gray-900">S/ {total.toFixed(2)}</span>
              </div>
              
              <button
                onClick={sendOrderViaWhatsApp}
                className="w-full bg-[#25D366] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#1fb655] transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2"
              >
                <Send size={24} />
                Enviar Pedido por WhatsApp
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('STORE')}>
              <div className="w-8 h-8 bg-gradient-to-tr from-primary to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                C
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                CatalogoApp
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => setView('STORE')} 
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${view === 'STORE' ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <Store size={18} /> Tienda
              </button>
              <button 
                onClick={() => setView('ADMIN')} 
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${view === 'ADMIN' ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <Settings size={18} /> Admin
              </button>
            </div>

            {/* Cart & Mobile Menu */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setView('CART')}
                className="relative p-2 text-gray-600 hover:text-primary transition-colors"
              >
                <ShoppingBag size={24} />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {cart.reduce((a, b) => a + b.quantity, 0)}
                  </span>
                )}
              </button>
              
              <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t px-4 py-2 space-y-2 shadow-lg">
             <button 
                onClick={() => { setView('STORE'); setIsMenuOpen(false); }} 
                className="block w-full text-left py-2 px-4 rounded-lg hover:bg-gray-50 font-medium"
              >
                Tienda
              </button>
              <button 
                onClick={() => { setView('ADMIN'); setIsMenuOpen(false); }} 
                className="block w-full text-left py-2 px-4 rounded-lg hover:bg-gray-50 font-medium"
              >
                Administrador
              </button>
              <button 
                 onClick={shareCatalog}
                 className="block w-full text-left py-2 px-4 rounded-lg text-green-600 font-medium bg-green-50"
              >
                 Compartir Catálogo
              </button>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'STORE' && renderStore()}
        
        {view === 'ADMIN' && (
          <AdminPanel 
            products={products} 
            onSave={handleSaveProduct} 
            onDelete={handleDeleteProduct} 
          />
        )}
        
        {view === 'CART' && renderCart()}
      </main>

      {/* Floating Action Button for WhatsApp Share (Visible in Store) */}
      {view === 'STORE' && (
        <button
          onClick={shareCatalog}
          className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#1fb655] hover:scale-110 transition-all z-40 group flex items-center gap-2"
          aria-label="Share Catalog"
        >
          <Send className="w-6 h-6" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap font-bold">
            Compartir Catálogo
          </span>
        </button>
      )}
    </div>
  );
};

export default App;