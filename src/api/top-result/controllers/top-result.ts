'use strict';
/**
 * top-result controller
 */

import { factories } from '@strapi/strapi';
const moment = require('moment-timezone');

export default factories.createCoreController('api::top-result.top-result', ({ strapi }) => ({
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
    try {
      const { id, uniqueID } = ctx.request.body.data;

      const mentee = await strapi.db.query('api::member.member').findOne({
        select: [
          'id',
          'uniqueID',
          'type',
          'firstName',
          'lastName',
          'gender',
          'companyName',
          'jobTitle',
          'timeZone',
          'yearsOfExperience',
          'isOpenToMultiple',
          'country',
          'otherGenderPreference'
        ],
        where: {
          $and: [
            {type: 'mentee'},
            {isAvailable: true},
            {id: id},
            {uniqueID: uniqueID}
          ]
        },
        orderBy: { updatedAt: 'DESC' },
        populate: ['certifications', 'skills'],
      });

      console.log(mentee);

      const menteeTimezoneOffsetInHours = moment().tz(mentee.timeZone).hour() - new Date().getHours();
      const menteeCertifications = mentee.certifications.map(
        certification => certification.name
      );
      const menteeSkills = mentee.skills.map(
        skill => skill.name
      );

      const mentors = await strapi.db.query('api::member.member').findMany({
        select: [
          'id',
          'uniqueID',
          'type',
          'firstName',
          'lastName',
          'gender',
          'companyName',
          'jobTitle',
          'timeZone',
          'yearsOfExperience',
          'isOpenToMultiple',
          'country',
          'otherGenderPreference'
        ],
        where: {
          $and: [
            {type: 'mentor'},
            {isAvailable: true}
          ]
        },
        orderBy: { updatedAt: 'DESC' },
        populate: ['certifications', 'skills'],
      });

      const allScores = [];

      for (const mentor of mentors) {
        console.log(mentor);

        let mentorScore = 0;

        // Evaluate time zone score
        const mentorTimezoneOffsetInHours = moment().tz(mentor.timeZone).hour() - new Date().getHours();
        const timeZoneDifferenceScore = 24 - Math.abs(mentorTimezoneOffsetInHours - menteeTimezoneOffsetInHours);
        mentorScore = mentorScore + timeZoneDifferenceScore;

        // Evaluate years of experience score
        const yearsOfExperienceScore = parseInt(mentor.yearsOfExperience) - parseInt(mentee.yearsOfExperience);
        mentorScore = mentorScore + yearsOfExperienceScore;

        // Evaluate gender match score
        let genderMatchScore = 0;
        if (mentor.gender === mentee.otherGenderPreference || mentee.otherGenderPreference === 'any') {
          genderMatchScore = genderMatchScore + 1;
        }
        mentorScore = mentorScore + genderMatchScore;

        // Evaluate company score
        let companyMatchScore = 0;
        if ((mentee.companyName != null) && (mentor.companyName != null)) {
          if (mentee.companyName != mentor.companyName) {
            companyMatchScore = companyMatchScore + 1;
          }
        }
        mentorScore = mentorScore + companyMatchScore;

        // Evaluate certification match score
        let mentorCertificationMatchScore = 0;
        const mentorCertifications = mentor.certifications.map(
          certification => certification.name
        );
        // Determine score based on intersection of arrays
        mentorCertificationMatchScore = mentorCertificationMatchScore + mentorCertifications.filter(
          value => menteeCertifications.includes(value)
        ).length;
        mentorScore = mentorScore + mentorCertificationMatchScore;

        // Evaluate skill match score
        let mentorSkillMatchScore = 0;
        const mentorSkills = mentor.skills.map(
          skill => skill.name
        );
        // Determine score based on intersection of arrays
        mentorSkillMatchScore = mentorSkillMatchScore + mentorSkills.filter(
          value => menteeSkills.includes(value)
        ).length;
        mentorScore = mentorScore + mentorSkillMatchScore;

        allScores.push({
          mentorID: mentor.id,
          mentorUniqueID: mentor.uniqueID,
          mentorScore: mentorScore
        });
      };

      const topNMentors = (arr, n) => {
      let topNSize = n;
      if(arr.length < n){
        topNSize = arr.length;
      }
      return arr
        .slice()
        .sort((a, b) => {
          return b.mentorScore - a.mentorScore
        })
        .slice(0, topNSize);
      };

      const topScores = topNMentors(allScores, 5);

      console.log(topScores);


      ctx.request.body.data = {
        menteeID: mentee.id,
        menteeUniqueID: mentee.uniqueID,
        matches: topScores
      };

      const result = await super.create(ctx);

      return result;
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
