const JWT_CONFIG = {
  accessTokenSecret: process.env.JWT_SECRET || 'default-secret-change-me',
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-me',
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
};

module.exports = { JWT_CONFIG };
