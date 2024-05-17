// analyticsManager.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'circle.api.analytics.storage_key';

interface EventData {
  [key: string]: any;
}

interface EventObject {
  eventName: string;
  eventData: EventData;
  timestamp: number;
}

class Analytics {
  data: EventObject[];
  serverEndpoint: string;
  contentTimerStart: number | null;
  eventPrefix: string;
  userId: string | null;

  constructor() {
    this.data = [];
    this.serverEndpoint = ''; // Adicione o endpoint do seu servidor, se aplicável
    this.contentTimerStart = null;
    this.eventPrefix = ''; // Prefixo inicial vazio
    this.userId = null;
  }

  setEventPrefix(prefix: string): void {
    this.eventPrefix = prefix;
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  trackEvent(eventName: string, eventData: EventData = {}): void {
    const currentTimestamp = Date.now();
    const prefixedEventName = this.eventPrefix ? `${this.eventPrefix}_${eventName}` : eventName;
    const eventObject: EventObject = {
      eventName: prefixedEventName,
      eventData: { ...eventData, userId: this.userId},
      timestamp: currentTimestamp,
    };

    this.data.push(eventObject);
    this.saveData();

    if (this.serverEndpoint) {
      this.sendDataToServer(eventObject);
    }
  }

  trackCustomEvent(customEvent: string, eventData: EventData = {}): void {
    this.trackEvent(customEvent, eventData);
  }

  startContentViewTimer(): void {
    this.contentTimerStart = Date.now();
  }

  stopContentViewTimer(contentId: string): void {
    if (this.contentTimerStart !== null) {
      const duration = Date.now() - this.contentTimerStart;
      this.trackEvent('content_view', { contentId, duration });
      this.contentTimerStart = null;
    }
  }

  async saveData(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.error('Erro ao salvar dados de analytics:', error);
    }
  }

  async loadData(): Promise<void> {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      this.data = storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error('Erro ao carregar dados de analytics:', error);
    }
  }

  async sendDataToServer(eventObject: EventObject): Promise<void> {
    // Implemente a lógica para enviar os dados para o servidor
    try {
      const response = await fetch(this.serverEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventObject),
      });

      // Verifique a resposta do servidor, se necessário
      if (response.ok) {
        console.log('Dados enviados com sucesso para o servidor.');
      } else {
        console.error('Falha ao enviar dados para o servidor:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao enviar dados para o servidor:', error);
    }
  }

  clearData(): void {
    this.data = [];
    this.saveData();
  }
}

export const analytics = new Analytics();