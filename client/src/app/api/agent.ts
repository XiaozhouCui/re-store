import axios, { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import { history } from '../..';
import { PaginatedResponse } from '../models/pagination';

const sleep = () => new Promise((resolve) => setTimeout(resolve, 500));

// all requests url will be pre-fixed with this base url
axios.defaults.baseURL = 'http://localhost:5000/api/';
// allow receive/set cookies in browser
axios.defaults.withCredentials = true;

const responseBody = (response: AxiosResponse) => response.data;

// interceptor
axios.interceptors.response.use(
  async (response) => {
    await sleep();
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
};

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

const Basket = {
  // cookies "buyerId" included in req and res
  get: () => requests.get('basket'),
  addItem: (productId: number, quantity = 1) =>
    requests.post(`basket?productId=${productId}&quantity=${quantity}`, {}),
  removeItem: (productId: number, quantity = 1) =>
    requests.delete(`basket?productId=${productId}&quantity=${quantity}`),
};

const agent = {
  Catalog,
  TestErrors,
  Basket,
};

export default agent;
