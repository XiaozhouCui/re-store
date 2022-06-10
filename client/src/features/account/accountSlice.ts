import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import { FieldValues } from 'react-hook-form';
import agent from '../../app/api/agent';
import { User } from '../../app/models/user';
import { history } from '../..';

interface AccountState {
  user: User | null;
}

const initialState: AccountState = {
  user: null,
};

// thunk: login, pass in FieldValues and return User
export const signInUser = createAsyncThunk<User, FieldValues>(
  'account/signInUser',
  async (data, thunkAPI) => {
    try {
      const user = await agent.Account.login(data);
      // store token into local storage
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data });
    }
  }
);

// thunk: get current user
export const fetchCurrentUser = createAsyncThunk<User>(
  'account/fetchCurrentUser',
  async (_, thunkAPI) => {
    try {
      const user = await agent.Account.currentUser();
      // store token into local storage
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data });
    }
  }
);

export const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    // signOut doesn't call API
    signOut: (state) => {
      state.user = null;
      localStorage.removeItem('user');
      history.push('/'); // browserHistory outside React
    },
  },
  // using createAsyncThunk will require extra reducers
  extraReducers: (builder) => {
    // handle 2 successful cases together: signInUser and fetchCurrentUser
    builder.addMatcher(
      isAnyOf(signInUser.fulfilled, fetchCurrentUser.fulfilled),
      (state, action) => {
        state.user = action.payload;
      }
    );
    builder.addMatcher(
      isAnyOf(signInUser.rejected, fetchCurrentUser.rejected),
      (state, action) => {
        console.log(action.payload);
      }
    );
  },
});

export const { signOut } = accountSlice.actions;
