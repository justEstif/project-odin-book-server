import express, { urlencoded, json } from "express";
import passport from "passport";
import env from "./config/env";
import routes from "./routes";
import * as strategy from "./config/passport";

const app = express();
const port = env.PORT;

// body parser
app.use(json());
app.use(urlencoded({ extended: false }));

// passport
passport.use(strategy.magic);
passport.use(strategy.facebook);
passport.use(strategy.jwt);
passport.use(strategy.anonymous);
app.use(passport.initialize());

// routes
app.use("/", routes);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
