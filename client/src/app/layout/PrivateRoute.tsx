import { ComponentType } from 'react';
import { Redirect, Route, RouteComponentProps, RouteProps } from 'react-router';
import { useAppSelector } from '../store/configureStore';

interface Props extends RouteProps {
  component: ComponentType<RouteComponentProps<any>> | ComponentType<any>;
}

// use this PrivateRoute for pretected pages (e.g. CheckoutPage)
const PrivateRoute = ({ component: Component, ...rest }: Props) => {
  const { user } = useAppSelector((state) => state.account);
  return (
    <Route
      {...rest}
      render={(props) =>
        user ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
};

export default PrivateRoute;
