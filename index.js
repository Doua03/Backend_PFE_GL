const app = require('./app');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
//const kafka = require('kafka-node');
const nodemailer = require('nodemailer');
//const { initializeProducer } = require('./Kafka/producerController');
//const consumerController = require('./Kafka/consumerController');
require('dotenv').config();

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  },
});

app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 3000;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'benameur808@gmail.com',
    pass: 'pbpw bunv btug tuds',
  },
});

const { EmailNotifier } = require('./services/notifier.service');
const { SocketNotifierDecorator, LoggingNotifierDecorator } = require('./decorators/notifier.decorators');

app.post('/send-email', async (req, res) => {
  const { email, password } = req.body;
  const message = `Cher(e) garde,\n Vous avez été ajouté à notre plateforme. Voici vos informations de connexion :\n Votre adresse e-mail: ${email}\nVotre mot de passe est : ${password}\nCordialement,`;
  const subject = 'Votre mot de passe';

  try {
    let notifier = new EmailNotifier();
    notifier = new SocketNotifierDecorator(notifier, io);
    notifier = new LoggingNotifierDecorator(notifier);

    await notifier.send(email, subject, message);
    res.status(200).send('Notification multi-canal envoyée avec succès');
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de l'envoi de la notification");
  }
});

app.post('/send', async (req, res) => {
  const { email, password } = req.body;
  const message = `Cher(e) Gestionnaire de parking,\n\n Vous avez été ajouté à notre plateforme.\n\n Voici vos informations de connexion :\n Votre adresse e-mail: ${email}\nVotre mot de passe est : ${password}\n\nCordialement,`;
  const subject = 'Votre mot de passe';

  try {
    let notifier = new EmailNotifier();
    notifier = new SocketNotifierDecorator(notifier, io);
    notifier = new LoggingNotifierDecorator(notifier);

    await notifier.send(email, subject, message);
    res.status(200).send('Notification multi-canal envoyée avec succès');
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de l'envoi de la notification");
  }
});



let connectedUsers = {};

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('userMessage', (data) => {
    console.log('User Message received:', `${data.senderName}: ${data.message}`);
    io.emit('new message', {
      senderId: data.senderId,
      senderName: data.senderName,
      message: data.message,
    });
  });

  socket.on('adminMessage', (data) => {
    console.log('Admin Message received:', data.message);
    const recipientId = data.recipientId;
    const recipientSocket = connectedUsers[recipientId];
    if (recipientSocket) {
      recipientSocket.emit('new message', { sender: 'Admin', message: data.message });
    } else {
      console.log('Recipient user not found');
    }
  });

  socket.on('userConnected', (userId) => {
    connectedUsers[userId] = socket;
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    for (const [key, value] of Object.entries(connectedUsers)) {
      if (value === socket) {
        delete connectedUsers[key];
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

 //consumerController(io);
