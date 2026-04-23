const ParkingService = require('../services/parking.services');
const supervisorModel = require('../model/supervisor');
const SupervisorService = require("../services/supervisor.services");

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
    await ParkingService.addParkingData(parkingId, floors, selectedPlacesCount);
    res.status(201).json({ message: 'Parking data added successfully' });
  } catch (error) {
    const statusCode = error.message === 'Parking not found' ? 404 : 500;
    res.status(statusCode).json({ error: error.message });
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

exports.getParkings = async (req, res) => {
  try {
     const { userId } = req.query;
     if (!userId) {
       return res.status(400).json({ message: 'User ID is required' });
     }

     const supervisor = await supervisorModel.findById(userId);
     if (!supervisor) {
       return res.status(404).json({ message: 'Supervisor not found' });
     }

     const parkings = await ParkingService.getParkingsBySupervisorId(userId); 
     res.status(200).json(parkings);
  } catch (error) {
     console.error(error);
     res.status(500).json({ message: 'Internal server error' });
  }
 };

exports.deleteParking = async (req, res) => {
  try {
    const parkingId = req.params.id;
    const success = await ParkingService.deleteParking(parkingId);
    if (!success) {
      return res.status(404).json({ error: 'Parking not found' });
    }
    res.status(200).json({ message: 'Parking deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getParkingById = async (req, res) => {
  try {
    const parking = await ParkingService.getParkingById(req.params.id);
    if (!parking) {
      return res.status(404).json({ msg: 'Parking not found' });
    }
    res.json(parking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateParking = async (req, res) => {
  try {
    const updatedParking = await ParkingService.updateParking(req.params.id, req.body, req.file);
    if (!updatedParking) {
      return res.status(404).json({ msg: 'Parking not found' });
    }
    res.json({ message: 'Parking updated successfully' });
  } catch (error) {
     res.status(500).json({ error: error.message });
  }
};

exports.getParkingsNearby = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const nearestParkings = await ParkingService.getParkingsNearby(lat, lng);
    res.status(200).json(nearestParkings);
  } catch (error) {
    console.error('Error in /parking/getParkinsNearby:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getParkingPlaces = async (req, res) => {
  try {
    const places = await ParkingService.getParkingPlaces(req.params.parkingId);
    res.status(200).json(places);
  } catch (error) {
    const statusCode = error.message === 'Parking not found' ? 404 : 500;
    res.status(statusCode).json({ error: error.message });
  }
};

exports.getParkingFloors = async (req, res) => {
  try {
    const floors = await ParkingService.getParkingFloors(req.params.parkingId);
    res.status(200).json({ floors });
  } catch (error) {
    const statusCode = error.message === 'Parking not found' ? 404 : 500;
    res.status(statusCode).json({ error: error.message });
  }
};

exports.getParkingByName = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ error: 'Parking name is required' });
    }
    const parkings = await ParkingService.getParkingByName(name);
    res.status(200).json(parkings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.searchParkings = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ error: 'Parking name is required' });
    }
    const parkings = await ParkingService.getParkingByName(name);
    res.status(200).json(parkings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getParkingCount = async (req, res) => {
  try {
    const parkingCount = await ParkingService.getParkingCount();
    res.status(200).json({ parkingCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getParkingsBySupervisorId = async (req, res) => {
  try {
    const { supervisorId } = req.params;
    if (!supervisorId) {
      return res.status(400).json({ message: 'Supervisor ID is required' });
    }

    const supervisor = await supervisorModel.findById(supervisorId);
    if (!supervisor) {
      return res.status(404).json({ message: 'Supervisor not found' });
    }

    const parkings = await ParkingService.getParkingsBySupervisorId(supervisorId);
    res.status(200).json(parkings);
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
    const parkings = await ParkingService.getParkingsByAdminEmail(adminEmail);
    res.status(200).json(parkings);
  } catch (error) {
    const statusCode = error.message === 'Admin not found' ? 404 : 500;
    res.status(statusCode).json({ error: error.message });
  }
};
