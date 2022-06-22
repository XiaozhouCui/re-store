import { TextField } from '@mui/material';
import { useController, UseControllerProps } from 'react-hook-form';

// Props for react-hook-form's useController hook
interface Props extends UseControllerProps {
  label: string;
  multiline?: boolean;
  rows?: number;
  type?: string;
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
      multiline={props.multiline}
      rows={props.rows}
      type={props.type}
      error={!!fieldState.error}
      helperText={fieldState.error?.message}
    />
  );
};

export default AppTextInput;
