import * as yup from 'yup';

// laternative way to validate a form
export const validationSchema = [
  // validate shipping address page
  yup.object({
    fullName: yup.string().required('Full name is required'),
    address1: yup.string().required('Address line 1 is required'),
    address2: yup.string().required(),
    city: yup.string().required(),
    state: yup.string().required(),
    zip: yup.string().required(),
    country: yup.string().required(),
  }),
  // no need to validate review page
  yup.object(),
  // validate payment page
  yup.object({
    nameOnCard: yup.string().required(),
  }),
];
