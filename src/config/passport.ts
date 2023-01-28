import { Strategy as AnonymousStrategy } from "passport-anonymous";
import { ExtractJwt, Strategy as JWTStrategy } from "passport-jwt";
import MagicLoginStrategy from "passport-magic-login";
import { Strategy as FacebookStrategy } from "passport-facebook";
import nodemailer from "nodemailer";

import env from "./env";
import prisma from "./prisma";

export const anonymous = new AnonymousStrategy();

export const jwt = new JWTStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: env.JWT_SECRET,
  },
  async (jwtPayload, done) => {
    const user = await prisma.user.findUnique({
      where: { id: jwtPayload.id },
    });
    return user ? done(null, user) : done(false);
  }
);

export const facebook = new FacebookStrategy(
  {
    clientID: env.FACEBOOK_APP_ID,
    clientSecret: env.FACEBOOK_APP_SECRET,
    callbackURL: `${env.SERVER_API_URL}/auth/facebook/callback`,
    profileFields: ["id", "displayName", "name", "emails", "photos"],
  },
  async (_accessToken, _refreshToken, profile, done) => {
    try {
      const userAccount = await prisma.account.findUnique({
        where: { id: profile.id },
        select: { userId: true },
      });

      if (userAccount) {
        const user = await prisma.user.findUnique({
          where: { id: userAccount.userId },
        });
        return done(null, user);
      } else {
        const user = await prisma.user.create({
          data: {
            account: {
              create: {
                provider: "facebook",
                providerAccountId: profile.id,
              },
            },
            profile: {
              create: {
                name: profile.displayName,
                bio: "",
                image: profile.photos ? profile.photos[0].value : "",
              },
            },
          },
        });
        return done(null, user);
      }
    } catch (error) {
      return done(error);
    }
  }
);

export const magic = new MagicLoginStrategy({
  secret: env.MAGIC_LINK_SECRET,
  callbackUrl: "/auth/magiclogin/callback",
  sendMagicLink: async (destination, href) => {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: env.EMAIL_SERVER_USER,
          pass: env.EMAIL_SERVER_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: env.EMAIL_FROM,
        to: destination,
        subject: "OdinBook",
        text: `Click this link to finish logging in: ${env.SERVER_API_URL}/${href}`,
      });
    } catch (error) {
      console.error({
        message: "Error sending email",
        error,
      });
    }
  },
  async verify(payload, done) {
    try {
      const user = await prisma.user.findFirst({
        where: { email: payload.destination },
      });
      if (user) {
        return done(null, user);
      } else {
        const user = await prisma.user.create({
          data: {
            email: payload.destination,
            profile: {
              create: {
                name: "",
                bio: "",
                image: "",
              },
            },
          },
        });
        return done(null, user);
      }
    } catch (error) {
      const typedError = error as Error;
      return done(typedError);
    }
  },
  jwtOptions: {
    expiresIn: "2 days",
  },
});
