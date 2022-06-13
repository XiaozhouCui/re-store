import { TextField } from '@mui/material';
import { useController, UseControllerProps } from 'react-hook-form';

// Props for react-hook-form's useController hook
interface Props extends UseControllerProps {
  label: string;
}

const AppTextInput = (props: Props) => {
  // field: attributes of TextField. e.g. name, onChange, label
  const { fieldState, field } = useController({ ...props, defaultValue: '' });

  return (
    <TextField
      {...props}
      {...field}
      fullWidth
      variant="outlined"
      error={!!fieldState.error}
      helperText={fieldState.error?.message}
    />
  );
};

export default AppTextInput;
