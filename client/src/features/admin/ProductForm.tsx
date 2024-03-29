import { Typography, Grid, Paper, Box, Button } from '@mui/material';
import { useEffect } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import AppDropzone from '../../app/components/AppDropzone';
import AppSelectList from '../../app/components/AppSelectList';
import AppTextInput from '../../app/components/AppTextInput';
import useProducts from '../../app/hooks/useProducts';
import { Product } from '../../app/models/product';
import { yupResolver } from '@hookform/resolvers/yup';
import { validationSchema } from './productValidation';
import agent from '../../app/api/agent';
import { useAppDispatch } from '../../app/store/configureStore';
import { setProduct } from '../catalog/catalogSlice';
import { LoadingButton } from '@mui/lab';

interface Props {
  product?: Product;
  cancelEdit: () => void;
}

const ProductForm = ({ product, cancelEdit }: Props) => {
  const {
    control,
    reset,
    handleSubmit,
    watch,
    formState: { isDirty, isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });
  const { brands, types } = useProducts();
  // watchFile is to preview the uploaded image, "file" is the name of dropzone
  const watchFile = watch('file', null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // reset the product if form is not dirty and there is no watchFile
    if (product && !watchFile && !isDirty) reset(product);
    // remove watchFile when component is destroyed/unmounted
    return () => {
      // remove the file
      if (watchFile) URL.revokeObjectURL(watchFile.preview);
    };
  }, [isDirty, product, reset, watchFile]);

  const handleSubmitData = async (data: FieldValues) => {
    try {
      let response: Product; // product from API
      if (product) {
        // admin updating an existing product
        response = await agent.Admin.updateProduct(data);
      } else {
        // admin crerating a new product
        response = await agent.Admin.createProduct(data);
      }
      // update catalog state
      dispatch(setProduct(response));
      // leave the form
      cancelEdit();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box component={Paper} sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Product Details
      </Typography>
      <form onSubmit={handleSubmit(handleSubmitData)}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12}>
            <AppTextInput control={control} name="name" label="Product name" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <AppSelectList
              control={control}
              items={brands}
              name="brand"
              label="Brand"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <AppSelectList
              control={control}
              items={types}
              name="type"
              label="Type"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <AppTextInput
              control={control}
              type="number"
              name="price"
              label="Price"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <AppTextInput
              control={control}
              type="number"
              name="quantityInStock"
              label="Quantity in Stock"
            />
          </Grid>
          <Grid item xs={12}>
            <AppTextInput
              control={control}
              multiline={true}
              rows={4}
              name="description"
              label="Description"
            />
          </Grid>
          <Grid item xs={12}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <AppDropzone control={control} name="file" />
              {watchFile ? (
                <img
                  src={watchFile.preview}
                  alt="preview"
                  style={{ maxHeight: 200 }}
                />
              ) : (
                <img
                  src={product?.pictureUrl}
                  alt={product?.name}
                  style={{ maxHeight: 200 }}
                />
              )}
            </Box>
          </Grid>
        </Grid>
        <Box display="flex" justifyContent="space-between" sx={{ mt: 3 }}>
          <Button onClick={cancelEdit} variant="contained" color="inherit">
            Cancel
          </Button>
          <LoadingButton
            loading={isSubmitting}
            type="submit"
            variant="contained"
            color="success"
          >
            Submit
          </LoadingButton>
        </Box>
      </form>
    </Box>
  );
};

export default ProductForm;
