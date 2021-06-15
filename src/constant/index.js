const { isFrench } = require('../util');

/* eslint-disable no-undef */
module.exports = {
  USER_STATUSES: {
    STATUS_REGISTERED: 'Registered',
  },
  CONTENT_TYPE_APPLICATION_JSON: 'application/json',
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || 'AIzaSyBAPptEr4vCABmo5yyiEeoF2cT8mx5Wimc',
  EMAIL_TO: process.env.EMAIL_TO || 'salmansidd991@gmail.com',
  EMAIL_FROM: 'developers.quickrating@gmail.com',
  CACHE_TIME: process.env.CACHE_TIME || 3600 * 3,
  WAITER_STATUSES: ['archive', 'active', 'pending', 'reject'],
  WAITER_PENDING: 'pending',
  WAITER_ACTIVE: 'active',
  WAITER_ARCHIVED: 'archive',
  WAITER_REJECTED: 'reject',
  ENVIRONMENT: process.env.NODE_ENV || 'local',
  ANDROID: 'android',
  APPLE: 'apple',
  WAITER: 'waiter',
  USER: 'user',
  RESTAURANT: 'restaurant',
  CAN_VOTE_ALWAYS: process.env.CAN_VOTE_ALWAYS || true,
  PICTURES: process.env.PICTURES || false,
  WAITER_TIME: ['half', 'full'],
  USER_TYPE: ['manager', 'customer'],
  STATUS_UNAUTHORIZED: '401',
  STATUS_UNAUTHORIZED_DESC: 'You are not authorized to access this protected resource',
  TEMPLATE_USER_TIP: 'd-3891aadffdd94706b1117ded3e664589',
  TEMPLATE_USER_TIP_FRA: 'd-afc1aa37580247c8a11cc9bf46b5dd45',
  TEMPLATE_WAITER_APPROVAL: 'd-9116260873eb4316a92b2d783f7a5347',
  TEMPLATE_WAITER_APPROVAL_FRA: 'd-ee2677c023564eeca03168ed6f0318d6',
  TEMPLATE_WAITER_REJECTED: 'd-cd20784d7f624603b8310e9a9ecaa89a',
  TEMPLATE_WAITER_REJECTED_FRA: 'd-4330c4f0784a4c23a8bd1b3dc2b1a416',
  TEMPLATE_WAITER_JOB_FORM_FILLED: 'd-bbb99ee44eba41ec95f0b99c8c33421f',
  TEMPLATE_WAITER_JOB_FORM_FILLED_FRA: 'd-dfa42a99d26340ffba7c0c47a528954b',
  TEMPLATE_WAITER_PENDING_APPROVAL: 'd-78ba2ec66d8a42d9a932d01739618033',
  TEMPLATE_WAITER_PENDING_APPROVAL_FRA: 'd-04279de7c13e4256b6f70f364b656a00',

  STAFFS: ['kitchen', 'floor'],
  JWT_SECRET_LOGIN: 'supersecret',
  APPROVAL_NOTIFICATION: (user, restaurant) => {
    if (isFrench(user.lang)) {
      return `Vous faites maintenant partie de l'équipe de ${restaurant}, consulte ton profile pour bénéficier de tout les bénéfices. `;
    } else {
      return `You are now part of the team of ${restaurant}, check your profile to enjoy all benefits.`;
    }
  },
  REJECTION_NOTIFICATION: (user, restaurant) => {
    if (isFrench(user.lang)) {
      return `Votre profil au sein de l'équipe ${restaurant} n'a pas été accepté.`;
    } else {
      return `Your profile within the ${restaurant} team has not been accepted.`;
    }
  },
  WAITER_JOB_SHIFTS: ['morning', 'mid-day', 'evening'],
};
