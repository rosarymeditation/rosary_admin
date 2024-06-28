export const DECREASE = "decrease";
export const INCREASE = "increase";
export const CART = "cart";
export const USER = "user";
export const JWT = "jwt";
export const CAN_TRANSACT = "can_transact";
//user

export const setCacheCartListAsync = (data) => {
  return new Promise((resolve, reject) => {
    // Simulated asynchronous operation (replace with your actual asynchronous operation)
    setTimeout(() => {
      const cartList = setCookieAsync(CART, data);
      // if (cartList) {
      resolve(true);
    }, 500); // Simulating delay with setTimeout, replace with actual asynchronous operation
  });
};
export const setCookieAsync = (name, value) => {
  if (name != CART) {
    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(name, value);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  } else {
    return new Promise((resolve, reject) => {
      try {
        sessionStorage.setItem(name, value);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
};
export const getCookieAsync = (name) => {
  return name != CART
    ? localStorage.getItem(name)
    : sessionStorage.getItem(name);
};

export const getTokenAsync = (name) => {
  return new Promise((resolve, reject) => {
    try {
      const cookie = localStorage.getItem(name);
      resolve(cookie);
    } catch (error) {
      reject(error);
    }
  });
};
export const getDeliveryFee = (
  flatDeliveryFee,
  subTotal,
  deliveryFreeAmount
) => {
  if (parseFloat(subTotal) >= parseFloat(deliveryFreeAmount)) {
    return 0.0;
  } else {
    return flatDeliveryFee;
  }
};
export const removeCookieAsync = (name) => {
  if (name != CART) {
    return new Promise((resolve, reject) => {
      try {
        const cookie = localStorage.removeItem(name);
        resolve(cookie);
      } catch (error) {
        reject(error);
      }
    });
  } else {
    return new Promise((resolve, reject) => {
      try {
        const cookie = sessionStorage.removeItem(name);
        resolve(cookie);
      } catch (error) {
        reject(error);
      }
    });
  }
};
