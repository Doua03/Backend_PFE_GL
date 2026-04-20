const express = require("express");
const Router = express.Router();
const reviewController = require('../controller/reviewController');

Router.post("/feedback",reviewController.postfeedback);
Router.get("/getfeedback",reviewController.getfeedback);

module.exports = Router;