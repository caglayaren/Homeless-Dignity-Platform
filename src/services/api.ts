// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Type definitions
export interface Service {
  id: number;
  name: string;
  type: string;
  address: string;
  phone: string;
  availability: number;
  capacity: number;
  description: string;
  hours?: any;
  latitude?: number;
  longitude?: number;
  requirements?: string[];
  documentsNeeded?: string[];
  isHomelessFriendly?: boolean;
  isActive?: boolean;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  type: string;
  salary: string;
  location: string;
  description: string;
  requirements: string[];
  isHomelessFriendly: boolean;
  contactPhone?: string;
  contactEmail?: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emergencyContact: string;
  caseWorkerName: string;
  email: string;
}

export interface Appointment {
  id: number;
  userId: number;
  date: string;
  time: string;
  type: string;
  status: string;
  location?: string;
  caseWorkerName: string;
  purpose: string;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  isFromCaseWorker: boolean;
  senderName: string;
}

export interface HealthCheck {
  status: string;
  message: string;
  timestamp: string;
  endpoints: string[];
}

// API Service Class
class ApiService {
  private async fetchData<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Get all services - Backend uyumlu
  async getServices(): Promise<Service[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/services`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      // Backend'den gelen response.data'yı döndür
      if (result.success && result.data) {
        return result.data;
      } else {
        return result; // Fallback: direkt array ise
      }
    } catch (error) {
      console.error(`API Error for /services:`, error);
      throw error;
    }
  }

  // Get service by ID
  async getServiceById(id: number): Promise<Service> {
    try {
      const response = await fetch(`${API_BASE_URL}/services/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      } else {
        return result;
      }
    } catch (error) {
      console.error(`API Error for /services/${id}:`, error);
      throw error;
    }
  }

  // Get all jobs
  async getJobs(): Promise<Job[]> {
    return this.fetchData<Job[]>('/jobs');
  }

  // Get all users
  async getUsers(): Promise<User[]> {
    return this.fetchData<User[]>('/users');
  }

  // Get all appointments
  async getAppointments(): Promise<Appointment[]> {
    return this.fetchData<Appointment[]>('/appointments');
  }

  // Get all messages
  async getMessages(): Promise<Message[]> {
    return this.fetchData<Message[]>('/messages');
  }

  // Health check
  async getHealth(): Promise<HealthCheck> {
    return this.fetchData<HealthCheck>('/health');
  }

  // Get services by type
  async getServicesByType(type: string): Promise<Service[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/services?type=${type}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      } else {
        return result;
      }
    } catch (error) {
      console.error(`API Error for services by type:`, error);
      throw error;
    }
  }

  // Get homeless-friendly jobs
  async getHomelessFriendlyJobs(): Promise<Job[]> {
    const jobs = await this.getJobs();
    return jobs.filter(job => job.isHomelessFriendly);
  }

  // Get appointments for specific user
  async getAppointmentsByUserId(userId: number): Promise<Appointment[]> {
    const appointments = await this.getAppointments();
    return appointments.filter(appointment => appointment.userId === userId);
  }

  // Get messages for specific user
  async getMessagesByUserId(userId: number): Promise<Message[]> {
    const messages = await this.getMessages();
    return messages.filter(message =>
      message.senderId === userId || message.receiverId === userId
    );
  }

  // Send message
  async sendMessage(messageData: Partial<Message>): Promise<Message> {
    try {
      const response = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('API Error for sending message:', error);
      throw error;
    }
  }

  // Create appointment
  async createAppointment(appointmentData: Partial<Appointment>): Promise<Appointment> {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('API Error for creating appointment:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export default
export default apiService;