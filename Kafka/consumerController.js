/*const kafka = require('kafka-node');
const Parking = require('../model/parking.model');

const consumerController = (io) => {
  const client = new kafka.KafkaClient({ kafkaHost: 'kafka.treetronix.com:9095' });

  client.on('error', (error) => {
    console.error('Kafka client error:', error);
  });

  const consumer = new kafka.Consumer(
    client,
    [{ topic: 'AS.Treetronix.v1', partition: 0 }],
    { autoCommit: true }
  );

  consumer.on('message', async (message) => {
    try {
      console.log('Kafka message received:', message);
      const obj = JSON.parse(message.value);
      await checkSensor(obj);
    } catch (err) {
      console.error('Error processing Kafka message:', err);
    }
  });

  consumer.on('error', (err) => {
    console.error('Kafka Consumer error:', err);
  });

  consumer.on('offsetOutOfRange', (err) => {
    console.error('Kafka Consumer offsetOutOfRange:', err);
  });

  async function checkSensor(obj) {
    try {
      const parking = await Parking.findOne({ 'floors.places.code': obj.DevEUI_uplink.DevEUI });
      if (parking === null) {
        console.log('Unknown parking place code!');
      } else {
        // Appel d'une fonction pour gérer les données du capteur
        handleSensorData(obj);
        const dataToSend = await SensorCrypt(obj.DevEUI_uplink.payload_hex, obj.DevEUI_uplink.DevEUI, parking);
        if(dataToSend)
          await Updatedata(dataToSend, obj.DevEUI_uplink.DevEUI, parking);
      }
    } catch (e) {
      console.log(e);
    }
  }

  function handleSensorData(sensorData) {
    // Traiter les données du capteur ici
    console.log('Sensor data:', sensorData);
  }

  async function SensorCrypt(Crypteddata, DevEUI, parking) {
    console.log('Crypted Data :  ', Crypteddata);
      const dataToSend = await decryptData(Crypteddata);
      console.log("Datatram: ", dataToSend)
      return dataToSend;
    
  }

  async function decryptData(payload) {
    console.log("Payload : ", payload);
    console.log("Payload length: ", payload.length);
    const byte1 = payload.slice(0, 2);
    console.log('Byte numéro 1 en hexa:', byte1);
    const b = (parseInt(byte1, 16).toString(2)).padStart(8, '0').toString(); // conversion du byte 1 de l'hexadecimal en binaire 
    console.log("Byte numéro 1 en binaire  :", b);
    const typeF = b[2] + b[3] + b[4] + b[5]; /// les bits consacrés au type de trame
    console.log("Bits du frame type ", typeF);
    if (typeF === '0000') {
      console.log("Type de trame : Heartbeat Frame");
      return null; // Retourne null si les conditions ne sont pas remplies
    } else if (typeF === '0010') {
      console.log("Type de trame : Status Change Frame");
      if (payload.length === 10 && typeF === '0010') {
        const byte5 = payload.slice(8, 10);
        console.log('Byte numéro 5 en hexa:', byte5);
        const k = (parseInt(byte5, 16).toString(2)).padStart(8, '0').toString(); // conversion du byte 5 de l'hexadecimal en binaire 
        console.log("Byte numéro 5 en binaire  :", k);
        const status = parseInt(k[0]);
        console.log("Le status du parking est:", status, status === 1 ? "voiture existe" : "voiture n'existe pas");
        const m = k.slice(1);
        const batterie = parseInt(m, 2) / 10.0; //////////// convertir du binaire au décimal pour trouver la valeur du niveau de batterie
        console.log("La valeur de niveau de batterie est :", batterie);
        return { "status": status, "battery": batterie };
      } else {
        console.log("payload n'est pas de longueur 20 ou le type de trame est incorrect");
        return null; // Retourne null si les conditions ne sont pas remplies
      }
    }
  }
  
  async function Updatedata(data, code, parking) {
    if (data && data.status !== undefined) {
      console.log("Data :", data, "Code :", code)
      for (let floor of parking.floors) {
        for (let place of floor.places) {
          if (place.code === code) {
            place.status = data.status === 1 ? true : false;
            place.battery = data.battery;
            break;
          }
        }
      }
      if (!parking.pricing) {
        parking.pricing = {
          perHour: 0,
          perDay: 0,
          perMonth: 0,
          perSixMonths: 0,
        }; 
      }
      
      await parking.save();
    } else {
      console.log("Data is not valid:", data)
    }
  }
};  

module.exports = consumerController;*/
