/**
 * event controller
 */

import { factories } from '@strapi/strapi'
import {nanoid} from "nanoid";

export default factories.createCoreController('api::event.event', ({ strapi }) => ({
  async find(ctx) {
    // ctx.query = { ...ctx.query, local: 'en' }

    const { data, meta } = await super.find(ctx);

    return { data, meta };
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const { query } = ctx;

    const entity = await strapi.service('api::event.event').findOne(id, query);
    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

    return this.transformResponse(sanitizedEntity);
  },

  async create(ctx) {
    try {
      const { emails } = ctx.request.body.data;

      let emailIDs = [];

      for (const email of emails) {
        const existingEmail = await strapi.db.query('api::email.email').findOne({
          select: [
            'id',
            'value'
          ],
          where: {
            value: email
          }
        });
        if (existingEmail === null) {
          const newEmail = await strapi.entityService.create('api::email.email', {
            data: {
              value: email,
            },
          });
          emailIDs.push(newEmail.id);
        } else {
          emailIDs.push(existingEmail.id);
        };
      };

      ctx.request.body.data = {
        ...ctx.request.body.data,
        uniqueID: nanoid(),
        emails: emailIDs,
      };

      const response = await super.create(ctx);
      return response;
    } catch (err) {
      return err;
    }
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
