// netlify/functions/sites.js
exports.handler = async (event, context) => {
  // Your API logic here
  return {
    statusCode: 200,
    body: JSON.stringify({ data: "your data" })
  };
};  