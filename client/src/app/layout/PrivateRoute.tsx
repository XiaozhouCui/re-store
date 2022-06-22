import { ComponentType } from 'react';
import { Redirect, Route, RouteComponentProps, RouteProps } from 'react-router';
import { toast } from 'react-toastify';
import { useAppSelector } from '../store/configureStore';

interface Props extends RouteProps {
  component: ComponentType<RouteComponentProps<any>> | ComponentType<any>;
  roles?: string[];
}

// use this PrivateRoute for pretected pages (e.g. CheckoutPage, admin Inventory page)
const PrivateRoute = ({ component: Component, roles, ...rest }: Props) => {
  const { user } = useAppSelector((state) => state.account);
  return (
    <Route
      {...rest}
      render={(props) => {
        // check if authenticated, if not then redirect to login page
        if (!user) {
          return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />;
        }
        // compared the private route roles and the user's roles
        if (roles && !roles?.some((r) => user.roles?.includes(r))) {
          // if not authorized, redirect to catalog page
          toast.error('Not authorised to access this area');
          return <Redirect to={{ pathname: '/catalog' }} />;
        }
        // if authorised, show the protected content along with props
        return <Component {...props} />;
      }}
    />
  );
};

export default PrivateRoute;
