const reviewRepository = require('../repositories/review.repository');

const config = require('../config/config');


exports.postfeedback = async (req, res) => {
  try {
    const feedback = await reviewRepository.create({
      content: req.body.content
    });
    res.status(201).send(feedback);

  } catch (error) {
    res.status(400).send(error);
  }
};

// API endpoint to get all feedback
exports.getfeedback = async (req, res) => {
  try {
    const feedback = await reviewRepository.findAll(); // Assuming findAll handles sorting or we add it

    res.status(200).send(feedback);
  } catch (error) {
    res.status(400).send(error);
  }
};