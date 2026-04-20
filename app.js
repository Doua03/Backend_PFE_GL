const express = require('express');
const bodyParser= require('body-parser');
const path = require('path'); // Importer le module path
const userRoute=require('./routers/user.router');
const adminRoute=require('./routers/admin.router');
const parkingRoutes = require('./routers/parking.router');
const parkingVisitedRoutes = require('./routers/parkingVisted.router');
const licenseRouter = require('./routers/license.router');
const paymentRouter = require('./routers/payment.router');
const ticketRouter = require('./routers/ticket.router');
const reviewRouter = require('./routers/review.router');
const app = express();
// Use the upload routes

app.use(bodyParser.json());
app.use('/review',reviewRouter);
app.use('/admins',adminRoute);
app.use('/',userRoute);
app.use('/parking', parkingRoutes);
app.use('/parkingV', parkingVisitedRoutes);
app.use('/license', licenseRouter);
app.use('/api',paymentRouter);
app.use('/ticket',ticketRouter);
app.use(express.static(path.join(__dirname, 'public')));

// Route pour afficher la page de connexion
app.get('/login', (req, res) => {
  // Vous pouvez envoyer la page HTML de votre choix ici
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
module.exports = app;
