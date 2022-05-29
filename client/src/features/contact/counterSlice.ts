import { createSlice } from '@reduxjs/toolkit';

export interface CounterState {
  data: number;
  title: string;
}

const initialState: CounterState = {
  data: 42,
  title: 'YARC (yet another redux counter with toolkit)',
};

// redux-toolkit will handle all action creators and reducers
export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state, action) => {
      // redux-toolkit will return immutable state behind the scene
      state.data += action.payload;
    },
    decrement: (state, action) => {
      state.data -= action.payload;
    },
  },
});

export const { increment, decrement } = counterSlice.actions;
