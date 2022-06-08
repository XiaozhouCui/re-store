import { useEffect } from 'react';
import LoadingComponent from '../../app/layout/LoadingComponent';
import { useAppDispatch, useAppSelector } from '../../app/store/configureStore';
import {
  fetchFilters,
  fetchProductsAsync,
  productSelectors,
} from './catalogSlice';
import ProductList from './ProductList';

export default function Catalog() {
  // get NORMALIZED products by using createEntityAdapter from redux-toolkit
  const products = useAppSelector(productSelectors.selectAll); // productSelectors has all the useful methods
  const { productsLoaded, filtersLoaded, status } = useAppSelector(
    (state) => state.catalog
  );
  const dispatch = useAppDispatch();
  useEffect(() => {
    // no need to re-fetch products everytime
    if (!productsLoaded) dispatch(fetchProductsAsync());
  }, [dispatch, productsLoaded]);
  // adding another useEffect, so that fetchProductsAsync() will not run again
  useEffect(() => {
    if (!filtersLoaded) dispatch(fetchFilters());
  }, [dispatch, filtersLoaded]);

  if (status.includes('pending'))
    return <LoadingComponent message="Loading products..." />;

  return (
    <>
      <ProductList products={products} />
    </>
  );
}
