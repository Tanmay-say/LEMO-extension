import React from 'react';
import { ShoppingCart, ExternalLink, Star } from 'lucide-react';

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
    <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4 mt-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <ShoppingCart className="w-5 h-5 text-orange-600" />
        <h3 className="font-semibold text-orange-800">Ready to Purchase?</h3>
      </div>

      {/* Product Card */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-100">
        {/* Product Image */}
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
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
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
              {title.charAt(0)}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex-1">
            {/* Title */}
            <h4 className="font-semibold text-gray-800 text-sm leading-tight mb-2 line-clamp-2">
              {title}
            </h4>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs text-gray-600">
                {rating}/5 ({reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-orange-600">{price}</span>
                <span className="text-sm text-gray-500">{usdPrice}</span>
              </div>
              {originalPrice && (
                <div className="text-xs text-gray-500 line-through">
                  {originalPrice}
                </div>
              )}
              {discount && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  {discount} off
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-gray-600 line-clamp-2 mb-3">
              {description}
            </p>

            {/* Buy Button */}
            <button
              onClick={() => onBuyClick(url)}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <ShoppingCart className="w-4 h-4" />
              Buy Now
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          Secure Payment
        </span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          Fast Delivery
        </span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
          Easy Returns
        </span>
      </div>
    </div>
  );
};

export default BuyCard;
