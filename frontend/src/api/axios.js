import axios from "axios";

const API = axios.create({
  // baseURL: "http://localhost:5000/api",

   baseURL: "https://mini-crm-black-psi.vercel.app/api",
});

export default API;