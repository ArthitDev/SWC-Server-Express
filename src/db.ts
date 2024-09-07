import { createConnection, Connection } from "typeorm";
import { Admin } from "./entities/Admin";
import { PasswordReset } from "./entities/password_resets";
import dotenv from "dotenv";
import { Trick } from "./entities/Trick";
import { DidYouKnow } from "./entities/Didyouknow";
import { Wound } from "./entities/Wound";
import { Article } from "./entities/Article";
import { ArticleClick } from "./entities/Article_Clicks";
import { WoundType } from "./entities/WoundType";

dotenv.config();

const MAX_RETRIES = 5;
const RETRY_DELAY = 10000; // 5 seconds

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const connectWithRetry = async (retries: number): Promise<Connection> => {
  try {
    const connection = await createConnection({
      type: "mysql",
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [
        Admin,
        PasswordReset,
        Trick,
        DidYouKnow,
        Wound,
        Article,
        ArticleClick,
        WoundType,
      ],
      synchronize: process.env.NODE_ENV === "development",
      connectTimeout: 20000,
      logging: false,
      timezone: "Z",
    });

    console.log("Database: Connected to database successfully.");
    return connection;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error connecting to database: ${error.message}`);
    } else {
      console.error("An unknown error occurred");
    }

    if (retries > 0) {
      console.log(
        `Retrying connection in ${RETRY_DELAY / 1000} seconds... (${
          MAX_RETRIES - retries + 1
        }/${MAX_RETRIES})`
      );
      await sleep(RETRY_DELAY);
      return connectWithRetry(retries - 1);
    } else {
      console.error("Max retries reached. Exiting...");
      process.exit(1);
    }
  }
};

export const connect = (): Promise<Connection> => {
  return connectWithRetry(MAX_RETRIES);
};
