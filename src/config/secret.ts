const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  SERVER_PORT,
  JWT_SECRET,
} = process.env;

export const dbOptions = {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
};

export const JwtSecret = JWT_SECRET;
export const serverPort = Number(SERVER_PORT);
