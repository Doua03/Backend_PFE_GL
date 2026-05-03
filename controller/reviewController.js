const Feedback = require('../model/review');
const config = require('../config/config');


exports.postfeedback = async (req, res) => {
  const { content, userId } = req.body;
  
  const feedback = new Feedback({
    content,
    userId
  });

  try {
    await feedback.save();
    res.status(201).json({
      message: 'Avis publié avec succès',
      data: feedback
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        status: 'OCL Violation',
        message: error.message 
      });
    }
    res.status(500).json({ message: 'Erreur interne du serveur', error: error.message });
  }
};

exports.getfeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).send(feedback);
  } catch (error) {
    res.status(400).send(error);
  }
};