const BaseRepository = require('./base.repository');
const Review = require('../model/review');

class ReviewRepository extends BaseRepository {
  constructor() {
    super(Review);
  }
}

module.exports = new ReviewRepository();
