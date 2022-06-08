import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from '@reduxjs/toolkit';
import agent from '../../app/api/agent';
import { Metadata } from '../../app/models/pagination';
import { Product, ProductParams } from '../../app/models/product';
import { RootState } from '../../app/store/configureStore';

interface CatalogState {
  productsLoaded: boolean;
  filtersLoaded: boolean;
  status: string;
  brands: string[];
  types: string[];
  productParams: ProductParams;
  metaData: Metadata | null;
}

// use createEntityAdapter to NORMALIZE data (products): { ids: [], entities: {} }
// https://redux-toolkit.js.org/usage/usage-guide#managing-normalized-data

const productsAdapter = createEntityAdapter<Product>();

const getAxiosParams = (productParams: ProductParams) => {
  const params = new URLSearchParams();
  params.append('pageNumber', productParams.pageNumber.toString());
  params.append('pageSize', productParams.pageSize.toString());
  params.append('orderBy', productParams.orderBy);
  // below params are optional
  if (productParams.searchTerm)
    params.append('searchTerm', productParams.searchTerm);
  if (productParams.brands.length > 0)
    params.append('brands', productParams.brands.toString());
  if (productParams.types.length > 0)
    params.append('types', productParams.types.toString());
  return params;
};

// thunk: get a list of products
export const fetchProductsAsync = createAsyncThunk<
  Product[],
  void,
  { state: RootState } // so that thunkAPI.getState() will know the state type
>(
  'catalog/fetchProductsAsync',
  // "_" is equavalent to void
  async (_, thunkAPI) => {
    // use thunkAPI to get params from redux state
    const params = getAxiosParams(thunkAPI.getState().catalog.productParams);
    try {
      const response = await agent.Catalog.list(params);
      // update metadata in state
      thunkAPI.dispatch(setMetaData(response.metaData));
      return response.items;
    } catch (error: any) {
      // thunkAPI: make sure the error is not in the "fulfilled" case
      return thunkAPI.rejectWithValue({ error: error.data });
    }
  }
);

// thunk: get filter options
export const fetchFilters = createAsyncThunk(
  'catalog/fetchFilters',
  async (_, thunkAPI) => {
    try {
      return agent.Catalog.fetchFilters();
    } catch (error: any) {
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

const initParams = () => {
  return {
    pageNumber: 1,
    pageSize: 6,
    orderBy: 'name',
    brands: [],
    types: [],
  };
};

export const catalogSlice = createSlice({
  name: 'catalog',
  initialState: productsAdapter.getInitialState<CatalogState>({
    productsLoaded: false,
    filtersLoaded: false,
    status: 'idle',
    brands: [],
    types: [],
    productParams: initParams(),
    metaData: null,
  }),
  reducers: {
    setProductParams: (state, action) => {
      // force the useEffect hook to re-fetch products from API
      state.productsLoaded = false;
      state.productParams = {
        ...state.productParams,
        ...action.payload, // overide a property, e.g. orderBy, brands, types etc.
        pageNumber: 1, // set page to 1 when a filter is clicked
      };
    },
    setPageNumber: (state, action) => {
      state.productsLoaded = false;
      state.productParams = { ...state.productParams, ...action.payload };
    },
    resetProductParams: (state) => {
      state.productParams = initParams();
    },
    setMetaData: (state, action) => {
      state.metaData = action.payload;
    },
  },
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
    builder.addCase(fetchFilters.pending, (state) => {
      state.status = 'pendingFetchFilters';
    });
    builder.addCase(fetchFilters.fulfilled, (state, action) => {
      state.brands = action.payload.brands;
      state.types = action.payload.types;
      state.filtersLoaded = true;
      state.status = 'idle';
    });
    builder.addCase(fetchFilters.rejected, (state, action) => {
      state.status = 'idle';
      console.log(action.payload);
    });
  },
});

// productSelectors is the normalized products, and has all the useful methods
export const productSelectors = productsAdapter.getSelectors(
  (state: RootState) => state.catalog
);

// export reducers as action creators
export const {
  setProductParams,
  resetProductParams,
  setMetaData,
  setPageNumber,
} = catalogSlice.actions;
