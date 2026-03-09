const { default: axios } = require("axios");
//const url = "http://localhost:8001/api/";
const url = "https://www.server.catholicbond.com/api/";
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


// const axiosClient = axios.create({
//   baseURL: url,
// });

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
  },
});

// ─── FETCH USERS ──────────────────────────────────────────────────────────────

/**
 * Fetch paginated + filtered users from the timeline
 * @param {{ page?: number, limit?: number, age_min?: number, age_max?: number, countries?: string[], ethnicities?: string[], hasVerifiedPhoto?: boolean, hasSeenRecently?: boolean }} filters
 */
const getTimeline = async (filters = {}) => {
  return await axiosClient.post("all_users", filters);
};

const getBlockedUsersReport = async (filters = {}) => {
  return await axiosClient.post("getBlockedUsersReport", filters);
};
const getPendingVerifications = async (filters = {}) => {
  return await axiosClient.post("getPendingVerifications", filters);
};
//getPendingVerifications
/**
 * Fetch a single user's profile by ID
 * @param {string} userId
 */
const getUserById = async (userId) => {
  return await axiosClient.post("findOtherUserInfo", { userId }, getAuthHeaders());
};

// ─── SUSPEND USER ─────────────────────────────────────────────────────────────

/**
 * Toggle suspend / unsuspend a user
 * @param {string} userId
 */
const toggleAccountSuspension = async (userId) => {
  return await axiosClient.post("account_suspension", { userId });
};

// ─── VERIFY USER PHOTO ────────────────────────────────────────────────────────

/**
 * Approve or reject a user's photo verification + sends email
 * @param {string} email
 * @param {"Approved" | "Rejected"} status
 */
const updatePhotoVerification = async (email, status) => {
  return await axiosClient.post("photoVerifyEmail", { email, status });
};

export default {
  getTimeline,
  getUserById,
  toggleAccountSuspension,
  updatePhotoVerification,
  getPendingVerifications,
  getBlockedUsersReport
};