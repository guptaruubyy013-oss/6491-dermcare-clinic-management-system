import axios from "axios";

const API = axios.create({
  baseURL: "https://6491-dermcare-clinic-management-sys.vercel.app/api",
});

API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("dermcare_token");

    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
  },
  (error) => Promise.reject(error)
);

export default API;