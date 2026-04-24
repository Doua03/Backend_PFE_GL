/**
 * ============================================================================
 * INTERFACE SEGREGATION PRINCIPLE (ISP) - SOLID
 * ============================================================================
 *
 * Définition:
 * Le Principe de Ségrégation d'Interface stipule que les clients ne doivent pas
 * être forcés à dépendre d'interfaces qu'ils n'utilisent pas.
 *
 * Les interfaces doivent être SPÉCIFIQUES AU CLIENT et non générales.
 * ============================================================================
 */

// ❌ AVANT - VIOLATION DU PRINCIPE ISP
// ============================================================================
/**
 * Un grand service monolithique qui force le contrôleur à dépendre
 * de méthodes qu'il n'utilise pas réellement
 */
class MonolithicUserService {
  // Mélange d'authentification, email, et gestion utilisateur
  async register(email, password) {
    /* ... */
  }
  async login(email, password) {
    /* ... */
  }
  async sendVerificationEmail(email, link) {
    /* ... */
  }
  async sendPasswordResetEmail(email, link) {
    /* ... */
  }
  async getUserProfile(userId) {
    /* ... */
  }
  async updateUser(userId, data) {
    /* ... */
  }
  async deleteUser(userId) {
    /* ... */
  }
  async generateToken(data, secret, expiry) {
    /* ... */
  }
  async verifyToken(token, secret) {
    /* ... */
  }
}

// Dans le contrôleur, on dépend de TOUTES ces méthodes
class UserControllerBefore {
  constructor() {
    this.userService = new MonolithicUserService();
  }

  // Le contrôleur dépend de beaucoup de méthodes inutiles
  async register(req, res) {
    // On utilise seulement 3 méthodes mais on dépend de 9
    const token = this.userService.generateVerificationToken(); // 1
    await this.userService.sendVerificationEmail(); // 2
    await this.userService.register(); // 3
    // ... mais sendPasswordResetEmail, generateToken, etc. ne sont pas utilisés ici
  }
}

// ✅ APRÈS - AVEC LE PRINCIPE ISP
// ============================================================================
/**
 * Séparation en INTERFACES SPÉCIFIQUES
 * Chaque service a une responsabilité unique et clairement définie
 */

/**
 * Interface 1: AuthenticationService
 * Responsabilité UNIQUE: Gestion de l'authentification
 * Le contrôleur ne voit que ce qu'il utilise réellement
 */
class AuthenticationService {
  /**
   * Crée un token de vérification d'email
   * @param {string} email - Email de l'utilisateur
   * @param {string} secret - Secret pour signer le token
   * @returns {string} Token JWT
   */
  generateVerificationToken(email, secret = "verificationSecret") {
    const jwt = require("jsonwebtoken");
    return jwt.sign({ email }, secret, { expiresIn: "1d" });
  }

  /**
   * Vérifie un token JWT
   * @param {string} token - Token à vérifier
   * @param {string} secret - Secret pour vérifier le token
   * @returns {object} Données du token décodé
   */
  async verifyEmailToken(token, secret = "verificationSecret") {
    const jwt = require("jsonwebtoken");
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  /**
   * Effectue la connexion utilisateur
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe
   * @returns {object} Résultat d'authentification avec token
   */
  async login(email, password) {
    // Logique d'authentification spécifique
    const user = await this.checkUser(email);
    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error("Invalid credentials");

    const tokenData = { _id: user._id, email: user.email };
    return { status: true, token: this.generateToken(tokenData) };
  }
}

/**
 * Interface 2: EmailService
 * Responsabilité UNIQUE: Gestion de l'envoi d'emails
 * Le contrôleur ne voit que les méthodes d'email
 */
class EmailService {
  /**
   * Envoie un email de vérification
   * @param {string} toEmail - Email du destinataire
   * @param {string} verificationLink - Lien de vérification
   * @returns {boolean} Succès de l'envoi
   */
  async sendVerificationEmail(toEmail, verificationLink) {
    // Logique d'envoi d'email spécifique
    const mailOptions = {
      from: "support@app.com",
      to: toEmail,
      subject: "Vérifiez votre email",
      html: `<a href="${verificationLink}">Vérifier</a>`,
    };
    // Envoi du mail...
    return true;
  }

  /**
   * Envoie un email de réinitialisation de mot de passe
   * @param {string} toEmail - Email du destinataire
   * @param {string} resetLink - Lien de réinitialisation
   * @returns {boolean} Succès de l'envoi
   */
  async sendPasswordResetEmail(toEmail, resetLink) {
    const mailOptions = {
      from: "support@app.com",
      to: toEmail,
      subject: "Réinitialiser votre mot de passe",
      html: `<a href="${resetLink}">Réinitialiser</a>`,
    };
    // Envoi du mail...
    return true;
  }
}

/**
 * Interface 3: UserService
 * Responsabilité UNIQUE: Gestion des données utilisateur
 */
class UserService {
  /**
   * Enregistre un nouvel utilisateur
   * @param {string} username - Nom d'utilisateur
   * @param {string} email - Email
   * @param {string} password - Mot de passe
   * @returns {object} Utilisateur créé
   */
  async registerUser(username, email, password) {
    // Logique d'enregistrement spécifique
    const user = new UserModel({ username, email, password });
    return user.save();
  }

  /**
   * Récupère un utilisateur par email
   * @param {string} email - Email de l'utilisateur
   * @returns {object} Utilisateur trouvé
   */
  async findUserByEmail(email) {
    return UserModel.findOne({ email });
  }

  /**
   * Met à jour le profil utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {object} data - Données à mettre à jour
   * @returns {object} Utilisateur mis à jour
   */
  async updateUserProfile(userId, data) {
    return UserModel.findByIdAndUpdate(userId, data, { new: true });
  }
}

// ============================================================================
// APPLICATION DANS LE CONTRÔLEUR - AVEC ISP
// ============================================================================

/**
 * Le contrôleur dépend UNIQUEMENT des interfaces dont il a besoin
 * Plus de dépendances inutiles = Code plus maintenable et testable
 */
class UserControllerAfter {
  constructor(
    authenticationService, // Seulement les méthodes d'authentification
    emailService, // Seulement les méthodes d'email
    userService, // Seulement les méthodes utilisateur
  ) {
    this.authService = authenticationService;
    this.emailService = emailService;
    this.userService = userService;
  }

  /**
   * Enregistrement avec ISP appliqué
   * Le contrôleur utilise UNIQUEMENT les méthodes nécessaires
   */
  async register(req, res) {
    try {
      const { username, email, password } = req.body;

      // ISP: Utilisation de AuthenticationService pour la génération de token
      const verificationToken =
        this.authService.generateVerificationToken(email);
      const verificationLink = `${process.env.APP_URL}/verify-email?token=${verificationToken}`;

      // ISP: Utilisation de EmailService pour l'envoi d'email
      await this.emailService.sendVerificationEmail(email, verificationLink);

      // ISP: Utilisation de UserService pour l'enregistrement
      const user = await this.userService.registerUser(
        username,
        email,
        password,
      );

      res.json({
        status: true,
        message: "Un email de vérification a été envoyé",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Connexion avec ISP appliqué
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // ISP: Utilisation UNIQUEMENT de AuthenticationService
      const authResult = await this.authService.login(email, password);

      res.status(200).json(authResult);
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }

  /**
   * Vérification d'email avec ISP appliqué
   */
  async verifyEmail(req, res) {
    try {
      const { token } = req.query;

      // ISP: Utilisation de AuthenticationService pour vérifier le token
      const decodedToken = await this.authService.verifyEmailToken(token);

      // ISP: Utilisation de UserService pour mettre à jour l'utilisateur
      const user = await this.userService.findUserByEmail(decodedToken.email);
      await this.userService.updateUserProfile(user._id, {
        emailVerified: true,
      });

      res.json({ status: true, message: "Email vérifié avec succès" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Réinitialisation de mot de passe avec ISP appliqué
   */
  async resetPassword(req, res) {
    try {
      const { email, newPassword } = req.body;

      // ISP: Utilisation de UserService pour trouver l'utilisateur
      const user = await this.userService.findUserByEmail(email);
      if (!user) throw new Error("User not found");

      // ISP: Utilisation de EmailService pour envoyer le lien de réinitialisation
      const resetToken = this.authService.generateVerificationToken(
        email,
        "resetSecret",
      );
      const resetLink = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
      await this.emailService.sendPasswordResetEmail(email, resetLink);

      res.json({ status: true, message: "Lien de réinitialisation envoyé" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

// ============================================================================
// AVANTAGES DE L'APPLICATION DE ISP
// ============================================================================

/**
 * 1. MAINTENABILITÉ
 *    - Chaque service a une responsabilité unique et claire
 *    - Les modifications d'une interface n'affectent pas les autres
 *    - Code plus facile à comprendre
 *
 * 2. TESTABILITÉ
 *    - Chaque service peut être testé isolément
 *    - Mock plus facile à créer pour les tests unitaires
 *    - Test du contrôleur avec des services mockés
 *
 * 3. FLEXIBILITÉ
 *    - Facile de remplacer une implémentation sans affecter les autres
 *    - Changement du service d'email (Gmail -> SendGrid) sans toucher au reste
 *
 * 4. RÉUTILISABILITÉ
 *    - Les services peuvent être utilisés dans d'autres contrôleurs
 *    - Pas de dépendances inutiles = meilleure composition
 *
 * 5. SCALABILITÉ
 *    - Ajouter de nouvelles interfaces sans surcharger les existantes
 *    - Microservices facilement identifiés
 */

// ============================================================================
// EXEMPLE D'UTILISATION AVEC INJECTION DE DÉPENDANCES
// ============================================================================

// Dans app.js ou un fichier de configuration
const setupUserController = () => {
  // Créer les services avec responsabilités ségrégées
  const authService = new AuthenticationService();
  const emailService = new EmailService();
  const userService = new UserService();

  // Injecter UNIQUEMENT les dépendances nécessaires
  const userController = new UserControllerAfter(
    authService, // Seulement ce qu'il utilise
    emailService, // Seulement ce qu'il utilise
    userService, // Seulement ce qu'il utilise
  );

  return userController;
};

module.exports = {
  AuthenticationService,
  EmailService,
  UserService,
  UserControllerAfter,
  setupUserController,
};
