import { createStore } from 'redux';
import counterReducer from '../../features/contact/counterReducer';

export const configureStore = () => {
  return createStore(counterReducer);
};
