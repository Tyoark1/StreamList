import { useOutletContext, Link } from 'react-router-dom';

export default function Cart() {
  const { cart, setCart } = useOutletContext();

  const handleUpdateQuantity = (item, change) => {
    const isSubscription = item.service.toLowerCase().includes("subscription");
    
    if (isSubscription && change > 0) return;

    setCart(cart.map((cartItem) => {
      if (cartItem.id === item.id) {
        const newQuantity = cartItem.quantity + change;
        return newQuantity > 0 ? { ...cartItem, quantity: newQuantity } : cartItem;
      }
      return cartItem;
    }));
  };

  const handleRemove = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-3xl font-bold text-stream-deep mb-6 flex items-center gap-2">
        <span className="material-symbols-rounded text-stream-aqua">shopping_cart</span>
        Your Shopping Cart
      </h2>

      {cart.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Your cart is currently empty.</p>
          <Link to="/subscriptions" className="px-6 py-2 bg-stream-aqua text-stream-deep font-bold rounded-lg hover:bg-stream-aqua/80 transition-colors">
            Browse Store
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {cart.map((item) => {
              const isSubscription = item.service.toLowerCase().includes("subscription");
              
              return (
                <div key={item.id} className="flex flex-col md:flex-row items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-4 w-full md:w-1/2">
                    <img src={item.img} alt={item.service} className="w-16 h-16 object-contain" />
                    <div>
                      <h3 className="font-bold text-stream-deep">{item.service}</h3>
                      <p className="text-sm text-gray-500">${item.price} each</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-4 md:mt-0">
                    <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-lg px-2 py-1">
                      <button 
                        onClick={() => handleUpdateQuantity(item, -1)}
                        className={`text-gray-500 hover:text-stream-deep font-bold px-2 ${item.quantity <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="font-semibold text-stream-deep w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateQuantity(item, 1)}
                        className={`text-gray-500 hover:text-stream-deep font-bold px-2 ${isSubscription ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isSubscription}
                        title={isSubscription ? "Subscriptions are limited to 1" : ""}
                      >
                        +
                      </button>
                    </div>

                    <p className="font-extrabold text-stream-deep w-20 text-right">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>

                    <button 
                      onClick={() => handleRemove(item.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      title="Remove Item"
                    >
                      <span className="material-symbols-rounded">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col items-end border-t border-gray-200 pt-6">
            <p className="text-gray-500 mb-1">Subtotal:</p>
            <p className="text-3xl font-extrabold text-stream-deep mb-6">${calculateTotal()}</p>
            <Link to="/checkout" className="px-8 py-3 bg-stream-deep text-white font-bold rounded-lg hover:bg-stream-deep/90 transition-colors shadow-md">
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}