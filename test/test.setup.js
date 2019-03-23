// Ref : https://stackoverflow.com/questions/42677387/jest-returns-network-error-when-doing-an-authenticated-request-with-axios

module.exports = () => {
  global.XMLHttpRequest = undefined;
};
