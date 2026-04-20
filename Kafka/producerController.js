/*var Kafka = require('no-kafka');
const express = require('express');
var router = express.Router();
var kafka = require('kafka-node');


 const kafka_topic = 'AS.Treetronix.v1';
try {
  const Producer = kafka.Producer;
  const client = new kafka.KafkaClient({ kafkaHost: 'kafka.treetronix.com:9095' });
  const producer = new Producer(client);

   console.log("Producer Initialised..");



 producer.on('ready', function() {
     let num = 0;
     setInterval(() => {
        let payloads = [{ topic: 'AS.Treetronix.v1',
      messages: num
}];
            producer.send(payloads, (err, data) => {
                 if (err) {
                     console.log('[kafka-producer -> ' + kafka_topic + ']: broker update failed');
                 } else {
                     console.log('[kafka-producer -> ' + kafka_topic + ']: broker update success');
                 }
             });
             num++;
         }, 2000);

     });

     producer.on('error', function(err) {
         console.log(err);
         console.log('[kafka-producer -> ' + kafka_topic + ']: connection errored');
         throw err;
     });
 } catch (e) {
     console.log(e);
 }



module.exports = router;*/