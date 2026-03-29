const { default: axios } = require("axios");
//const url = "http://localhost:8001/api/";
const url = "https://softnergy.co.uk/api/";
const axiosClient = axios.create({
  baseURL: url,
});

const prayers = async (data) => {
  return await axiosClient.post("prayers_admin", data || {});
};

const prayerById = async (data) => {
  return await axiosClient.post("prayer_by_id", data);
};

const deletePrayer = async (id) => {
  return await axiosClient.delete(`prayer/${id}`);
};

const createPlan = async (formData) => {
  return await axiosClient.post("plan", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

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

const checkIfSaintExist = async (formData) => {
  return await axiosClient.post(`checkIfSaintExist`, formData);
};

const psalmList = async () => {
  return await axiosClient.post("psalm_findAllAdmin", {});
};

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
    headers: { "Content-Type": "multipart/form-data" },
  });
};

const getReflection = async (formData) => {
  return await axiosClient.post("getReflection", formData);
};

const postFeed = async (formData) => {
  const token = localStorage.getItem("authToken");
  return await axiosClient.post("feed", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
};

const postSaint = async (formData) => {
  const token = localStorage.getItem("authToken");
  return await axiosClient.post("saint", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
};

const updateFeed = async (id, formData) => {
  const token = localStorage.getItem("authToken");
  return await axiosClient.patch(`feed/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
};

const getFeed = async (id) => {
  return await axiosClient.post("feedById", { id: id });
};

const feeds = async () => {
  return await axiosClient.post("allFeedsAdmin", {});
};

const signIn = async (formData) => {
  return await axiosClient.post(`sign-in`, formData);
};

const updateDistress = async (formData) => {
  return await axiosClient.post(`distress_update`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

const createPrayer = async (formData) => {
  return await axiosClient.post(`prayer`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ─── Daily Reading ─────────────────────────────────────────────────────────────

const createDailyReading = async (formData) => {
  return await axiosClient.post(`create-dailyReading`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

const updateCreateDailyReading = async (formData) => {
  return await axiosClient.post(`update-create-reading`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// POST { id, contentEnglish, contentSpanish }
// Re-runs GPT formatting + reflection + audio for both EN and ES records
const updateDailyReading = async (data) => {
  return await axiosClient.post(`update-dailyReading`, data);
};

// POST { page?, limit? } — paginated list of all readings (Admin)
const getAllDailyReadings = async (data) => {
  return await axiosClient.post(`all-dailyReadings`, data || {});
};

// POST { date, page?, limit? } — search readings by exact date (Admin)
const searchDailyReadingByDate = async (data) => {
  return await axiosClient.post(`search-dailyReading-by-date`, data);
};

// POST { id } — fetch a single reading by MongoDB ID
const getDailyReadingById = async (data) => {
  return await axiosClient.post(`dailyReading-by-id`, data);
};

// DELETE /api/dailyReading/:id
const deleteDailyReading = async (id) => {
  return await axiosClient.delete(`dailyReading/${id}`);
};

// ─── Psalm ─────────────────────────────────────────────────────────────────────

const createPsalm = async (formData) => {
  return await axiosClient.post(`psalm`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

const psalmUpdate = async (formData) => {
  return await axiosClient.post(`psalm_update`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

const deletePsalm = async (id) => {
  return await axiosClient.delete(`psalm/${id}`);
};

// ─── Distress ──────────────────────────────────────────────────────────────────

const createDistress = async (formData) => {
  return await axiosClient.post(`distress`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
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
  deletePsalm,
  createPsalm,
  psalmById,
  psalmList,
  // Daily Reading
  createDailyReading,
  updateCreateDailyReading,
  updateDailyReading,
  getAllDailyReadings,
  searchDailyReadingByDate,
  getDailyReadingById,
  deleteDailyReading,
  checkReadingExist,
  // Auth
  signIn,
  // Feed
  postFeed,
  feeds,
  getFeed,
  updateFeed,
  // Misc
  createTestReading,
  getReflection,
  postSaint,
  checkIfSaintExist,
  prayers,
  prayerById,
  deletePrayer,
  createPlan,
};