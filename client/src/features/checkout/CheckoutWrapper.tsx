import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutPage from './CheckoutPage';

// pass in the publishable key from Stripe
const stripePromise = loadStripe(
  'pk_test_51LAOElL4wuS1zpNGly7iaNogF74bTQ3a2ImXIGbxQuLrQpPCm58RouWYNoyzYxsV6kbp1sps8YIxgezgOW6OO0ID00kMzoz10H'
);

// wrap the Stripe provider around the CheckoutPage
const CheckoutWrapper = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutPage />
    </Elements>
  );
};

export default CheckoutWrapper;
