// Local storage service to replace database
export const localStorageService = {
  // Save user profile
  saveProfile: (userId: string, profile: any) => {
    localStorage.setItem(`profile_${userId}`, JSON.stringify(profile));
  },

  // Get user profile
  getProfile: (userId: string) => {
    const data = localStorage.getItem(`profile_${userId}`);
    return data ? JSON.parse(data) : null;
  },

  // Save tax obligations
  saveObligations: (userId: string, obligations: any[]) => {
    localStorage.setItem(`obligations_${userId}`, JSON.stringify(obligations));
  },

  // Get tax obligations
  getObligations: (userId: string) => {
    const data = localStorage.getItem(`obligations_${userId}`);
    return data ? JSON.parse(data) : [];
  },

  // Add single obligation
  addObligation: (userId: string, obligation: any) => {
    const existing = localStorageService.getObligations(userId);
    const newObligation = {
      ...obligation,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    existing.push(newObligation);
    localStorageService.saveObligations(userId, existing);
    return newObligation;
  },

  // Save reminders log
  saveReminderLog: (userId: string, log: any) => {
    const logs = localStorageService.getReminderLogs(userId);
    logs.push({
      ...log,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    });
    localStorage.setItem(`reminder_logs_${userId}`, JSON.stringify(logs));
  },

  // Get reminder logs
  getReminderLogs: (userId: string) => {
    const data = localStorage.getItem(`reminder_logs_${userId}`);
    return data ? JSON.parse(data) : [];
  }
};