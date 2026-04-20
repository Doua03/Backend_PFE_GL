const VisitedParking = require('../model/parkingvisited');
const mongoose = require('mongoose');

exports.visit = async (req, res) => {
  console.log(req.body);
  try {
    const { userId, parkingId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(parkingId)) {
      return res.status(400).json({ message: 'Invalid parkingId' });
    }
    const visit = new VisitedParking({ userId, parkingId });
    await visit.save();
    console.log(visit);
    res.status(200).json({ message: 'Visit tracked successfully' });
  } catch (error) {
    console.error('Error tracking visit:', error);
    res.status(500).json({ message: 'Failed to track visit', error: error.message });
  }
};

// Route to fetch latest visited places by user
exports.latestVisited = async (req, res) => {
  try {
    const userId = req.query.userId; // Assuming userId is passed as a query parameter

    // Ensure userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    // Convert userId to an ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Query the database for the latest visited places by the user
    const latestVisitedPlaces = await VisitedParking.aggregate([
      { $match: { userId: userObjectId } },
      { $sort: { visitTimestamp: -1 } }, // Sort by visit timestamp in descending order
      {
        $group: {
          _id: "$parkingId", // Group by parkingId
          latestVisit: { $first: "$$ROOT" } // Get the first document in each group (most recent visit)
        }
      },
      {
        $replaceRoot: { newRoot: "$latestVisit" }
      },
      {
        $lookup: {
          from: 'parkings', // Collection name in MongoDB
          localField: 'parkingId',
          foreignField: '_id',
          as: 'parkingDetails'
        }
      },
      {
        $unwind: "$parkingDetails"
      }
    ])
    .limit(3); // Limit the number of results to 3, adjust as needed

    res.status(200).json(latestVisitedPlaces);
  } catch (error) {
    console.error('Error fetching latest visited places:', error);
    res.status(500).json({ message: 'Failed to fetch latest visited places' });
  }
};

// Route to fetch latest visited places by user
exports.alllatestVisited = async (req, res) => {
  try {
    const userId = req.query.userId; // Assuming userId is passed as a query parameter

    // Ensure userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    // Convert userId to an ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Query the database for the latest visited places by the user
    const latestVisitedPlaces = await VisitedParking.aggregate([
      { $match: { userId: userObjectId } },
      { $sort: { visitTimestamp: -1 } }, // Sort by visit timestamp in descending order
      {
        $group: {
          _id: "$parkingId", // Group by parkingId
          latestVisit: { $first: "$$ROOT" } // Get the first document in each group (most recent visit)
        }
      },
      {
        $replaceRoot: { newRoot: "$latestVisit" }
      },
      {
        $lookup: {
          from: 'parkings', // Collection name in MongoDB
          localField: 'parkingId',
          foreignField: '_id',
          as: 'parkingDetails'
        }
      },
      {
        $unwind: "$parkingDetails"
      }
    ])


    res.status(200).json(latestVisitedPlaces);
  } catch (error) {
    console.error('Error fetching latest visited places:', error);
    res.status(500).json({ message: 'Failed to fetch latest visited places' });
  }
};