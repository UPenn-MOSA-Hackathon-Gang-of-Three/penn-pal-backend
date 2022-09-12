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

    const menteeTimezoneOffsetInHours = moment().tz(mentee.data.timeZone).hour() - new Date().getHours();
    const menteeCertifications = mentee.data.certifications.data.map(
      certification => certification.attributes.name
    );
    const menteeSkills = mentee.data.skills.data.map(
      skill => skill.attributes.name
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

    let topScores = null;
    let topMatches = null;

    try {
      if (mentors.length > 0) {
        const allScores = mentors.map(mentor => {
          // The highest score is the one most desirable
          let mentorScore = 0;

          // Evaluate time zone score
          const mentorTimezoneOffsetInHours = moment().tz(mentor.data.timeZone).hour() - new Date().getHours();
          const timeZoneDifferenceScore = 24 - Math.abs(mentorTimezoneOffsetInHours - menteeTimezoneOffsetInHours);
          mentorScore = mentorScore + timeZoneDifferenceScore;

          // Evaluate years of experience score
          const yearsOfExperienceScore = parseInt(mentor.data.yearsOfExperience) - parseInt(mentee.yearsOfExperience);
          mentorScore = mentorScore + yearsOfExperienceScore;

          // Evaluate gender match score
          let genderMatchScore = 0;
          if (mentor.gender === mentee.data.otherGenderPreference || mentee.data.otherGenderPreference === 'any') {
            genderMatchScore = genderMatchScore + 1;
          }
          mentorScore = mentorScore + genderMatchScore;

          // Evaluate company score
          let companyMatchScore = 0;
          if ((mentee.data.companyName != null) && (mentor.data.companyName != null)) {
            if (mentee.data.companyName != mentor.data.companyName) {
              companyMatchScore = companyMatchScore + 1;
            }
          }
          mentorScore = mentorScore + companyMatchScore;

          // Evaluate certification match score
          let mentorCertificationMatchScore = 0;
          const mentorCertifications = mentor.data.certifications.data.map(
            certification => certification.attributes.name
          );
          // Determine score based on intersection of arrays
          mentorCertificationMatchScore = mentorCertificationMatchScore + mentorCertifications.filter(
            value => menteeCertifications.includes(value)
          ).length;
          mentorScore = mentorScore + mentorCertificationMatchScore;

          // Evaluate skill match score
          let mentorSkillMatchScore = 0;
          const mentorSkills = mentor.data.skills.data.map(
            skill => skill.attributes.name
          );
          // Determine score based on intersection of arrays
          mentorSkillMatchScore = mentorSkillMatchScore + mentorSkills.filter(
            value => menteeSkills.includes(value)
          ).length;
          mentorScore = mentorScore + mentorSkillMatchScore;

          return {
            mentorID: mentor.data.id,
            mentorUniqueID: mentor.data.uniqueID,
            mentorScore: mentorScore};
        });

        // allScores
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
        topScores = topNMentors(allScores, 5);

        if (topScores.length > 0) {
          topMatches = {
            ...topScores,
            menteeID: mentee.data.id,
            menteeUniqueID: mentee.data.uniqueID
          }

          ctx.request.body.data = {
            ...topMatches
          };
          const result = await super.create(ctx);
          return result;
        } else {
          return;
        };
      } else {
        return;
      };
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
