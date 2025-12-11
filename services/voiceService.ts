// Voice Command Service - Web Speech API Integration
// Provides voice control for the dashboard

export interface VoiceCommand {
  pattern: RegExp;
  action: string;
  description: string;
  examples: string[];
}

export interface VoiceState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  confidence: number;
  error: string | null;
}

type CommandHandler = (match: RegExpMatchArray) => void;

class VoiceCommandService {
  private recognition: SpeechRecognition | null = null;
  private isSupported: boolean = false;
  private isListening: boolean = false;
  private commandHandlers: Map<string, CommandHandler> = new Map();
  private listeners: ((state: VoiceState) => void)[] = [];
  private lastTranscript: string = '';
  
  // Define available commands
  public readonly commands: VoiceCommand[] = [
    {
      pattern: /show\s+(floor\s+)?(\d+|ground|parking)/i,
      action: 'navigate_floor',
      description: 'Navigate to a specific floor',
      examples: ['Show floor 2', 'Show ground floor', 'Show parking'],
    },
    {
      pattern: /go\s+to\s+(overview|parking|zones?|personnel|thermal|incident|explosion|alerts?)/i,
      action: 'navigate_page',
      description: 'Navigate to a dashboard page',
      examples: ['Go to parking', 'Go to thermal', 'Go to alerts'],
    },
    {
      pattern: /(show|hide)\s+(zones?|parking|labels)/i,
      action: 'toggle_visibility',
      description: 'Toggle visibility of elements',
      examples: ['Show zones', 'Hide parking', 'Show labels'],
    },
    {
      pattern: /set\s+time\s+(?:to\s+)?(\d{1,2})(?::(\d{2}))?/i,
      action: 'set_time',
      description: 'Set simulation time',
      examples: ['Set time to 14:00', 'Set time 9'],
    },
    {
      pattern: /(play|pause|stop)\s*(?:simulation)?/i,
      action: 'control_simulation',
      description: 'Control time simulation',
      examples: ['Play simulation', 'Pause', 'Stop'],
    },
    {
      pattern: /(enable|disable|activate)\s+emergency\s*(?:mode)?/i,
      action: 'emergency_mode',
      description: 'Toggle emergency mode',
      examples: ['Enable emergency mode', 'Activate emergency'],
    },
    {
      pattern: /what(?:'s|\s+is)\s+the\s+(temperature|occupancy|status)\s*(?:in|of|for)?\s*(.*)?/i,
      action: 'query_status',
      description: 'Query building status',
      examples: ['What is the temperature in lobby', 'What\'s the occupancy'],
    },
    {
      pattern: /zoom\s+(in|out)/i,
      action: 'zoom',
      description: 'Zoom camera',
      examples: ['Zoom in', 'Zoom out'],
    },
    {
      pattern: /rotate\s+(left|right|around)/i,
      action: 'rotate',
      description: 'Rotate camera view',
      examples: ['Rotate left', 'Rotate around'],
    },
    {
      pattern: /reset\s+(view|camera|all)/i,
      action: 'reset',
      description: 'Reset view or settings',
      examples: ['Reset view', 'Reset camera'],
    },
    {
      pattern: /(dark|light)\s+mode/i,
      action: 'theme',
      description: 'Switch theme',
      examples: ['Dark mode', 'Light mode'],
    },
    {
      pattern: /help|commands|what\s+can\s+(?:you|i)\s+(?:do|say)/i,
      action: 'help',
      description: 'Show available commands',
      examples: ['Help', 'What can I say'],
    },
  ];

  constructor() {
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      this.isSupported = false;
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    this.isSupported = true;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript.trim();
      const confidence = result[0].confidence;

      if (result.isFinal) {
        this.lastTranscript = transcript;
        this.processCommand(transcript);
        this.notifyListeners({
          isListening: this.isListening,
          isSupported: this.isSupported,
          transcript,
          confidence,
          error: null,
        });
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      this.notifyListeners({
        isListening: this.isListening,
        isSupported: this.isSupported,
        transcript: this.lastTranscript,
        confidence: 0,
        error: event.error,
      });
    };

    this.recognition.onend = () => {
      // Restart if still supposed to be listening
      if (this.isListening && this.recognition) {
        this.recognition.start();
      }
    };
  }

  public start(): boolean {
    if (!this.recognition || !this.isSupported) {
      return false;
    }

    try {
      this.recognition.start();
      this.isListening = true;
      this.notifyListeners({
        isListening: true,
        isSupported: true,
        transcript: '',
        confidence: 0,
        error: null,
      });
      return true;
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      return false;
    }
  }

  public stop(): void {
    if (this.recognition) {
      this.isListening = false;
      this.recognition.stop();
      this.notifyListeners({
        isListening: false,
        isSupported: this.isSupported,
        transcript: this.lastTranscript,
        confidence: 0,
        error: null,
      });
    }
  }

  public toggle(): boolean {
    if (this.isListening) {
      this.stop();
      return false;
    } else {
      return this.start();
    }
  }

  public registerHandler(action: string, handler: CommandHandler): void {
    this.commandHandlers.set(action, handler);
  }

  public unregisterHandler(action: string): void {
    this.commandHandlers.delete(action);
  }

  private processCommand(transcript: string): void {
    const normalizedTranscript = transcript.toLowerCase().trim();
    
    for (const command of this.commands) {
      const match = normalizedTranscript.match(command.pattern);
      if (match) {
        const handler = this.commandHandlers.get(command.action);
        if (handler) {
          handler(match);
        } else {
          console.log(`No handler registered for action: ${command.action}`, match);
        }
        return;
      }
    }
    
    console.log('No command matched:', transcript);
  }

  public subscribe(listener: (state: VoiceState) => void): () => void {
    this.listeners.push(listener);
    // Immediately notify with current state
    listener({
      isListening: this.isListening,
      isSupported: this.isSupported,
      transcript: this.lastTranscript,
      confidence: 0,
      error: null,
    });
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(state: VoiceState): void {
    this.listeners.forEach(listener => listener(state));
  }

  public getState(): VoiceState {
    return {
      isListening: this.isListening,
      isSupported: this.isSupported,
      transcript: this.lastTranscript,
      confidence: 0,
      error: null,
    };
  }

  // Text-to-speech for responses
  public speak(text: string): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  }
}

// Export singleton instance
export const voiceService = new VoiceCommandService();

// Helper hook data
export const getVoiceCommands = () => voiceService.commands;

