import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import AppTextInput from '../../app/components/AppTextInput';

export default function AddressForm() {
  // use react-hook-form to make it a controlled form
  const { control, handleSubmit } = useForm();

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Shipping address
      </Typography>
      <form onSubmit={handleSubmit((data) => console.log(data))}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12}>
            <AppTextInput control={control} name="fullName" label="Full name" />
          </Grid>
          <Grid item xs={12}>
            <AppTextInput control={control} name="address1" label="Address 1" />
          </Grid>
          <Grid item xs={12}>
            <AppTextInput control={control} name="address2" label="Address 2" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <AppTextInput control={control} name="city" label="City" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <AppTextInput control={control} name="state" label="State" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <AppTextInput control={control} name="zip" label="Zipcode" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <AppTextInput control={control} name="country" label="Country" />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox color="secondary" name="saveAddress" value="yes" />
              }
              label="Use this address for payment details"
            />
          </Grid>
        </Grid>
        <Button type="submit">Submit form</Button>
      </form>
    </>
  );
}
