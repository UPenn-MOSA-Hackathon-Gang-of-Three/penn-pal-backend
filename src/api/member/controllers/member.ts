"use strict";

/**
 * member controller
 */

import { factories } from '@strapi/strapi';
import { nanoid } from 'nanoid';

export default factories.createCoreController('api::member.member', ({ strapi }) => ({
  async find(ctx) {
    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const { query } = ctx;

    const entity = await strapi.service('api::certification.certification').findOne(id, query);
    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

    return this.transformResponse(sanitizedEntity);
  },

  async create(ctx) {
    try {
      const {
        firstName,
        lastName,
        type,
        gender,
        jobTitle,
        timeZone,
        yearsOfExperience,
        isAvailable,
        phoneNumber,
        companyName,
        country,
        isOpenToMultiple,
        otherGenderPreference,
        emails,
        certifications,
        skills
      } = ctx.request.body.data;

      let emailIDs = [];
      let certificationIDs = [];
      let skillIDs = [];

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

      for (const certification of certifications) {
        const existingCertification = await strapi.db.query('api::certification.certification').findOne({
          select: [
            'id',
            'name'
          ],
          where: {
            name: certification
          },
        });
        console.log(existingCertification);
        if (existingCertification === null) {
          const newCertification = await strapi.entityService.create('api::certification.certification', {
            data: {
              name: certification
            },
          });
          console.log(newCertification);
          certificationIDs.push(newCertification.id);
        } else {
          certificationIDs.push(existingCertification.id);
        }
      };

      for (const skill of skills) {
        const existingSkill = await strapi.db.query('api::skill.skill').findOne({
          select: [
            'id',
            'name'
          ],
          where: {
            name: skill
          },
        });
        console.log(existingSkill);
        if (existingSkill === null) {
          const newSkill = await strapi.entityService.create('api::skill.skill', {
            data: {
              name: skill
            },
          });
          skillIDs.push(newSkill.id);
          console.log(newSkill);
        } else {
          skillIDs.push(existingSkill.id);
        }
      };

      ctx.request.body.data = {
        firstName: firstName,
        lastName: lastName,
        type: type,
        gender: gender,
        jobTitle: jobTitle,
        timeZone: timeZone,
        yearsOfExperience: yearsOfExperience,
        isAvailable: isAvailable,
        phoneNumber: phoneNumber,
        companyName: companyName,
        country: country,
        isOpenToMultiple: isOpenToMultiple,
        otherGenderPreference: otherGenderPreference,
        uniqueID: nanoid(),
        emails: emailIDs,
        certifications: certificationIDs,
        skills: skillIDs
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
