import {
  Box,
  Button,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { FieldValues, FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import AddressForm from './AddressForm';
import PaymentForm from './PaymentForm';
import Review from './Review';
import { validationSchema } from './checkoutValidation';
import agent from '../../app/api/agent';
import { useAppDispatch, useAppSelector } from '../../app/store/configureStore';
import { clearBasket } from '../basket/basketSlice';
import { LoadingButton } from '@mui/lab';
import { StripeElementType } from '@stripe/stripe-js';
import {
  CardNumberElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';

const steps = ['Shipping address', 'Review your order', 'Payment details'];

const CheckoutPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [orderNumber, setOrderNumber] = useState(0);
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();

  // add local state to track Stripe card input for validation
  const [cardState, setCardState] = useState<{
    elementError: { [key in StripeElementType]?: string };
  }>({ elementError: {} });

  const [cardComplete, setCardComplete] = useState<any>({
    cardNumber: false,
    cardExpiry: false,
    cardCvc: false,
  });

  // indicate payment status from Stripe
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);

  // basket in redux contains ClientSecret from Stripe
  const { basket } = useAppSelector((state) => state.basket);

  // create actual payment
  const stripe = useStripe();
  // card elements, e.g. CardNumberElement
  const elements = useElements();

  // track if card inputs are complete
  const onCardInputChange = (event: any) => {
    setCardState({
      ...cardState,
      // append element error if exists
      elementError: {
        ...cardState.elementError,
        // elementType: cardNumber, cardExpiry, cardCvc etc.
        [event.elementType]: event.error?.message,
      },
    });
    setCardComplete({
      ...cardComplete,
      [event.elementType]: event.complete,
    });
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <AddressForm />;
      case 1:
        return <Review />;
      case 2:
        return (
          <PaymentForm
            cardState={cardState}
            onCardInputChange={onCardInputChange}
          />
        );
      default:
        throw new Error('Unknown step');
    }
  };

  // is an array with each element for each checkout-step
  const currentValidationSchema = validationSchema[activeStep];

  // pass the methods to child components through <FormProvider>
  const methods = useForm({
    mode: 'all',
    resolver: yupResolver(currentValidationSchema),
  });

  useEffect(() => {
    // get previously saved address from DB
    agent.Account.fetchAddress().then((response) => {
      // reset the form with the values from API
      if (response) {
        methods.reset({
          ...methods.getValues(),
          ...response,
          saveAddress: false,
        });
      }
    });
  }, [methods]);

  // once the PaymentIntent is set, submit order to Stripe
  const submitOrder = async (data: FieldValues) => {
    // all frontend validations have passed at this stage
    setLoading(true);
    // destructure nameOnCard and saveAddress, everything else is shipping address
    const { nameOnCard, saveAddress, ...shippingAddress } = data;
    if (!stripe || !elements) return; // stripe is not ready
    try {
      // only provide card number element, then Stripe will get the remaining elements
      const cardElement = elements.getElement(CardNumberElement);
      // call Stripe API
      const paymentResult = await stripe.confirmCardPayment(
        basket?.clientSecret!,
        {
          payment_method: {
            card: cardElement!,
            billing_details: {
              name: nameOnCard,
            },
          },
        }
      );
      console.log(paymentResult);
      // if payment is successful, create the order
      if (paymentResult.paymentIntent?.status === 'succeeded') {
        // creating order will have order number back from API
        const orderNumber = await agent.Orders.create({
          saveAddress,
          shippingAddress,
        });
        setOrderNumber(orderNumber);
        setPaymentSucceeded(true);
        setPaymentMessage('Thank you - we have received your payment');
        setActiveStep(activeStep + 1); // last step is to display paymentMessage
        dispatch(clearBasket()); // clear basket from redux state
        setLoading(false);
      } else {
        setPaymentMessage(paymentResult.error?.message!);
        setPaymentSucceeded(false);
        setLoading(false);
        setActiveStep(activeStep + 1); // last step is to display paymentMessage
      }
    } catch (error: any) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleNext = async (data: FieldValues) => {
    // second last step is to make payment
    if (activeStep === steps.length - 1) {
      await submitOrder(data);
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const submitDisabled = (): boolean => {
    // check if on PaymentForm (second last step)
    if (activeStep === steps.length - 1) {
      // disable the submit button if any stripe or custom validation fails
      return (
        !cardComplete.cardCvc ||
        !cardComplete.cardExpiry ||
        !cardComplete.cardNumber ||
        !methods.formState.isValid
      );
    }
    // if not on PaymentForm, noly check custom validation
    return !methods.formState.isValid;
  };

  return (
    <FormProvider {...methods}>
      <Paper
        variant="outlined"
        sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
      >
        <Typography component="h1" variant="h4" align="center">
          Checkout
        </Typography>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <>
          {activeStep === steps.length ? (
            <>
              <Typography variant="h5" gutterBottom>
                {paymentMessage}
              </Typography>
              {paymentSucceeded ? (
                <Typography variant="subtitle1">
                  Your order number is #{orderNumber}. We have not emailed your
                  order confirmation, and will not send you an update when your
                  order has shipped as this is a fake store!
                </Typography>
              ) : (
                <Button variant="contained" onClick={handleBack}>
                  Go back and try again
                </Button>
              )}
            </>
          ) : (
            <form onSubmit={methods.handleSubmit(handleNext)}>
              {getStepContent(activeStep)}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                {activeStep !== 0 && (
                  <Button onClick={handleBack} sx={{ mt: 3, ml: 1 }}>
                    Back
                  </Button>
                )}
                <LoadingButton
                  loading={loading}
                  disabled={submitDisabled()}
                  variant="contained"
                  type="submit"
                  sx={{ mt: 3, ml: 1 }}
                >
                  {activeStep === steps.length - 1 ? 'Place order' : 'Next'}
                </LoadingButton>
              </Box>
            </form>
          )}
        </>
      </Paper>
    </FormProvider>
  );
};

export default CheckoutPage;
