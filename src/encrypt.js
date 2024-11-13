import crypto from 'crypto';

export default (text) => {
  const hash = crypto.createHmac('sha512', 'salt');
  hash.update(text);
  return hash.digest('hex');
};

// function crypt(text) {
//   const hash = crypto.createHmac('sha512', 'salt');
//   hash.update(text);
//   console.log(`password >>>> ${hash.digest('hex')}`)
//   return hash.digest('hex');
// };

// crypt('test');