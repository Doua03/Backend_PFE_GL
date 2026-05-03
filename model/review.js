const mongoose = require('mongoose');
const db = require('../config/db');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
  content: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: { type: Date, default: Date.now }
});

// OCL Constraint for Emna: Verified Reviewer Integrity
// Context: Review
// Invariant: User must be a simple customer and must have completed at least one parking session before reviewing.
feedbackSchema.pre('validate', async function(next) {
  try {
    const Ticket = db.model('Ticket');
    const User = db.model('User');

    const author = await User.findById(this.userId);
    if (!author) {
      return next(new Error("OCL Violation (verifiedReviewerIntegrity): Auteur non trouvé."));
    }
    
    if (author.session !== 'User') {
      return next(new Error("OCL Violation (verifiedReviewerIntegrity): Seuls les clients peuvent laisser des avis."));
    }

    const hasCompletedTicket = await Ticket.exists({
      userId: this.userId.toString(),
      departureDate: { $lt: new Date() }
    });

    if (!hasCompletedTicket) {
      return next(new Error("OCL Violation (verifiedReviewerIntegrity): Vous devez avoir terminé au moins une session de parking pour laisser un avis."));
    }

    next();
  } catch (error) {
    next(error);
  }
});

const feedback = db.model('feedback', feedbackSchema, 'feedback' );

module.exports = feedback;
