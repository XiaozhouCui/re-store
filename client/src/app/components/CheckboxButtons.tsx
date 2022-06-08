import { FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import { useState } from 'react';

interface Props {
  items: string[];
  checked?: string[]; // array of checked items
  onChange: (items: string[]) => void;
}

const CheckboxButtons = ({ items, checked, onChange }: Props) => {
  const [checkedItems, setCheckedItems] = useState(checked || []);

  // when user click a checkbox
  const handleChecked = (value: string) => {
    // find if the current box is checked or not
    const currentIndex = checkedItems.findIndex((item) => item === value);
    let newChecked: string[] = [];
    if (currentIndex === -1) {
      newChecked = [...checkedItems, value];
    } else {
      newChecked = checkedItems.filter((item) => item !== value);
    }
    setCheckedItems(newChecked);
    // pass the checked items to parent component and update redux state
    onChange(newChecked);
  };

  return (
    <FormGroup>
      {items.map((item) => (
        <FormControlLabel
          key={item}
          label={item}
          control={
            <Checkbox
              checked={checkedItems.indexOf(item) !== -1}
              onClick={() => handleChecked(item)}
            />
          }
        />
      ))}
    </FormGroup>
  );
};

export default CheckboxButtons;
