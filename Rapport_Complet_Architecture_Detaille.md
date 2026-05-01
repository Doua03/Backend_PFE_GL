# Rapport Complet et Détaillé – Architecture et Patterns de Conception
## Projet Backend_PFE_GL (Node.js / Express / Mongoose)

---

## 1. Introduction

Ce document est une plongée technique approfondie dans l'architecture du backend du projet de gestion de parking. Il détaille la manière dont les principes fondamentaux du génie logiciel (GRASP, SOLID) et les patrons de conception (GoF) ont été traduits en code réel utilisant l'écosystème **Node.js, Express et Mongoose**.

---

## 2. GRASP – Information Expert (Expert en Information)

### 2.1 Concept Technique
Dans une architecture MVC standard, les contrôleurs ont souvent tendance à devenir des "God Classes" en manipulant directement les données des modèles. Le principe **Information Expert** dicte que la responsabilité de traiter une information revient à la classe qui possède cette information. Avec Mongoose, cela se traduit par l'utilisation intensive des **Instance Methods** (`schema.methods`) et des **Hooks / Middleware** (`pre` et `post`).

### 2.2 Implémentation Détaillée
**A. Modèle Utilisateur (`user.model.js`) :**
Le modèle `User` possède le mot de passe hashé. C'est donc lui, et non le contrôleur d'authentification, qui doit vérifier la validité d'une tentative de connexion.

```javascript
// Le modèle embarque sa propre logique métier avec bcrypt
userSchema.methods.comparePassword = async function(userPassword) {
  try {
    return await bcrypt.compare(userPassword, this.password);
  } catch (error) {
    return false;
  }
}
```
*Détail technique :* L'utilisation de `function()` plutôt que `() => {}` est cruciale ici pour conserver le contexte `this` pointant vers le document MongoDB actuel.

**B. Modèle Parking (`parking.model.js`) :**
Le modèle Parking gère sa propre cohérence interne. Lorsqu'une place de parking change d'état, le modèle met à jour ses compteurs globaux de manière autonome via un hook Mongoose.

```javascript
// Hook post-save sur le sous-schéma parkingPlaceSchema
parkingPlaceSchema.post('save', async function(doc) {
  // Navigation dans l'arbre du document pour trouver le parent Parking
  const parkingId = this.parent().parent().parent()._id;
  const parking = await Parking.findById(parkingId);
  
  // Recalcul des places occupées/réservées
  // ... (logique de comptage) ...
  
  parking.occupiedPlacesCount = occupiedCount;
  await parking.save();
});
```

---

## 3. SOLID – Liskov Substitution Principle (LSP)

### 3.1 Concept Technique
Le LSP impose que les sous-types soient substituables à leurs types de base. Dans une base de données NoSQL orientée documents comme MongoDB, cela est géré via le concept de **Single Table Inheritance (STI)** implémenté par Mongoose sous le nom de **Discriminateurs** (`Discriminators`).

### 3.2 Implémentation Détaillée
Au lieu d'avoir trois collections MongoDB (`admins`, `supervisors`, `users`), nous avons une seule collection `users`. Le type de l'utilisateur est déterminé par une clé discriminante.

**A. Modèle de Base (`User`) :**
```javascript
const userSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
}, { 
  discriminatorKey: 'session', // Clé définissant le sous-type
  collection: 'users'          // Collection physique unique
});
const UserModel = db.model('User', userSchema);
```

**B. Sous-type Polymorphe (`Supervisor`) :**
```javascript
const supervisorSchema = new Schema({
  license: { type: Object, default: {} },
  jobpost: { type: String, default: '' },
});

// Création du discriminateur : Supervisor hérite de User
const SupervisorModel = UserModel.discriminator('Supervisor', supervisorSchema);
```

### 3.3 Avantage Architectural
Lorsqu'un utilisateur se connecte, le système d'authentification interroge uniquement `UserModel`. Mongoose, grâce à la clé `session` stockée en base, instancie et retourne automatiquement un objet de la classe dérivée appropriée (`SupervisorModel` ou `AdminModel`). Le polymorphisme est géré de manière transparente au niveau de l'ORM.

---

## 4. Patron GoF : Decorator (Décorateur)

### 4.1 Concept Technique
Le Décorateur permet d'attacher dynamiquement de nouvelles responsabilités à un objet sans modifier son code source et sans utiliser l'héritage multiple. En JavaScript, cela se traduit par le "wrapping" (enveloppement) d'objets partageant la même interface.

### 4.2 Implémentation Détaillée
Dans le dossier `decorators/notifier.decorators.js` et `services/notifier.service.js`.

**A. Le Composant Concret (`EmailNotifier`) :**
Exécute la tâche principale en utilisant la librairie externe `nodemailer`.
```javascript
class EmailNotifier {
  async send(to, subject, message) {
    return await this.transporter.sendMail({ from, to, subject, text: message });
  }
}
```

**B. Le Décorateur de Base et les Décorateurs Concrets :**
Chaque décorateur prend en paramètre l'instance précédente (`wrappedNotifier`) et intercepte la méthode `send()`.

```javascript
class SocketNotifierDecorator extends NotifierDecorator {
  constructor(notifier, io) {
    super(notifier);
    this.io = io; // Injection de dépendance du serveur Socket.io
  }

  async send(to, subject, message) {
    // 1. Délégation à l'objet enveloppé (l'email est envoyé)
    const result = await super.send(to, subject, message);
    
    // 2. Ajout du comportement décoratif (émission temps réel)
    this.io.emit('notification', { to, title: subject, body: message });
    
    return result;
  }
}
```

**C. Assemblage Dynamique (`index.js`) :**
```javascript
let notifier = new EmailNotifier(); // Noyau
notifier = new SocketNotifierDecorator(notifier, io); // Couche 1
notifier = new LoggingNotifierDecorator(notifier); // Couche 2

// Déclenche : Log -> Socket -> Email (puis résolution des Promesses en cascade)
await notifier.send(email, subject, message);
```

---

## 5. Patron GoF : Singleton

### 5.1 Concept Technique
Bien que le système de modules de Node.js mette en cache les objets exportés (agissant partiellement comme un singleton), une véritable classe Singleton garantit l'encapsulation de l'instanciation, surtout pour des ressources critiques comme le pool de connexions à la base de données.

### 5.2 Implémentation Détaillée
Fichier `config/db.js`. L'utilisation des propriétés privées ECMAScript (`#`) garantit une stricte encapsulation.

```javascript
class DatabaseConnection {
  static #instance = null; // Propriété statique privée (ES2022)
  #connection = null;

  constructor() {
    if (DatabaseConnection.#instance) {
      throw new Error('[Singleton] Instanciation directe interdite.');
    }
  }

  static getInstance() {
    if (!DatabaseConnection.#instance) {
      DatabaseConnection.#instance = new DatabaseConnection();
      DatabaseConnection.#instance._connect(); // Initialisation paresseuse (Lazy Loading)
    }
    return DatabaseConnection.#instance;
  }
  
  _connect() {
    mongoose.connect(process.env.MONGO_URI);
    // Le singleton gère également les écouteurs d'événements globaux
    mongoose.connection.on('error', (err) => console.error(err));
  }
}

// Export de l'instance unique
module.exports = DatabaseConnection.getInstance();
```
*Avantage technique :* Partout dans l'application, faire `require('../config/db')` retourne toujours la même instance, partageant le même pool de sockets TCP vers le cluster MongoDB Atlas.

---

## 6. Patron GoF : Strategy (Stratégie)

### 6.1 Concept Technique
La Stratégie remplace les longues instructions `switch/case` ou `if/else` par des classes interchangeables implémentant une méthode commune. Cela respecte le principe OCP (Open/Closed Principle).

### 6.2 Implémentation Détaillée
Fichiers `services/payment.strategy.js` et `controller/paymentController.js`.

**A. Définition des Stratégies :**
Comme JavaScript n'a pas d'interfaces formelles, la classe de base sert de contrat en lançant une exception si la méthode n'est pas redéfinie.

```javascript
class PaymentStrategy {
  async process(amount) { throw new Error("Method not implemented."); }
}

class FlouciPaymentStrategy extends PaymentStrategy {
  async process(amount) {
    // Appel API complexe avec Axios vers la passerelle Flouci
    const response = await axios.post(FLOUCI_URL, payload);
    return { paymentUrl: response.data.result.link, status: 'pending' };
  }
}

class CashPaymentStrategy extends PaymentStrategy {
  async process(amount) {
    // Logique locale simple
    return { status: 'completed', message: 'A régler sur place.' };
  }
}
```

**B. Contexte d'Exécution (Le Contrôleur) :**
Le contrôleur devient agnostique vis-à-vis des API de paiement externes. Son seul rôle est d'instancier la bonne stratégie en fonction du payload de la requête HTTP.

```javascript
exports.Add = async (req, res) => {
  const { amount, method } = req.body;
  let strategy;
  
  // Usine à stratégies simplifiée
  switch (method) {
    case 'cash': strategy = new CashPaymentStrategy(); break;
    case 'flouci': default: strategy = new FlouciPaymentStrategy(); break;
  }

  // Polymorphisme en action : le contrôleur ignore les détails internes
  const result = await strategy.process(amount);
  res.status(200).send(result);
};
```

---

*Rapport généré pour le projet Backend_PFE_GL.*
