import { useEffect } from 'react';
import LoadingComponent from '../../app/layout/LoadingComponent';
import { useAppDispatch, useAppSelector } from '../../app/store/configureStore';
import { fetchProductsAsync, productSelectors } from './catalogSlice';
import ProductList from './ProductList';

export default function Catalog() {
  // get NORMALIZED products by using createEntityAdapter from redux-toolkit
  const products = useAppSelector(productSelectors.selectAll); // productSelectors is for state.catalog
  const { productsLoaded, status } = useAppSelector((state) => state.catalog);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // no need to re-fetch products everytime
    if (!productsLoaded) dispatch(fetchProductsAsync());
  }, [dispatch, productsLoaded]);

  if (status.includes('pending'))
    return <LoadingComponent message="Loading products..." />;

  return (
    <>
      <ProductList products={products} />
    </>
  );
}
