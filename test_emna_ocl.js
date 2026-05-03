const mongoose = require('mongoose');
const User = require('./model/user.model'); // Important
const Ticket = require('./model/ticket');   // Important
const Review = require('./model/review');

// Mocking the database connection for the test
const MONGO_URI = 'mongodb://bouazzadoua03:projetGL@ac-ybo6gbz-shard-00-00.cbpzvnx.mongodb.net:27017,ac-ybo6gbz-shard-00-01.cbpzvnx.mongodb.net:27017,ac-ybo6gbz-shard-00-02.cbpzvnx.mongodb.net:27017/?ssl=true&replicaSet=atlas-zet4eb-shard-0&authSource=admin&appName=Cluster0';

async function runDemo() {
    console.log("Tentative de publication d'un avis pour un utilisateur sans historique...");

    try {
        await mongoose.connect(MONGO_URI)

        // On crée un avis avec un ID utilisateur fictif qui n'a pas de tickets
        const fakeReview = new Review({
            userId: new mongoose.Types.ObjectId(), // Un nouvel ID aléatoire
            content: "Ce parking est génial ! (Ceci est un test OCL)"
        });

        // Tentative de sauvegarde
        await fakeReview.save();
        console.log("SUCCÈS : L'avis a été enregistré (C'est anormal !)");

    } catch (error) {
        console.log("\n--- RÉSULTAT DU TEST ---");
        if (error.message.includes("OCL Violation")) {
            console.log("\x1b[31m%s\x1b[0m", "REJETÉ : " + error.message);
            console.log("\n=> La contrainte OCL d'Emna fonctionne parfaitement !");
        } else {
            console.log("Erreur inattendue :", error.message);
        }
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

runDemo();
