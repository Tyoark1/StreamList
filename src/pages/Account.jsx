import { useOutletContext, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Account() {
  const { currentUser } = useOutletContext();
  const [savedCard, setSavedCard] = useState(null);
  
  const [activePlan, setActivePlan] = useState('Free Tier');

  // CAPSTONE: TIER_HYDRATION
  useEffect(() => {
    const cardData = localStorage.getItem('streamlist_saved_card');
    if (cardData) {
      setSavedCard(JSON.parse(cardData));
    }
    // Dynamically reads the active plan processed by the Checkout pipeline
    const savedPlan = localStorage.getItem('streamlist_active_plan');
    if (savedPlan) {
      setActivePlan(savedPlan);
    }
  }, []);

  const getMaskedCard = (number) => {
    if (!number) return '';
    const lastFour = number.slice(-4);
    return `**** **** **** ${lastFour}`;
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-lg text-[#001F3F]">
      <h1 className="text-3xl font-bold mb-8 border-b pb-4 border-stream-aqua">Account Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-50 p-6 rounded shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 text-stream-aqua bg-[#001F3F] inline-block px-4 py-1 rounded">Profile</h2>
          <div className="space-y-3">
            <p><span className="font-bold">Name:</span> {currentUser?.name || 'EZTech User'}</p>
            <p><span className="font-bold">Email:</span> {currentUser?.email || 'user@example.com'}</p>
            <p><span className="font-bold">Status:</span> <span className="text-green-600 font-bold">Verified</span></p>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-stream-aqua bg-[#001F3F] inline-block px-4 py-1 rounded">Billing & Plans</h2>
            <Link to="/subscriptions" className="text-sm font-bold text-[#001F3F] underline hover:text-stream-aqua">
              Change Plan
            </Link>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="font-bold text-gray-500 text-sm">Active Subscription</p>
              <p className="font-bold text-lg">{activePlan}</p>
            </div>
            
            <div className="pt-4 border-t">
              <p className="font-bold text-gray-500 text-sm mb-1">Payment Method</p>
              {savedCard ? (
                <div>
                  <p className="font-mono text-lg">{getMaskedCard(savedCard.cardNumber)}</p>
                  <p className="text-sm">Expires: {savedCard.expiry}</p>
                </div>
              ) : (
                <p className="text-gray-500 italic">No payment method saved.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}