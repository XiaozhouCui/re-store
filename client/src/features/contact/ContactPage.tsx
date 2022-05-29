import { Button, ButtonGroup, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { CounterState, DECREMENT_COUNTER, INCREMENT_COUNTER } from './counterReducer';

export default function ContactPage() {
  const dispatch = useDispatch();
  const { data, title } = useSelector((state: CounterState) => state);
  return (
    <>
      <Typography variant="h2">{title}</Typography>
      <Typography variant="h5">Data is: {data}</Typography>
      <ButtonGroup>
        <Button
          variant="contained"
          color="error"
          onClick={() => dispatch({ type: DECREMENT_COUNTER })}
        >
          Decrement
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => dispatch({ type: INCREMENT_COUNTER })}
        >
          Increment
        </Button>
      </ButtonGroup>
    </>
  );
}
