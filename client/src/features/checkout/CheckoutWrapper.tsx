import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import agent from '../../app/api/agent';
import LoadingComponent from '../../app/layout/LoadingComponent';
import { useAppDispatch } from '../../app/store/configureStore';
import { setBasket } from '../basket/basketSlice';
import CheckoutPage from './CheckoutPage';

// pass in the publishable key from Stripe
const stripePromise = loadStripe(
  'pk_test_51LAOElL4wuS1zpNGly7iaNogF74bTQ3a2ImXIGbxQuLrQpPCm58RouWYNoyzYxsV6kbp1sps8YIxgezgOW6OO0ID00kMzoz10H'
);

// wrap the Stripe provider around the CheckoutPage
// https://stripe.com/docs/stripe-js/react#elements-provider
const CheckoutWrapper = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // response will include the basket with paymentIntent and clientSecret
    agent.Payments.createPaymentIntent()
      .then((basket) => dispatch(setBasket(basket)))
      .catch((error: any) => console.log(error))
      .finally(() => setLoading(false));
  }, [dispatch]);

  if (loading) return <LoadingComponent message="Loading checkout..." />;

  return (
    <Elements stripe={stripePromise}>
      <CheckoutPage />
    </Elements>
  );
};

export default CheckoutWrapper;
