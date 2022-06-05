import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from '@reduxjs/toolkit';
import agent from '../../app/api/agent';
import { Product } from '../../app/models/product';
import { RootState } from '../../app/store/configureStore';

// use createEntityAdapter to NORMALIZE data (products): { ids: [], entities: {} }
// https://redux-toolkit.js.org/usage/usage-guide#managing-normalized-data

const productsAdapter = createEntityAdapter<Product>();

// thunk: get a list of products
export const fetchProductsAsync = createAsyncThunk<Product[]>(
  'catalog/fetchProductsAsync',
  // "_" is equavalent to void
  async (_, thunkAPI) => {
    try {
      return await agent.Catalog.list();
    } catch (error: any) {
      // thunkAPI: make sure the error is not in the "fulfilled" case
      return thunkAPI.rejectWithValue({ error: error.data });
    }
  }
);

// thunk: get a single product by ID (number)
export const fetchProductAsync = createAsyncThunk<Product, number>(
  'catalog/fetchProductAsync',
  async (productId, thunkAPI) => {
    try {
      return await agent.Catalog.details(productId);
    } catch (error: any) {
      // thunkAPI: make sure the error is not in the "fulfilled" case
      return thunkAPI.rejectWithValue({ error: error.data });
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
      state.productsLoaded = true; // no need to re-fetch products everytime
    });
    builder.addCase(fetchProductsAsync.rejected, (state, action) => {
      state.status = 'idle';
      console.log(action.payload);
    });
    builder.addCase(fetchProductAsync.pending, (state) => {
      state.status = 'pendingFetchProduct';
    });
    builder.addCase(fetchProductAsync.fulfilled, (state, action) => {
      // upsert a new product into the products array in state
      productsAdapter.upsertOne(state, action.payload); // payload is a single product object
      state.status = 'idle';
    });
    builder.addCase(fetchProductAsync.rejected, (state, action) => {
      state.status = 'idle';
      console.log(action.payload);
    });
  },
});

// productSelectors is the normalized products, and has all the useful methods
export const productSelectors = productsAdapter.getSelectors(
  (state: RootState) => state.catalog
);
