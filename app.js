var scraper = require('./app/controllers/home.js');

module.exports = {
  syncScraper:scraper.syncScraper,
  asyncScraper:scraper.asyncScraper
};
