import { useEffect } from 'react';
import {
  productSelectors,
  fetchProductsAsync,
  fetchFilters,
} from '../../features/catalog/catalogSlice';
import { useAppSelector, useAppDispatch } from '../store/configureStore';

const useProducts = () => {
  // get NORMALIZED products by using createEntityAdapter from redux-toolkit
  const products = useAppSelector(productSelectors.selectAll); // productSelectors has all the useful methods
  const { productsLoaded, filtersLoaded, brands, types, metaData } =
    useAppSelector((state) => state.catalog);

  const dispatch = useAppDispatch();

  useEffect(() => {
    // no need to re-fetch products everytime
    if (!productsLoaded) dispatch(fetchProductsAsync());
  }, [dispatch, productsLoaded]);

  // adding another useEffect, so that fetchProductsAsync() will not run again
  useEffect(() => {
    if (!filtersLoaded) dispatch(fetchFilters());
  }, [dispatch, filtersLoaded]);

  return {
    products,
    productsLoaded,
    filtersLoaded,
    brands,
    types,
    metaData,
  };
};

export default useProducts;
