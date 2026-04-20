const express = require("express");
const Router = express.Router();
const paymentController = require('../controller/paymentController');

Router.post("/payment",paymentController.Add);
Router.get("/payment/:id",paymentController.Verify);

module.exports = Router;