import axios from "axios";

const API_URL = "http://localhost:5000/api/products";

export const productService = {
  async getProducts() {
    const res = await axios.get(API_URL);
    return res.data;
  },

  async getProductById(id: number) {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
  },

  async createProduct(formData: FormData) {
    const token = localStorage.getItem("token");

    try {
  const res = await axios.post(API_URL, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
} catch (err: any) {
  console.log("Axios Error:", err);
  console.log("Response:", err.response);
  console.log("Response Data:", err.response?.data);
  throw err;
}

  
  },

  async updateProduct(
    id: number,
    formData: FormData
  ) {
    const token = localStorage.getItem("token");

    const res = await axios.put(
      `${API_URL}/${id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  },

  async deleteProduct(id: number) {
    const token = localStorage.getItem("token");

    return axios.delete(
      `${API_URL}/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
};