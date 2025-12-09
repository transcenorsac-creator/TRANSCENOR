import React from 'react';
import { Product } from '../types';
import { Share2, ShoppingCart, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  isAdmin?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart, 
  isAdmin = false,
  onEdit,
  onDelete
}) => {

  const handleShare = async () => {
    const catalogUrl = window.location.href;
    const text = `¡Hola! Mira este producto: *${product.name}* a solo *S/ ${product.price.toFixed(2)}*\n\n${product.description}\n\nEncuéntralo aquí: ${catalogUrl}`;
    
    // Attempt to use Web Share API (Mobile standard) to share the image file + text
    if (navigator.share) {
      try {
        // Fetch image and convert to blob to share as a file
        const response = await fetch(product.image);
        const blob = await response.blob();
        // Determine mime type or default to png
        const mimeType = blob.type || 'image/png';
        const extension = mimeType.split('/')[1] || 'png';
        const file = new File([blob], `producto.${extension}`, { type: mimeType });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: product.name,
            text: text,
          });
          return;
        }
      } catch (error) {
        console.warn('Could not share image file, falling back to text/link share', error);
      }

      // Fallback: Share text with URL (if navigator.share is supported but file sharing isn't)
      try {
        await navigator.share({
          title: product.name,
          text: text,
          url: product.image.startsWith('http') ? product.image : undefined
        });
        return;
      } catch (e) {
        console.warn('Share dismissed or failed', e);
      }
    }

    // Fallback for Desktop: Open WhatsApp Web
    let message = text;
    // Append image link if it's a URL so WhatsApp generates a preview
    if (product.image.startsWith('http')) {
        message += `\n\nFoto: ${product.image}`;
    }

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      {/* Changed to aspect-square for 1:1 ratio */}
      <div className="relative aspect-square w-full bg-gray-100">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
          <Eye size={12} className="text-gray-500" />
          {product.views}
        </div>
        <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded-md text-xs font-bold">
          {product.category}
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{product.name}</h3>
        <p className="text-xl font-extrabold text-primary mt-1">S/ {product.price.toFixed(2)}</p>
        <p className="text-gray-500 text-sm mt-2 line-clamp-2 flex-1">{product.description}</p>
        
        <div className="mt-4 flex gap-2">
          {!isAdmin ? (
            <>
              <button 
                onClick={() => onAddToCart(product)}
                className="flex-1 bg-gray-900 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
              >
                <ShoppingCart size={18} />
                <span className="text-sm font-medium">Agregar</span>
              </button>
              <button 
                onClick={handleShare}
                className="bg-green-100 text-green-700 p-2 rounded-lg hover:bg-green-200 transition-colors"
                aria-label="Compartir en WhatsApp"
              >
                <Share2 size={20} />
              </button>
            </>
          ) : (
            <div className="flex gap-2 w-full">
              <button 
                onClick={() => onEdit && onEdit(product)}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Editar
              </button>
              <button 
                onClick={() => onDelete && onDelete(product.id)}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};