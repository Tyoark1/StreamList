import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import list from '../components/data';

export default function Subscriptions() {
  const { cart, setCart } = useOutletContext();
  const [warning, setWarning] = useState('');

  const handleAddToCart = (item) => {
    const isSubscription = item.service.toLowerCase().includes("subscription");

    if (isSubscription) {
      const existingSubscription = cart.find((cartItem) => 
        cartItem.service.toLowerCase().includes("subscription")
      );

      if (existingSubscription) {
        setWarning(`Only one subscription can be in your cart at a time.`);
        setTimeout(() => setWarning(''), 3500);
        return; 
      }
    }

    const existingItem = cart.find((cartItem) => cartItem.id === item.id);

    if (existingItem) {
      setCart(cart.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 min-h-[500px] relative">
      <h2 className="text-3xl font-bold text-stream-deep mb-6 flex items-center gap-2">
        <span className="material-symbols-rounded text-stream-aqua">store</span>
        EZTech Subscriptions & Gear
      </h2>

      {warning && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg font-semibold z-50 animate-bounce">
          {warning}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {list.map((item) => (
          <div key={item.id} className="bg-stream-foam rounded-lg overflow-hidden shadow-sm border border-gray-200 flex flex-col items-center p-4">
            <img src={item.img} alt={item.service} className="h-32 object-contain mb-4" />
            <h3 className="font-bold text-stream-deep text-center mb-1">{item.service}</h3>
            <p className="text-sm text-gray-500 mb-2 text-center">{item.serviceInfo}</p>
            <p className="text-lg font-extrabold text-stream-deep mb-4">${item.price}</p>
            
            <button 
              onClick={() => handleAddToCart(item)}
              className="mt-auto w-full py-2 bg-stream-aqua text-stream-deep font-bold rounded-lg hover:bg-stream-aqua/80 transition-colors"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}