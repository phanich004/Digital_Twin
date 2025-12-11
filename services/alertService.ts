// Alert & Notification Service
// TODO: Connect to real-time alert systems, push notification services

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type AlertCategory = 'security' | 'safety' | 'environmental' | 'equipment' | 'occupancy' | 'system';

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  category: AlertCategory;
  timestamp: Date;
  zoneId?: string;
  zoneName?: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  autoResolve?: boolean;
  resolvedAt?: Date;
  actions?: AlertAction[];
}

export interface AlertAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  handler: string; // Action identifier
}

export interface AlertRule {
  id: string;
  name: string;
  enabled: boolean;
  condition: AlertCondition;
  severity: AlertSeverity;
  category: AlertCategory;
  notifyChannels: ('dashboard' | 'email' | 'sms' | 'slack')[];
  cooldownMinutes: number;
  lastTriggered?: Date;
}

export interface AlertCondition {
  metric: 'temperature' | 'humidity' | 'co2' | 'occupancy' | 'motion' | 'power';
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  duration?: number; // seconds
}

// In-memory alert store
let alerts: Alert[] = [];
let alertRules: AlertRule[] = [];
let alertListeners: ((alerts: Alert[]) => void)[] = [];

// Generate initial mock alerts
const generateMockAlerts = (): Alert[] => [
  {
    id: 'alert-001',
    title: 'High Temperature Detected',
    message: 'Server Room temperature has exceeded 28°C threshold',
    severity: 'high',
    category: 'environmental',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    zoneId: 'server-room',
    zoneName: 'Server Room',
    acknowledged: false,
    actions: [
      { id: 'ack', label: 'Acknowledge', type: 'primary', handler: 'acknowledge' },
      { id: 'hvac', label: 'Boost HVAC', type: 'secondary', handler: 'boost_hvac' },
    ],
  },
  {
    id: 'alert-002',
    title: 'Unusual After-Hours Access',
    message: 'Motion detected in Executive Suite at 23:45',
    severity: 'medium',
    category: 'security',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    zoneId: 'exec-suite',
    zoneName: 'Executive Suite',
    acknowledged: true,
    acknowledgedBy: 'Security Team',
    acknowledgedAt: new Date(Date.now() - 1000 * 60 * 25),
  },
  {
    id: 'alert-003',
    title: 'Parking Capacity Warning',
    message: 'Basement Level 1 is at 95% capacity',
    severity: 'low',
    category: 'occupancy',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    acknowledged: false,
  },
  {
    id: 'alert-004',
    title: 'HVAC Maintenance Required',
    message: 'Unit AHU-03 filter replacement overdue by 15 days',
    severity: 'medium',
    category: 'equipment',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    acknowledged: false,
    actions: [
      { id: 'schedule', label: 'Schedule Maintenance', type: 'primary', handler: 'schedule_maintenance' },
      { id: 'snooze', label: 'Snooze 24h', type: 'secondary', handler: 'snooze' },
    ],
  },
  {
    id: 'alert-005',
    title: 'Fire Alarm Test Scheduled',
    message: 'Monthly fire alarm test scheduled for tomorrow 10:00 AM',
    severity: 'info',
    category: 'safety',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    acknowledged: true,
    acknowledgedBy: 'Facilities Manager',
    acknowledgedAt: new Date(Date.now() - 1000 * 60 * 60),
  },
];

// Initialize with mock data
alerts = generateMockAlerts();

// Default alert rules
alertRules = [
  {
    id: 'rule-temp-high',
    name: 'High Temperature Alert',
    enabled: true,
    condition: { metric: 'temperature', operator: 'gt', threshold: 28, duration: 300 },
    severity: 'high',
    category: 'environmental',
    notifyChannels: ['dashboard', 'email'],
    cooldownMinutes: 30,
  },
  {
    id: 'rule-temp-low',
    name: 'Low Temperature Alert',
    enabled: true,
    condition: { metric: 'temperature', operator: 'lt', threshold: 16, duration: 300 },
    severity: 'medium',
    category: 'environmental',
    notifyChannels: ['dashboard'],
    cooldownMinutes: 30,
  },
  {
    id: 'rule-co2-high',
    name: 'High CO2 Level',
    enabled: true,
    condition: { metric: 'co2', operator: 'gt', threshold: 1000 },
    severity: 'high',
    category: 'environmental',
    notifyChannels: ['dashboard', 'slack'],
    cooldownMinutes: 15,
  },
  {
    id: 'rule-occupancy',
    name: 'Overcapacity Warning',
    enabled: true,
    condition: { metric: 'occupancy', operator: 'gt', threshold: 90 },
    severity: 'medium',
    category: 'occupancy',
    notifyChannels: ['dashboard'],
    cooldownMinutes: 60,
  },
];

// Alert API
export const getAlerts = (): Alert[] => [...alerts];

export const getActiveAlerts = (): Alert[] => 
  alerts.filter(a => !a.acknowledged && !a.resolvedAt);

export const getAlertsByCategory = (category: AlertCategory): Alert[] =>
  alerts.filter(a => a.category === category);

export const getAlertsBySeverity = (severity: AlertSeverity): Alert[] =>
  alerts.filter(a => a.severity === severity);

export const acknowledgeAlert = (alertId: string, userId: string = 'Current User'): boolean => {
  const alert = alerts.find(a => a.id === alertId);
  if (alert) {
    alert.acknowledged = true;
    alert.acknowledgedBy = userId;
    alert.acknowledgedAt = new Date();
    notifyListeners();
    return true;
  }
  return false;
};

export const resolveAlert = (alertId: string): boolean => {
  const alert = alerts.find(a => a.id === alertId);
  if (alert) {
    alert.resolvedAt = new Date();
    notifyListeners();
    return true;
  }
  return false;
};

export const createAlert = (alert: Omit<Alert, 'id' | 'timestamp' | 'acknowledged'>): Alert => {
  const newAlert: Alert = {
    ...alert,
    id: `alert-${Date.now()}`,
    timestamp: new Date(),
    acknowledged: false,
  };
  alerts.unshift(newAlert);
  notifyListeners();
  
  // TODO: Send to external notification channels
  // sendPushNotification(newAlert);
  // sendEmailNotification(newAlert);
  // sendSlackNotification(newAlert);
  
  return newAlert;
};

export const subscribeToAlerts = (listener: (alerts: Alert[]) => void): (() => void) => {
  alertListeners.push(listener);
  return () => {
    alertListeners = alertListeners.filter(l => l !== listener);
  };
};

const notifyListeners = () => {
  alertListeners.forEach(listener => listener([...alerts]));
};

// Alert rules API
export const getAlertRules = (): AlertRule[] => [...alertRules];

export const updateAlertRule = (ruleId: string, updates: Partial<AlertRule>): boolean => {
  const index = alertRules.findIndex(r => r.id === ruleId);
  if (index !== -1) {
    alertRules[index] = { ...alertRules[index], ...updates };
    return true;
  }
  return false;
};

export const createAlertRule = (rule: Omit<AlertRule, 'id'>): AlertRule => {
  const newRule: AlertRule = {
    ...rule,
    id: `rule-${Date.now()}`,
  };
  alertRules.push(newRule);
  return newRule;
};

// Evaluate rules against current metrics
export const evaluateRules = (metrics: Record<string, number>, zoneId?: string, zoneName?: string): Alert[] => {
  const triggeredAlerts: Alert[] = [];
  
  alertRules.forEach(rule => {
    if (!rule.enabled) return;
    
    // Check cooldown
    if (rule.lastTriggered) {
      const cooldownMs = rule.cooldownMinutes * 60 * 1000;
      if (Date.now() - rule.lastTriggered.getTime() < cooldownMs) return;
    }
    
    const value = metrics[rule.condition.metric];
    if (value === undefined) return;
    
    let triggered = false;
    switch (rule.condition.operator) {
      case 'gt': triggered = value > rule.condition.threshold; break;
      case 'lt': triggered = value < rule.condition.threshold; break;
      case 'eq': triggered = value === rule.condition.threshold; break;
      case 'gte': triggered = value >= rule.condition.threshold; break;
      case 'lte': triggered = value <= rule.condition.threshold; break;
    }
    
    if (triggered) {
      rule.lastTriggered = new Date();
      const alert = createAlert({
        title: rule.name,
        message: `${rule.condition.metric} is ${value} (threshold: ${rule.condition.threshold})`,
        severity: rule.severity,
        category: rule.category,
        zoneId,
        zoneName,
      });
      triggeredAlerts.push(alert);
    }
  });
  
  return triggeredAlerts;
};

// Severity colors and icons for UI
export const getSeverityConfig = (severity: AlertSeverity) => {
  const configs = {
    critical: { color: 'red', bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' },
    high: { color: 'orange', bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50' },
    medium: { color: 'yellow', bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
    low: { color: 'blue', bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
    info: { color: 'slate', bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/50' },
  };
  return configs[severity];
};

