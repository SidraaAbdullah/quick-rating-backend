const fetch = require('node-fetch');

exports.percentage = (last, first) => {
  return (last / first) * 100;
};

exports.sortBy = (sort_by, order) => {
  if (sort_by && order) {
    return { [sort_by]: order };
  }
  return { createdAt: -1 };
};

exports.bufferImageByUrl = async (url) => {
  const response = await fetch(url);
  const buffer = await response.buffer();
  return buffer;
};

exports.isEng = (lang) => {
  return lang.includes('en');
};

exports.isFrench = (lang) => {
  if (!lang) {
    return false;
  }
  return lang.includes('fr');
};
