import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";

// all requests url will be pre-fixed with this base url
axios.defaults.baseURL = "http://localhost:5000/api/";

const responseBody = (response: AxiosResponse) => response.data;

// interceptor
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    const { data, status } = error.response!;
    switch (status) {
      case 400:
        toast.error(data.title);
        break;
      case 401:
        toast.error(data.title);
        break;
      case 500:
        toast.error(data.title);
        break;
      default:
        break;
    }
    return Promise.reject(error.response);
  }
);

// centralise all requests
const requests = {
  get: (url: string) => axios.get(url).then(responseBody),
  post: (url: string, body: {}) => axios.post(url, body).then(responseBody),
  put: (url: string, body: {}) => axios.put(url, body).then(responseBody),
  delete: (url: string) => axios.delete(url).then(responseBody),
};

const Catalog = {
  // get('products') is GET http://localhost:5000/api/products
  list: () => requests.get("products"),
  details: (id: number) => requests.get(`products/${id}`),
};

const TestErrors = {
  get400Error: () => requests.get("buggy/bad-request"),
  get401Error: () => requests.get("buggy/unauthorised"),
  get404Error: () => requests.get("buggy/not-found"),
  get500Error: () => requests.get("buggy/server-error"),
  getValidationError: () => requests.get("buggy/validation-error"),
};

const agent = {
  Catalog,
  TestErrors,
};

export default agent;
