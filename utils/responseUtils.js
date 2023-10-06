const createResponse = (data) => {
  return {
    data,
  };
};

const createError = (message) => {
  return {
    message,
  };
};

module.exports = {
  createResponse,
  createError,
};
