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
// create item will return a Basket
export const addBasketItemAsync = createAsyncThunk<
  Basket,
  { productId: number; quantity: number }
>('basket/addBasketItemAsync', async ({ productId, quantity }) => {
  try {
    return await agent.Basket.addItem(productId, quantity);
  } catch (error) {
    console.log(error);
  }
});

export const basketSlice = createSlice({
  name: 'basket',
  initialState,
  reducers: {
    // actions have the same name as reducers, but only have 1 arg for payload
    setBasket: (state, action) => {
      state.basket = action.payload;
    },
    removeItem: (state, action) => {
      const { productId, quantity } = action.payload;
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
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addBasketItemAsync.pending, (state, action) => {
      console.log(action);
      state.status = 'pendingAddItem';
    });
    builder.addCase(addBasketItemAsync.fulfilled, (state, action) => {
      // payload is of type Basket, because addBasketItemAsync will return a Basket
      state.basket = action.payload;
      state.status = 'idle';
    });
    builder.addCase(addBasketItemAsync.rejected, (state) => {
      state.status = 'idle';
    });
  },
});

// exported setBasket and removeItem only have 1 argument which is the payload of action
export const { setBasket, removeItem } = basketSlice.actions;
