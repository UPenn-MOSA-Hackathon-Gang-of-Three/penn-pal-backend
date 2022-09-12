/**
 * top-result router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::top-result.top-result', {
  // creates an object with the basic CRUD configuration
  // ...
  config: {
    find: {
      // disables authorization requirement for the `find` route
      policies: [
        'admin::isAuthenticatedAdmin'
      ],
      // here you can also customize auth & middlewares
    },
  },
  // disables every action except `find` and `findOne`.
  only: ['find', 'findOne', 'create', 'update', 'delete'],
});
