import {
  TableContainer,
  Paper,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import { useStoreContext } from '../../app/context/StoreContex';
import { currencyFormat } from '../../app/util/util';

export default function BasketSummary() {
  const { basket } = useStoreContext();
  // if basket is null, return 0 as subtotal
  const subtotal = basket?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0;
  const deliveryFee = subtotal >= 100 * 100 ? 0 : 5 * 100;

  return (
    <>
      <TableContainer component={Paper} variant={'outlined'}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell colSpan={2}>Subtotal</TableCell>
              <TableCell align="right">{currencyFormat(subtotal)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2}>Delivery fee*</TableCell>
              <TableCell align="right">{currencyFormat(deliveryFee)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell align="right">{currencyFormat(subtotal + deliveryFee)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <span style={{ fontStyle: 'italic' }}>
                  *Orders over $100 qualify for free delivery
                </span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
