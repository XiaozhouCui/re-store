import { debounce, TextField } from '@mui/material';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/store/configureStore';
import { setProductParams } from './catalogSlice';

const ProductSearch = () => {
  const { productParams } = useAppSelector((state) => state.catalog);
  const dispatch = useAppDispatch();
  // local state for debounced search
  const [searchTerm, setSearchTerm] = useState(productParams.searchTerm);
  // delay the action (thunk) for 1 second
  const debouncedSearch = debounce((event: any) => {
    dispatch(setProductParams({ searchTerm: event.target.value }));
  }, 1000);
  return (
    <TextField
      label="Search Products"
      variant="outlined"
      fullWidth
      value={searchTerm || ''}
      onChange={(event: any) => {
        setSearchTerm(event.target.value);
        debouncedSearch(event);
      }}
    />
  );
};

export default ProductSearch;
