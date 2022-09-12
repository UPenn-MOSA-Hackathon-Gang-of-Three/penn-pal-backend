/**
 * email controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::email.email', ({ strapi }) => ({
  async find(ctx) {
    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const { query } = ctx;

    const entity = await strapi.service('api::email.email').findOne(id, query);
    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

    return this.transformResponse(sanitizedEntity);
  },

  async create(ctx) {
    try {
      const response = await super.create(ctx);
      return response;
    } catch (err) {
      return err;
    };
  },

  async delete(ctx) {

    const result = await super.delete(ctx);

    return result;
  }
}));
