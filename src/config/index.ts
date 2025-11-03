import "dotenv/config";

export const config = {
  server: {
    host: process.env.HOST || "0.0.0.0",
    port: parseInt(process.env.PORT || "3000", 10),
  },
  database: {
    url: process.env.DATABASE_URL || "",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
    accessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY || "15m",
    refreshTokenExpiry: process.env.JWT_REFRESH_TOKEN_EXPIRY || "7d",
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10),
  },
  swagger: {
    enabled: process.env.SWAGGER_ENABLED !== "false",
  },
};
