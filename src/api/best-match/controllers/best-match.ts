/**
 * best-match controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::best-match.best-match', ({ strapi }) => ({
  async find(ctx) {
    // ctx.query = { ...ctx.query, local: 'en' }

    const { data, meta } = await super.find(ctx);

    return { data, meta };
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const { query } = ctx;

    const entity = await strapi.service('api::best-match.best-match').findOne(id, query);
    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

    return this.transformResponse(sanitizedEntity);
  },

  async create(ctx) {
    ctx.request.body.data = {
      ...ctx.request.body.data,
    };

    const result = await super.create(ctx);

    return result
  },

  async update(ctx) {
    const response = await super.update(ctx);
    return response;
  },

  async delete(ctx) {

    const result = await super.delete(ctx);

    return result;
  }
}));
