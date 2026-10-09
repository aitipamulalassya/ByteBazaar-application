import axios from "axios";



export const productService = {
  async getProducts() {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
    return res.data;
  },

  async getProductById(id: number) {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
    return res.data;
  },

  async createProduct(formData: FormData) {
    const token = localStorage.getItem("token");

    try {
  const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/products`, formData, {
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
      `${import.meta.env.VITE_API_URL}/api/products/${id}`,
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
      `${import.meta.env.VITE_API_URL}/api/products/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
};