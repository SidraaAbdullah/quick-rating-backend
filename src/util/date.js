const moment = require('moment');

exports.isToday = (momentDate) => {
  const currentDate = moment();
  return momentDate.isSame(currentDate.clone().startOf('day'), 'd');
};
