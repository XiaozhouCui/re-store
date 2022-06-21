import * as yup from 'yup';

export const validationSchema = yup.object({
  name: yup.string().required(),
  brand: yup.string().required(),
  type: yup.string().required(),
  price: yup.number().required().moreThan(100),
  quantityInStock: yup.number().required().min(0),
  description: yup.string().required(),
  // use .when() to add conditions
  file: yup.mixed().when('pictureUrl', {
    is: (value: string) => !value, // check if pictureUrl is empty, not empty means updating an existing product
    then: yup.mixed().required('Please provide an image'), // image only required when creating a product (not when updating a product)
  }),
});
