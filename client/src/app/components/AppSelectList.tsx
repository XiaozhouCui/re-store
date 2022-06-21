import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { useController, UseControllerProps } from 'react-hook-form';

// props for react-hook-form
interface Props extends UseControllerProps {
  label: string;
  items: string[];
}

// reusable drop-down list component
const AppSelectList = (props: Props) => {
  // use react-hook-form to control the form
  const { fieldState, field } = useController({ ...props, defaultValue: '' });
  return (
    <FormControl fullWidth error={!!fieldState.error}>
      <InputLabel>{props.label}</InputLabel>
      <Select value={field.value} label={props.label} onChange={field.onChange}>
        {props.items.map((item, index) => (
          <MenuItem key={index} value={item}>
            {item}
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>{fieldState.error?.message}</FormHelperText>
    </FormControl>
  );
};

export default AppSelectList;
