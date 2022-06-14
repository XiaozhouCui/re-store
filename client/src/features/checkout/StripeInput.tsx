import { InputBaseComponentProps } from '@mui/material';
import { forwardRef, Ref, useImperativeHandle, useRef } from 'react';

interface Props extends InputBaseComponentProps {}

// Retain MUI styling in input field while using Stripe
// forward ref from MUI text-input field to Stripe
export const StripeInput = forwardRef(function StripeInput(
  { component: Component, ...props }: Props,
  ref: Ref<unknown>
) {
  // create a ref inside StripeInput component
  const elementRef = useRef<any>();

  // pass in the forwarded ref
  useImperativeHandle(ref, () => ({
    focus: () => elementRef.current.focus,
  }));

  // "onReady" attribute from Stripe doc
  // https://stripe.com/docs/stripe-js/react#element-components
  return (
    <Component
      onReady={(element: any) => (elementRef.current = element)}
      {...props}
    />
  );
});
