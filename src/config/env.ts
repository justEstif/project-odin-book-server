import { object, string } from "zod";
import * as dotenv from "dotenv";

dotenv.config();

const envSchema = object({
  PORT: string().transform(Number),
  DATABASE_URL: string(),
  // auth
  MAGIC_LINK_SECRET: string(),

  // facebook
  FACEBOOK_APP_ID: string(),
  FACEBOOK_APP_SECRET: string(),
  SERVER_API_URL: string(),
  JWT_SECRET: string(),

  // email provider
  EMAIL_SERVER_USER: string(),
  EMAIL_SERVER_PASSWORD: string(),
  EMAIL_FROM: string(),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error(JSON.stringify(env.error.format(), null, 4));
  process.exit(1);
}

export default env.data;
