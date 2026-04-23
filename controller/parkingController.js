const Parking = require('../model/parking.model');
const supervisorModel = require('../model/supervisor');
const adminModel = require('../model/admin');
const SupervisorService = require("../services/supervisor.services");
const ParkingFactory = require('../services/parking.factory');

exports.uploadImage = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  const imageUrl = req.file.path;
  res.status(200).json({ imageUrl });
};

exports.addParkingData = async (req, res) => {
  try {
    const { parkingId, floors, selectedPlacesCount } = req.body;

    const parking = await Parking.findById(parkingId);
    if (!parking) {
      return res.status(404).json({ error: 'Parking not found' });
    }

    floors.forEach(floor => {
      const floorIndex = floor.floorIndex;
      const rows=floor.rows;
      const columns=floor.columns
      const parkingData = floor.parkingData;
      const places = floor.places.map(place => ({
        floorIndex,
        row: place.row,
        column: place.column,
        name: place.name,
        status: place.status,
        code: place.code,
        battery: place.battery
      }));

      parking.floors.push({ floorIndex,rows,columns, parkingData, places });
    });

    parking.selectedPlacesCount = selectedPlacesCount;
    await parking.save();
    res.status(201).json({ message: 'Parking data added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addParking = async (req, res) => {
  try {
    const { userId, name, longitude, latitude, admin, pricing, floors, description, imageUrl } = req.body;

    const newParking = await SupervisorService.addParking(userId, name, longitude, latitude, admin, pricing, floors, description, imageUrl);

    res.status(201).json(newParking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Fonction modifiée avec Strategy Pattern
exports.getParkings = async (req, res) => {
  try {
    const result = await ParkingFactory.getParkings(req.query);
    res.status(200).json(result);
  } catch (error) {
    const status = error.message.includes('not found') ? 404
                 : error.message.includes('required') ? 400
                 : 500;
    res.status(status).json({ message: error.message });
  }
};

exports.deleteParking = async (req, res) => {
  try {
    const parkingId = req.params.id;
    const deletedParking = await Parking.findByIdAndDelete(parkingId);
    if (!deletedParking) {
      return res.status(404).json({ error: 'Parking not found' });
    }
    res.status(200).json({ message: 'Parking deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getParkingById = async (req, res) => {
  try {
    const parking = await Parking.findById(req.params.id);
    if (!parking) {
      return res.status(404).json({ msg: 'Parking not found' });
    }
    res.json(parking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateParking = async (req, res) => {
  const { name, longitude, latitude, admin, pricing, floors, description, selectedPlacesCount } = req.body;
  try {
    let parking = await Parking.findById(req.params.id);
    if (!parking) {
      return res.status(404).json({ msg: 'Parking not found' });
    }

    parking.name = name;
    parking.longitude = longitude;
    parking.latitude = latitude;
    parking.admin = admin;
    parking.pricing = pricing;
    parking.floors = floors;
    parking.description = description;
    parking.selectedPlacesCount = selectedPlacesCount;

    if (req.file) {
      parking.imageUrl = req.file.path;
    }

    await parking.save();

    res.json({ message: 'Parking updated successfully' });
  } catch (error) {
     res.status(500).json({ error: error.message });
  }
};

exports.getParkingPlaces = async (req, res) => {
  try {
    const parkingId = req.params.parkingId;
    const parking = await Parking.findById(parkingId);
    if (!parking) {
      return res.status(404).json({ error: 'Parking not found' });
    }

    const places = parking.floors.flatMap(floor => floor.places);
    res.status(200).json(places);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
// Assuming your data structure in the backend has parking places with a name field
exports.getParkingFloors = async (req, res) => {
  try {
    const parkingId = req.params.parkingId;
    const parking = await Parking.findById(parkingId);
    if (!parking) {
      return res.status(404).json({ error: 'Parking not found' });
    }

    res.status(200).json({ floors: parking.floors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getParkingCount = async (req, res) => {
  try {
    const parkingCount = await Parking.countDocuments();
    res.status(200).json({ parkingCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getParkingsByAdminEmail = async (req, res) => {
  try {
    const { adminEmail } = req.query;
    if (!adminEmail) {
      return res.status(400).json({ error: 'Admin email is required' });
    }

    // Find the user by email
    const adminUser = await adminModel.findOne({ email: adminEmail });
    if (!adminUser) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Find parkings associated with the admin
    const parkings = await Parking.findOne({ admin: adminUser.email });

    // Check if parkings exist and have a 'name' property
    if (!parkings || !parkings.name) {
      return res.status(404).json({ error: 'Parking not found' });
    }

    const parkingName = parkings.name;
    console.log(parkingName);

    res.status(200).json(parkingName);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getParkingsByAdminEmail = async (req, res) => {
  try {
    const { adminEmail } = req.query;
    if (!adminEmail) {
      return res.status(400).json({ error: 'Admin email is required' });
    }

    // Find the user by email
    const adminUser = await adminModel.findOne({ email: adminEmail });
    if (!adminUser) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Find parkings associated with the admin
    const parkings = await Parking.find({ admin: adminUser.email });

    res.status(200).json(parkings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
