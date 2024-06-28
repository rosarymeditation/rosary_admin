
const { default: axios } = require("axios");
const url ="http://localhost:8001/api/";
const axiosClient = axios.create({
  baseURL: url,
});
// export const headers = {
//   headers: {
//     Authorization: `Bearer ${JSON.parse(sessionStorage.getItem(JWT)) || ""}`,
//   },
// };
// export const header = async () => {
  


//   return {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   };
// };
// const getCategory = () => axiosClient.post("category/all", {});
// const getBanners = () => axiosClient.post("banner/all", {});
// const getPrivacyAndTerms = () => axiosClient.post("getPrivacyAndTerms", {});
// //createPrivacyAndTerms
// const getDelivery = () => axiosClient.post("locationParams", {});

// const getProductByCategoryName = (data) =>
//   axiosClient.post("findAllByCategoryName", data);
// const getPopuparProducts = () => axiosClient.post("product/popularForWeb", {});
// const postSignUp = (data) => axiosClient.post("sign-up", data);
// const postSignIn = (data) => axiosClient.post("sign-in", data);
// //sign-up-for-web
// const postSignUpWithPost = (data) => axiosClient.post("sign-up-for-web", data);
// //address/create

// const createRestaurant = async (data) => {
  
//   return await axiosClient.post("restaurant/create", data);
// };
const novenas = async () => {
   
  return await axiosClient.post("all_novenas", {});
};
const distressList = async () => {
   
  return await axiosClient.post("findAllAdmin", {});
};

const psalmList = async () => {
   
  return await axiosClient.post("psalm_findAllAdmin", {});
};
//distressList

const novenaById = async (data) => {
   
  return await axiosClient.post(`novena_by_id`, data);
};

const distressById = async (data) => {
   
  return await axiosClient.post(`distress_by_id`, data);
};

const psalmById = async (data) => {
   
  return await axiosClient.post(`psalm_by_id`, data);
};


const updatePrayer = async (formData) => {
   
  return await axiosClient.post(`prayer_update`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
//distress_update
const updateDistress = async (formData) => {
   
  return await axiosClient.post(`distress_update`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
const createPrayer = async (formData) => {
   
  return await axiosClient.post(`prayer`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

const createPsalm= async (formData) => {
   
  return await axiosClient.post(`psalm`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
const psalmUpdate = async (data) => {
   
  return await axiosClient.post(`psalm_update`, data);
};



const createDistress = async (formData) => {
  return await axiosClient.post(`distress`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// //
// const products = async (data) => {
   
//   return await axiosClient.post("product/all", {});
// };
//
// const findAddressByUser = async () => {
//   const user = JSON.parse(getCookieAsync(USER));
//   console.log(user._id);
//   return await axiosClient.post("address/byUser", { id: user._id });
// };

// const toggleAddress = async (id) => {
//   const user = JSON.parse(getCookieAsync(USER));
//   console.log(user._id);
//   return await axiosClient.post("address/toggle", { userId: user._id, id: id });
// };

// const deleteAddress = async (id) => {
//   const user = JSON.parse(getCookieAsync(USER));
//   console.log(user._id);
//   return await axiosClient.delete(`address/${id}`, {});
// };
// const createCheckoutSession = async (data) => {
//   const user = JSON.parse(getCookieAsync(USER));
//   data.id = user._id;
//   return await axiosClient.post("stripe-payment", data);
// };

// const createTransaction = async (data) => {
//   const user = JSON.parse(getCookieAsync(USER));
//   console;
//   data.id = user._id;
//   return await axiosClient.post("transaction-create-web", data);
// };

// const getSessionToken = async (id) => {
//   return await axiosClient.post("get-sessionToken", { id });
// };

// const userTransactions = async () => {
//   const user = JSON.parse(getCookieAsync(USER));

//   return await axiosClient.post("user-transactions-forWeb", { id: user._id });
// };
// const getSearch = async (data) => {
//   return await axiosClient.post("product/search-for-web", data);
// };

// // const findProductByName = async (data) => {
// //   return await axiosClient.post("product/findByName", data);
// // };
// const findProductByName = (data) =>
//   axiosClient.post("product/findByName", data);

// const getLocationParams = (data) => axiosClient.post("locationParams", {});
//locationParams

export default {
//   getCategory,
//   getBanners,
//   getPopuparProducts,
//   getProductByCategoryName,
//   postSignIn,
//   postSignUp,
//   getDelivery,
//   postSignUpWithPost,
//   findAddressByUser,
  novenas,
  novenaById,
  updatePrayer,
  createPrayer,
  createDistress,
  updateDistress,
  distressById,
  distressList,
  psalmUpdate,
  createPsalm,
  psalmById,
  psalmList
//   toggleAddress,
//   deleteAddress,
//   createCheckoutSession,
//   createTransaction,
//   getSessionToken,
//   userTransactions,
//   getSearch,
//   findProductByName,
//   getLocationParams,
//   getPrivacyAndTerms,
};
