import {
  Container,
  createTheme,
  CssBaseline,
  ThemeProvider,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import AboutPage from '../../features/about/AboutPage';
import Catalog from '../../features/catalog/Catalog';
import ProductDetails from '../../features/catalog/ProductDetails';
import ContactPage from '../../features/contact/ContactPage';
import HomePage from '../../features/home/HomePage';
import Header from './Header';
import 'react-toastify/dist/ReactToastify.css';
import ServerError from '../errors/ServerError';
import NotFound from '../errors/NotFound';
import BasketPage from '../../features/basket/BasketPage';
import LoadingComponent from './LoadingComponent';
import { useAppDispatch } from '../store/configureStore';
import { fetchBasketAsync } from '../../features/basket/basketSlice';
import Login from '../../features/account/Login';
import Register from '../../features/account/Register';
import { fetchCurrentUser } from '../../features/account/accountSlice';
import PrivateRoute from './PrivateRoute';
import Orders from '../../features/orders/Orders';
import CheckoutWrapper from '../../features/checkout/CheckoutWrapper';
import Inventory from '../../features/admin/Inventory';
// import { useStoreContext } from '../context/StoreContex';

function App() {
  // const { setBasket } = useStoreContext();
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(true);

  // useCallback to prevent re-render in uesEffect
  const initApp = useCallback(async () => {
    try {
      await dispatch(fetchCurrentUser());
      await dispatch(fetchBasketAsync());
    } catch (error) {
      console.log(error);
    }
  }, [dispatch]);

  useEffect(() => {
    initApp().then(() => setLoading(false));
  }, [initApp]);

  const [darkMode, setDarkMode] = useState(false);
  const paletteType = darkMode ? 'dark' : 'light';
  // set Dark Mode using MUI theme
  const theme = createTheme({
    palette: {
      mode: paletteType,
      background: {
        default: paletteType === 'light' ? '#eaeaea' : '#121212',
      },
    },
  });

  const handleThemeChange = () => {
    setDarkMode(!darkMode);
  };

  if (loading) return <LoadingComponent message="Initialising app..." />;

  return (
    <ThemeProvider theme={theme}>
      <ToastContainer position="bottom-right" theme="colored" hideProgressBar />
      <CssBaseline />
      <Header darkMode={darkMode} handleThemeChange={handleThemeChange} />
      <Route exact path="/" component={HomePage} />
      <Route
        path={'/(.+)'} // regex for '/any-path'
        render={() => (
          <Container  sx={{ mt: 4 }}>
            <Switch>
              <Route exact path="/catalog" component={Catalog} />
              <Route path="/catalog/:id" component={ProductDetails} />
              <Route path="/about" component={AboutPage} />
              <Route path="/contact" component={ContactPage} />
              <Route path="/basket" component={BasketPage} />
              <PrivateRoute path="/checkout" component={CheckoutWrapper} />
              <PrivateRoute path="/orders" component={Orders} />
              <PrivateRoute roles={["Admin"]} path="/inventory" component={Inventory} />
              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />
              <Route path="/server-error" component={ServerError} />
              <Route component={NotFound} />
            </Switch>
          </Container>
        )}
      />
    </ThemeProvider>
  );
}

export default App;
