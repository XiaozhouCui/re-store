import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import agent from '../../app/api/agent';
import { Basket } from '../../app/models/basket';

interface BasketState {
  basket: Basket | null;
  status: string;
}

const initialState: BasketState = {
  basket: null,
  status: 'idle',
};

// async functions from redux-toolkit, action creators

// add item function will return a Basket obj
export const addBasketItemAsync = createAsyncThunk<
  Basket,
  { productId: number; quantity?: number }
>(
  'basket/addBasketItemAsync',
  async ({ productId, quantity = 1 }, thunkAPI) => {
    try {
      return await agent.Basket.addItem(productId, quantity);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data });
    }
  }
);

export const removeBasketItemAsync = createAsyncThunk<
  void, // return void
  { productId: number; quantity: number; name?: string }
>('basket/removeBasketItemAsync', async ({ productId, quantity }, thunkAPI) => {
  try {
    return await agent.Basket.removeItem(productId, quantity);
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ error: error.data });
  }
});

export const basketSlice = createSlice({
  name: 'basket',
  initialState,
  reducers: {
    // action creators have the same name as reducers, but only have 1 arg for payload
    setBasket: (state, action) => {
      state.basket = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addBasketItemAsync.pending, (state, action) => {
      // action.payload will be undefined when pending
      state.status = 'pendingAddItem' + action.meta.arg.productId; // append productId, so that not all items have spinners
    });
    builder.addCase(addBasketItemAsync.fulfilled, (state, action) => {
      // payload is of type Basket, because addBasketItemAsync will return a Basket
      state.basket = action.payload;
      state.status = 'idle';
    });
    builder.addCase(addBasketItemAsync.rejected, (state, action) => {
      state.status = 'idle';
      console.log(action.payload);
    });
    builder.addCase(removeBasketItemAsync.pending, (state, action) => {
      // action.meta.arg.name to target the button being clicked for spinner
      state.status =
        'pendingRemoveItem' + action.meta.arg.productId + action.meta.arg.name;
    });
    builder.addCase(removeBasketItemAsync.fulfilled, (state, action) => {
      // action.meta.arg contains the productId and quantity (arg of removeBasketItemAsync)
      const { productId, quantity } = action.meta.arg;
      const itemIndex = state.basket?.items.findIndex(
        (i) => i.productId === productId
      );
      if (itemIndex === undefined || itemIndex === -1) return;
      // reduce item quantity
      state.basket!.items[itemIndex].quantity -= quantity;
      // remove item from basket if quantity is reduced to 0
      if (state.basket?.items[itemIndex].quantity === 0) {
        state.basket.items.splice(itemIndex, 1);
      }
      state.status = 'idle';
    });
    builder.addCase(removeBasketItemAsync.rejected, (state, action) => {
      state.status = 'idle';
      console.log(action.payload);
    });
  },
});

// exported setBasket only have 1 argument which is the payload of action
export const { setBasket } = basketSlice.actions;
