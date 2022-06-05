import { LoadingButton } from '@mui/lab';
import {
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import NotFound from '../../app/errors/NotFound';
import LoadingComponent from '../../app/layout/LoadingComponent';
import { useAppDispatch, useAppSelector } from '../../app/store/configureStore';
import { currencyFormat } from '../../app/util/util';
import {
  addBasketItemAsync,
  removeBasketItemAsync,
} from '../basket/basketSlice';
import { fetchProductAsync, productSelectors } from './catalogSlice';

export default function ProductDetails() {
  const { basket, status } = useAppSelector((state) => state.basket);
  const { status: productStatus } = useAppSelector((state) => state.catalog);
  const dispatch = useAppDispatch();
  // grab product ID from url /catalog/:id
  const { id } = useParams<{ id: string }>();
  const product = useAppSelector((state) =>
    // productSelectors is the normalized products, and has all the useful methods
    productSelectors.selectById(state, id)
  );
  const [quantity, setQuantity] = useState<number>(0);
  // check if we have the current item in basket
  const item = basket?.items.find((i) => i.productId === product?.id);

  useEffect(() => {
    // if current item is in basket, store its quantity into state
    if (item) setQuantity(item.quantity);
    if (!product) dispatch(fetchProductAsync(parseInt(id)));
  }, [dispatch, id, item, product]);

  const handleInputChange = (event: any) => {
    // quantity should not be less than 0
    if (event.target.value >= 0) {
      setQuantity(parseInt(event.target.value));
    }
  };

  const handleUpdateCart = () => {
    // check if we are adding or removing item
    if (!item || quantity > item.quantity) {
      // check if adding a new item or increase number of existing item in basket
      const updatedQuantity = item ? quantity - item.quantity : quantity;
      dispatch(
        addBasketItemAsync({
          productId: product?.id!,
          quantity: updatedQuantity,
        })
      );
    } else {
      // removing item
      const updatedQuantity = item.quantity - quantity;
      dispatch(
        removeBasketItemAsync({
          productId: product?.id!,
          quantity: updatedQuantity,
        })
      );
    }
  };

  if (productStatus.includes('pending'))
    return <LoadingComponent message="Loading product..." />;

  if (!product) return <NotFound />;

  return (
    <Grid container spacing={6}>
      <Grid item xs={6}>
        <img
          src={product.pictureUrl}
          alt={product.name}
          style={{ width: '100%' }}
        />
      </Grid>
      <Grid item xs={6}>
        <Typography variant="h3">{product.name}</Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="h4" color="secondary">
          {currencyFormat(product.price)}
        </Typography>
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>{product.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>{product.description}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>{product.type}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Brand</TableCell>
                <TableCell>{product.brand}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Quantity in stock</TableCell>
                <TableCell>{product.quantityInStock}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              variant="outlined"
              type="number"
              label="Quantity in Cart"
              fullWidth
              value={quantity}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={6}>
            <LoadingButton
              loading={status.includes('pending')}
              disabled={
                item?.quantity === quantity || (!item && quantity === 0)
              }
              onClick={handleUpdateCart}
              sx={{ height: '55px' }}
              color="primary"
              size="large"
              variant="contained"
              fullWidth
            >
              {item ? 'Update quantity' : 'Add to Cart'}
            </LoadingButton>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
