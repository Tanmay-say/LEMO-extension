import React from 'react';
import { ShoppingCart, ExternalLink, Star, Heart, Plus } from 'lucide-react';

const BuyCard = ({ productData, onBuyClick }) => {
  // Extract product information
  const {
    title = 'Product Name',
    price = '₹0',
    originalPrice = '',
    discount = '',
    rating = '0',
    reviewCount = '0',
    image = '',
    description = 'Premium product with excellent features',
    url = '#'
  } = productData;

  // Convert INR to USD (approximate rate)
  const convertToUSD = (priceStr) => {
    const numericPrice = parseFloat(priceStr.replace(/[₹,]/g, ''));
    if (isNaN(numericPrice)) return '$0';
    const usdPrice = (numericPrice * 0.012).toFixed(2);
    return `$${usdPrice}`;
  };

  const usdPrice = convertToUSD(price);

  return (
    <div className="mt-4">
      {/* Compact Card Container */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-400/15 via-orange-300/10 to-orange-500/20 backdrop-blur-sm border border-orange-200/25 shadow-lg">
        {/* Card Content */}
        <div className="relative p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                <ShoppingCart className="w-3 h-3 text-white" />
              </div>
              <h3 className="text-sm font-bold text-orange-800">Ready to Purchase?</h3>
            </div>
            <button className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 backdrop-blur-sm">
              <Heart className="w-4 h-4 text-orange-600" />
            </button>
          </div>

          {/* Product Image */}
          <div className="mb-3">
            <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gradient-to-br from-orange-100 to-orange-200 shadow-md">
              {image ? (
                <img 
                  src={image} 
                  alt={title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">{title.charAt(0)}</div>
                  <div className="text-xs opacity-80">Product Image</div>
                </div>
              </div>
              
              {/* Discount Badge */}
              {discount && (
                <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
                  {discount} OFF
                </div>
              )}
            </div>
          </div>

          {/* Product Title */}
          <h4 className="text-sm font-bold text-gray-800 mb-2 leading-tight line-clamp-2">
            {title}
          </h4>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3 h-3 ${i < Math.floor(parseFloat(rating)) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <span className="text-xs text-gray-600 font-medium">
              {rating}/5 ({reviewCount} reviews)
            </span>
          </div>

          {/* Price Section */}
          <div className="mb-3">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-lg font-bold text-orange-600">{price}</span>
              <span className="text-sm text-gray-500 font-medium">{usdPrice}</span>
            </div>
            {originalPrice && (
              <div className="text-xs text-gray-500 line-through">
                {originalPrice}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <p className="text-gray-700 leading-relaxed text-xs line-clamp-2">
              {description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {/* Add to Cart Button */}
            <button className="flex-1 bg-white/30 hover:bg-white/40 backdrop-blur-sm text-orange-700 font-semibold py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-1 border border-orange-200/50 hover:border-orange-300/70 shadow-md hover:shadow-lg transform hover:scale-105">
              <Plus className="w-3 h-3" />
              <span className="text-xs">Add to Cart</span>
            </button>

            {/* Buy Now Button */}
            <button
              onClick={() => onBuyClick(url)}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-1 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <ShoppingCart className="w-3 h-3" />
              <span className="text-xs">Buy Now</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyCard;
