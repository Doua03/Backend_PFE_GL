/**
 * Observer Pattern (Observateur) - Supervisor Observer
 *
 * Objectif: Observer les événements de login et addSupervisor
 * pour déclencher des actions secondaires (notifications, logging, etc.)
 *
 * Référence: Gang of Four - Observer Pattern
 * Appliqué au: SupervisorController (methods: logins, addSupervisor)
 */

/**
 * Subject (Observable) - Gère les observateurs
 */
class SupervisorEventEmitter {
  constructor() {
    this.observers = [];
  }

  // Enregistre un observateur
  subscribe(observer) {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  // Désenregistre un observateur
  unsubscribe(observer) {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  // Notifie tous les observateurs
  notifyObservers(event, data) {
    this.observers.forEach((observer) => {
      observer.update(event, data);
    });
  }
}

/**
 * Observer 1: Logger - Enregistre les événements
 */
class SupervisorLogger {
  update(event, data) {
    const timestamp = new Date().toISOString();
    console.log(
      `[${timestamp}] SupervisorEvent - ${event}:`,
      JSON.stringify(data),
    );
  }
}

/**
 * Observer 2: Auditor - Audit des accès
 */
class SupervisorAuditor {
  constructor(auditService) {
    this.auditService = auditService;
  }

  update(event, data) {
    if (event === "supervisor_login") {
      this.recordLoginAudit(data);
    } else if (event === "supervisor_added") {
      this.recordAdditionAudit(data);
    }
  }

  recordLoginAudit(data) {
    // Enregistre: supervisorId, login time, IP (if available)
    console.log("Audit: Supervisor login recorded -", data.supervisorId);
  }

  recordAdditionAudit(data) {
    // Enregistre: new supervisor email, creation time, added by
    console.log("Audit: New supervisor added -", data.email);
  }
}

/**
 * Observer 3: NotificationService - Envoie des notifications
 */
class SupervisorNotificationService {
  update(event, data) {
    if (event === "supervisor_login") {
      this.sendLoginNotification(data);
    } else if (event === "supervisor_added") {
      this.sendWelcomeEmail(data);
    }
  }

  sendLoginNotification(data) {
    console.log("Notification: Login detected for supervisor -", data.email);
    // Envoyer une notification ou email
  }

  sendWelcomeEmail(data) {
    console.log("Notification: Welcome email sent to -", data.email);
    // Envoyer un email de bienvenue
  }
}

module.exports = {
  SupervisorEventEmitter,
  SupervisorLogger,
  SupervisorAuditor,
  SupervisorNotificationService,
};
