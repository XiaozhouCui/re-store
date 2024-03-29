import axios, { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import { history } from '../..';
import { PaginatedResponse } from '../models/pagination';
import { store } from '../store/configureStore';

const sleep = () => new Promise((resolve) => setTimeout(resolve, 500));

// all requests url will be pre-fixed with this base url
axios.defaults.baseURL = process.env.REACT_APP_API_URL;
// allow receive/set cookies in browser
axios.defaults.withCredentials = true;

const responseBody = (response: AxiosResponse) => response.data;

axios.interceptors.request.use((config) => {
  // check if redux state has the token
  const token = store.getState().account.user?.token;
  // if token already exists, add it to all requests' headers
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// interceptor
axios.interceptors.response.use(
  async (response) => {
    if (process.env.NODE_ENV === 'development') await sleep();
    const pagination = response.headers['pagination']; // 'pagination' must be lower case
    // if has pagination header, merge it with response body
    if (pagination) {
      response.data = new PaginatedResponse(
        response.data,
        JSON.parse(pagination)
      );
      // now respons.data will contain items array and metadata obj
      return response;
    }
    return response;
  },
  (error: AxiosError) => {
    const { data, status } = error.response!;
    switch (status) {
      case 400:
        // check if 400 is a form validation error
        if (data.errors) {
          const modelStateErrors: string[] = [];
          for (const key in data.errors) {
            if (data.errors[key]) {
              modelStateErrors.push(data.errors[key]);
            }
          }
          // will be caught in the component
          throw modelStateErrors.flat();
        }
        // for other 400 errors
        toast.error(data.title);
        break;
      case 401:
        toast.error(data.title);
        break;
      case 403:
        toast.error('You are not allowed to do that!');
        break;
      case 500:
        // pass data to ServerError component as props "history/location"
        history.push({
          pathname: '/server-error',
          state: { error: data },
        });
        break;
      default:
        break;
    }
    return Promise.reject(error.response);
  }
);

// centralise all requests
const requests = {
  get: (url: string, params?: URLSearchParams) =>
    axios.get(url, { params }).then(responseBody),
  post: (url: string, body: {}) => axios.post(url, body).then(responseBody),
  put: (url: string, body: {}) => axios.put(url, body).then(responseBody),
  delete: (url: string) => axios.delete(url).then(responseBody),
  postForm: (url: string, data: FormData) =>
    axios
      .post(url, data, {
        headers: { 'Content-type': 'multipart/form-data' },
      })
      .then(responseBody),
  putForm: (url: string, data: FormData) =>
    axios
      .put(url, data, {
        headers: { 'Content-type': 'multipart/form-data' },
      })
      .then(responseBody),
};

// helper function to convert ProductForm inputs to FormData object
const createFormData = (item: any) => {
  let formData = new FormData();
  for (const key in item) {
    formData.append(key, item[key]);
  }
  return formData;
};

// Requests for admin to create/update products
const Admin = {
  createProduct: (product: any) =>
    requests.postForm('products', createFormData(product)),
  updateProduct: (product: any) =>
    requests.putForm('products', createFormData(product)),
  deleteProduct: (id: number) => requests.delete(`products/${id}`),
};

// Requests for catalog controller
const Catalog = {
  // get('products', params) is GET http://localhost:5000/api/products?pageNumber=1&pageSize=6&orderBy=name
  list: (params: URLSearchParams) => requests.get('products', params),
  details: (id: number) => requests.get(`products/${id}`),
  // get filter options to be rendered
  fetchFilters: () => requests.get('products/filters'),
};

const TestErrors = {
  get400Error: () => requests.get('buggy/bad-request'),
  get401Error: () => requests.get('buggy/unauthorised'),
  get404Error: () => requests.get('buggy/not-found'),
  get500Error: () => requests.get('buggy/server-error'),
  getValidationError: () => requests.get('buggy/validation-error'),
};

// Requests for basket controller
const Basket = {
  // cookies "buyerId" included in req and res
  get: () => requests.get('basket'),
  addItem: (productId: number, quantity = 1) =>
    requests.post(`basket?productId=${productId}&quantity=${quantity}`, {}),
  removeItem: (productId: number, quantity = 1) =>
    requests.delete(`basket?productId=${productId}&quantity=${quantity}`),
};

// Requests for account controller
const Account = {
  login: (values: any) => requests.post('account/login', values),
  register: (values: any) => requests.post('account/register', values),
  currentUser: () => requests.get('account/currentUser'),
  fetchAddress: () => requests.get('account/savedAddress'),
};

const Orders = {
  list: () => requests.get('orders'),
  fetch: (id: number) => requests.get(`orders/${id}`),
  create: (values: any) => requests.post('orders', values),
};

const Payments = {
  createPaymentIntent: () => requests.post('payment', {}),
};

const agent = {
  Catalog,
  TestErrors,
  Basket,
  Account,
  Orders,
  Payments,
  Admin,
};

export default agent;
