export const mapResponse = (statusCode, body) => {
  return {
    statusCode,
    body: JSON.stringify(body),
    // Setting default response security headers
    headers: {
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    },
  };
};
