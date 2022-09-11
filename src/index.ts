'use strict';

require('dotenv').config();

const { castArray, map } = require('lodash/fp');
const { ForbiddenError, UnauthorizedError } = require('@strapi/utils').errors;

const { getService } = require("@strapi/plugin-users-permissions/server/utils");

const getAdvancedSettings = () => {
  return strapi.store({ type: 'plugin', name: 'users-permissions' }).get({ key: 'advanced' });
};

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    // strapi.container.get("auth").register("content-api", {
    //   name: "custom-jwt-verifier",
    //   authenticate: async function (ctx) {
    //     try {
    //       // get JWT from context and validate
    //       const { authorization } = ctx.request.header;
    //
    //       if (!authorization) {
    //         return { authenticated: false };
    //       }
    //
    //       const token = await getService('jwt').getToken(ctx);
    //
    //       if (token) {
    //         const {id} = token;
    //
    //         if (id === undefined) {
    //           return { authenticated: false };
    //         }
    //
    //         // fetch authenticated user
    //         const user = await getService('user').fetchAuthenticatedUser(id);
    //
    //         if (!user) {
    //           return { error: 'Invalid credentials' };
    //         }
    //
    //         const advancedSettings = await getAdvancedSettings();
    //
    //         if (advancedSettings.email_confirmation && !user.confirmed) {
    //           return { error: 'Invalid credentials' };
    //         }
    //
    //         if (user.blocked) {
    //           return { error: 'Invalid credentials' };
    //         }
    //
    //         ctx.state.user = user;
    //
    //         return {
    //           authenticated: true,
    //           credentials: user,
    //         };
    //       }
    //
    //       const publicPermissions = await strapi.query('plugin::users-permissions.permission').findMany({
    //         where: {
    //           role: { type: 'public' },
    //         },
    //       });
    //
    //       if (publicPermissions.length === 0) {
    //         return { authenticated: false };
    //       }
    //
    //       return {
    //         authenticated: true,
    //         credentials: null,
    //       };
    //     } catch (err) {
    //       return {authenticated: false};
    //     }
    //   },
    //   verify: async function (ctx) {
    //     console.log("Need to verify user credentials here.");
    //     const { credentials: user } = ctx.state.auth;
    //
    //     if (!ctx.config.scope) {
    //       if (!user) {
    //         // A non authenticated user cannot access routes that do not have a scope
    //         throw new UnauthorizedError();
    //       } else {
    //         // An authenticated user can access non scoped routes
    //         return;
    //       }
    //     }
    //
    //     let {allowedActions} = ctx.state.auth;
    //
    //     if (!allowedActions) {
    //       const permissions = await strapi.query('plugin::users-permissions.permission').findMany({
    //         where: { role: user ? user.role.id : { type: 'public' } },
    //       });
    //
    //       allowedActions = map('action', permissions);
    //       ctx.state.auth.allowedActions = allowedActions;
    //     }
    //
    //     const isAllowed = castArray(ctx.config.scope).every((scope) => allowedActions.includes(scope));
    //
    //     if (!isAllowed) {
    //       throw new ForbiddenError();
    //     }
    //   }
    // });
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    // const admin = require("firebase-admin");
    //
    // const firebaseConfig = {
    //   apiKey: process.env.FIREBASE_API_KEY,
    //   authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    //   projectId: process.env.FIREBASE_PROJECT_ID,
    //   storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    //   messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    //   appId: process.env.FIREBASE_APP_ID,
    //   measurementId: process.env.FIREBASE_MEASUREMENT_ID
    // };
    //
    // admin.initializeApp(firebaseConfig);
    // strapi.firebase = admin;
  },
};
