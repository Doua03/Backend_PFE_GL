const Feedback = require('../model/review');
const config = require('../config/config');


exports.postfeedback = async (req, res) => {
  const feedback = new Feedback({
    content: req.body.content
  });

  try {
    await feedback.save();
    res.status(201).send(feedback);
  } catch (error) {
    res.status(400).send(error);
  }
};

// API endpoint to get all feedback
exports.getfeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).send(feedback);
  } catch (error) {
    res.status(400).send(error);
  }
};