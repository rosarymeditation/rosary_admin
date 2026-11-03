const { default: axios } = require("axios");
//const url = "https://www.server.igbocrush.com/api/";
const url = "https://www.server.igbocrush.com/api/";
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

// ─── GHOST MODE ───────────────────────────────────────────────────────────────

/**
 * Hide a user from Discover/timeline (ghost) or show them again.
 * Leave isGhost out to flip the current value.
 * Response: { userId, isGhost, message }
 * @param {string} userId
 * @param {boolean} [isGhost] true = hidden, false = visible
 */
const setGhostMode = async (userId, isGhost) => {
  return await axiosClient.post(
    "setGhostMode",
    isGhost === undefined ? { userId } : { userId, isGhost },
    getAuthHeaders()
  );
};

// ─── FREE DAILY MESSAGES ──────────────────────────────────────────────────────

/**
 * Turn a user's free daily messages on or off.
 * Off = they can only chat when matched, with a chat pass, or as premium.
 * Leave enabled out to flip the current value.
 * Response: { userId, freeMessagesEnabled, message }
 * @param {string} userId
 * @param {boolean} [enabled] true = free messages on, false = off
 */
const setFreeMessages = async (userId, enabled) => {
  return await axiosClient.post(
    "setFreeMessages",
    enabled === undefined ? { userId } : { userId, enabled },
    getAuthHeaders()
  );
};

// ─── CHAT HELPER (AI) USAGE ───────────────────────────────────────────────────

/**
 * Who has used Chat Helper (✨ AI message ideas) and how often.
 * Response: { summary: { users, taps, tokensSpent, usedToday },
 *             data: [{ fullname, email, total, tokensSpent, firstUsedAt, lastUsedAt, … }],
 *             page, limit, hasMore }
 * @param {{ page?: number, limit?: number }} params
 */
const getAiUsageStats = async (params = {}) => {
  return await axiosClient.post("aiSuggestStats", params);
};

export default {
  getTimeline,
  getUserById,
  toggleAccountSuspension,
  updatePhotoVerification,
  getPendingVerifications,
  getBlockedUsersReport,
  setGhostMode,
  setFreeMessages,
  getAiUsageStats,
};