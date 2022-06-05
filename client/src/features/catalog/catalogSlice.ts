import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from '@reduxjs/toolkit';
import agent from '../../app/api/agent';
import { Product } from '../../app/models/product';

// use createEntityAdapter to normalize data (products): { ids: [], entities: {} }
// https://redux-toolkit.js.org/usage/usage-guide#managing-normalized-data

const productsAdapter = createEntityAdapter<Product>();

// thunk: get a list of product
export const fetchProductsAsync = createAsyncThunk<Product[]>(
  'catalog/fetchProductsAsync',
  async () => {
    try {
      return await agent.Catalog.list();
    } catch (error) {
      console.log(error);
    }
  }
);

export const catalogSlice = createSlice({
  name: 'catalog',
  initialState: productsAdapter.getInitialState({
    productsLoaded: false,
    status: 'idle',
  }),
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchProductsAsync.pending, (state) => {
      state.status = 'pendingFetchProducts';
    });
    builder.addCase(fetchProductsAsync.fulfilled, (state, action) => {
      // productsAdapter will have all the methods to work on products array
      productsAdapter.setAll(state, action.payload); // payload contains list of products
      state.status = 'idle';
      state.productsLoaded = true;
    });
    builder.addCase(fetchProductsAsync.rejected, (state) => {
      state.status = 'idle';
    });
  },
});
