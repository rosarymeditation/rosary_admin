const { default: axios } = require("axios");
//const url = "http://localhost:8001/api/";
const url = "https://softnergy.co.uk/api/";
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
const createTestReading = async (formData) => {
  return await axiosClient.post(`create-reading`, formData);
};
const checkReadingExist = async (formData) => {
  return await axiosClient.post(`checkIfExist`, formData);
};
//checkIfExist
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
      "Content-Type": "multipart/form-data",
    },
  });
};
//getReflection

const getReflection = async (formData) => {
  // Retrieve the token or other data from localStorage
  const token = localStorage.getItem("authToken"); // Replace 'yourTokenKey' with the key you saved the token under

  // Make the POST request with the token added to the headers
  return await axiosClient.post("getReflection", formData);
};
const postFeed = async (formData) => {
  // Retrieve the token or other data from localStorage
  const token = localStorage.getItem("authToken"); // Replace 'yourTokenKey' with the key you saved the token under

  // Make the POST request with the token added to the headers
  return await axiosClient.post("feed", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`, // Pass the token as Authorization header
    },
  });
};

const updateFeed = async (id, formData) => {
  // Retrieve the token or other data from localStorage
  const token = localStorage.getItem("authToken"); // Replace 'yourTokenKey' with the key you saved the token under

  // Make the POST request with the token added to the headers
  return await axiosClient.patch(`feed/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`, // Pass the token as Authorization header
    },
  });
};
//updateFeed
const getFeed = async (id) => {
  return await axiosClient.post("feedById", { id: id });
};
//getFeed
const feeds = async (formData) => {
  // Retrieve the token or other data from localStorage
  const token = localStorage.getItem("authToken"); // Replace 'yourTokenKey' with the key you saved the token under

  // Make the POST request with the token added to the headers
  return await axiosClient.post("allFeedsAdmin", {});
};
//sign-in
const signIn = async (formData) => {
  return await axiosClient.post(`sign-in`, formData);
};
const updateDistress = async (formData) => {
  return await axiosClient.post(`distress_update`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
const createPrayer = async (formData) => {
  return await axiosClient.post(`prayer`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

const createDailyReading = async (formData) => {
  return await axiosClient.post(`create-dailyReading`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

const updateCreateDailyReading = async (formData) => {
  return await axiosClient.post(`update-create-reading`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
//update-create-reading
const createPsalm = async (formData) => {
  return await axiosClient.post(`psalm`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
const psalmUpdate = async (data) => {
  return await axiosClient.post(`psalm_update`, data);
};

const createDistress = async (formData) => {
  return await axiosClient.post(`distress`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export default {
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
  psalmList,
  createDailyReading,
  signIn,
  postFeed,
  feeds,
  getFeed,
  updateFeed,
  createTestReading,
  checkReadingExist,
  getReflection,
  updateCreateDailyReading
};
