import { Checkbox, FormControlLabel } from '@mui/material';
import { useController, UseControllerProps } from 'react-hook-form';

interface Props extends UseControllerProps {
  label: string;
}

const AppCheckbox = (props: Props) => {
  const { field } = useController({ ...props, defaultValue: false });
  return (
    <FormControlLabel
      control={<Checkbox {...field} checked={field.value} color="secondary" />}
      label={props.label}
    />
  );
};

export default AppCheckbox;
