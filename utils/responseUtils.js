export const createResponse = (data) => {
  return {
    data,
  };
};

export const createError = (message) => {
  return {
    message,
  };
};
