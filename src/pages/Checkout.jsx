import { useState, useRef, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

const REDIRECT_DELAY_MS = 2000;

function groupCardNumber(digits) {
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19);
}

function formatExpiry(digits) {
  const clean = digits.slice(0, 4);
  return clean.length > 2 ? `${clean.slice(0, 2)}/${clean.slice(2)}` : clean;
}

function isValidCardNumber(digits) {
  return /^\d{16}$/.test(digits);
}

function isValidExpiry(value) {
  const match = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!match) return false;

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;

  const endOfMonth = new Date(year, month, 1).getTime() - 1;
  return endOfMonth >= Date.now();
}

function readSavedCardFields() {
  try {
    const raw = localStorage.getItem('streamlist_saved_card');
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== 'object') return {};
    return {
      cardHolder: typeof parsed.cardHolder === 'string' ? parsed.cardHolder : '',
      expiry: typeof parsed.expiry === 'string' ? parsed.expiry : '',
    };
  } catch {
    localStorage.removeItem('streamlist_saved_card');
    return {};
  }
}

export default function Checkout() {
  const [initialCard] = useState(readSavedCardFields);

  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(initialCard.cardHolder);
  const [expiry, setExpiry] = useState(initialCard.expiry);
  const [cvv, setCvv] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const { setCart, cart } = useOutletContext();
  const redirectTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
        redirectTimer.current = null;
      }
    };
  }, []);

  const handleCardNumberChange = (e) => {
    setCardNumber(groupCardNumber(e.target.value.replace(/\D/g, '')));
  };

  const handleExpiryChange = (e) => {
    setExpiry(formatExpiry(e.target.value.replace(/\D/g, '')));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = {};
    const digits = cardNumber.replace(/\s/g, '');

    if (cardHolder.trim().length < 2) {
      nextErrors.cardHolder = 'Enter the name as it appears on the card';
    }
    if (!isValidCardNumber(digits)) {
      nextErrors.cardNumber = 'Enter a valid 16-digit card number';
    }
    if (!isValidExpiry(expiry)) {
      nextErrors.expiry = 'Enter a valid, unexpired MM/YY date';
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      nextErrors.cvv = 'CVV must be 3 or 4 digits';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    localStorage.setItem(
      'streamlist_saved_card',
      JSON.stringify({
        cardHolder: cardHolder.trim(),
        cardLast4: digits.slice(-4),
        expiry,
      })
    );

    setIsSaved(true);

    redirectTimer.current = setTimeout(() => {
      redirectTimer.current = null;

      const purchasedPlan = cart?.find(item => {
        const itemService = (item?.service || '').toLowerCase();
        
        return itemService.includes('tier') || 
               itemService.includes('silver') || 
               itemService.includes('gold') || 
               itemService.includes('platinum') || 
               itemService.includes('aqua') || 
               itemService.includes('subscription');
      });

      // Extract the service name to save
      const planToSave = purchasedPlan?.service;

      if (planToSave) {
        localStorage.setItem('streamlist_active_plan', planToSave);
      }

      setCart([]);
      navigate('/');
    }, REDIRECT_DELAY_MS);
  };

  const fieldClass = (field) =>
    `w-full border p-2 rounded ${errors[field] ? 'border-red-500' : ''}`;

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg mt-12 text-[#001F3F]">
      <h2 className="text-2xl font-bold mb-6 text-center">Secure Checkout</h2>

      {isSaved ? (
        <div className="text-green-600 font-bold text-center p-4" role="status">
          Payment Method Saved! Order Processing...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="cardHolder" className="block text-sm font-bold mb-1">
              Name on Card
            </label>
            <input
              id="cardHolder"
              type="text"
              name="cc-name"
              autoComplete="cc-name"
              maxLength={60}
              className={fieldClass('cardHolder')}
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
            />
            {errors.cardHolder && (
              <p className="text-red-600 text-xs mt-1">{errors.cardHolder}</p>
            )}
          </div>

          <div>
            <label htmlFor="cardNumber" className="block text-sm font-bold mb-1">
              Card Number
            </label>
            <input
              id="cardNumber"
              type="text"
              inputMode="numeric"
              name="cc-number"
              autoComplete="cc-number"
              placeholder="1234 5678 9012 3456"
              className={`${fieldClass('cardNumber')} tracking-widest font-mono`}
              value={cardNumber}
              onChange={handleCardNumberChange}
            />
            {errors.cardNumber && (
              <p className="text-red-600 text-xs mt-1">{errors.cardNumber}</p>
            )}
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="expiry" className="block text-sm font-bold mb-1">
                Expiration
              </label>
              <input
                id="expiry"
                type="text"
                inputMode="numeric"
                name="cc-exp"
                autoComplete="cc-exp"
                placeholder="MM/YY"
                className={`${fieldClass('expiry')} font-mono`}
                value={expiry}
                onChange={handleExpiryChange}
              />
              {errors.expiry && (
                <p className="text-red-600 text-xs mt-1">{errors.expiry}</p>
              )}
            </div>
            <div className="flex-1">
              <label htmlFor="cvv" className="block text-sm font-bold mb-1">
                CVV
              </label>
              <input
                id="cvv"
                type="text"
                inputMode="numeric"
                name="cc-csc"
                autoComplete="cc-csc"
                maxLength={4}
                className={`${fieldClass('cvv')} font-mono`}
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
              />
              {errors.cvv && (
                <p className="text-red-600 text-xs mt-1">{errors.cvv}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#001F3F] text-stream-aqua py-3 rounded font-bold hover:bg-gray-800 transition"
          >
            Save Card &amp; Complete Purchase
          </button>
        </form>
      )}
    </div>
  );
}