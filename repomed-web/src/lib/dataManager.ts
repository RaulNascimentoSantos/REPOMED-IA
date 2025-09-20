/**
 * Data Manager - Handles all local data persistence for RepoMed IA
 * Provides CRUD operations using localStorage with proper error handling
 */

export interface Patient {
  id: string;
  nome: string;
  idade: string;
  telefone: string;
  email: string;
  endereco: string;
  condicoes: string[];
  statusBadge: string;
  statusColor: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  paciente: string;
  medicamentos: string[];
  dataEmissao: string;
  dataValidade: string;
  status: string;
  statusColor: string;
  crm: string;
  observacoes: string;
  numeroReceita: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  title: string;
  type: string;
  content: string;
  patient: string;
  createdAt: string;
  signed: boolean;
  signedAt?: string;
  template: string;
}

export interface Appointment {
  id: string;
  paciente: string;
  telefone: string;
  email: string;
  especialidade: string;
  tipoConsulta: string;
  observacoes: string;
  data: string;
  horario: string;
  status: 'agendado' | 'confirmado' | 'cancelado' | 'concluido';
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  template: string;
  fields: string[];
  usageCount: number;
  aiAssisted: boolean;
  legalCompliant: boolean;
  createdAt: string;
  updatedAt: string;
}

class DataManager {
  private static instance: DataManager;
  private storageKeys = {
    patients: 'repomed_patients',
    prescriptions: 'repomed_prescriptions',
    documents: 'repomed_documents',
    appointments: 'repomed_appointments',
    templates: 'repomed_templates',
    user: 'repomed_user',
    settings: 'repomed_settings'
  };

  private constructor() {
    this.initializeDefaultData();
  }

  public static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  private initializeDefaultData() {
    // Initialize with sample data if none exists
    if (!this.getPatients().length) {
      this.seedPatients();
    }
    if (!this.getPrescriptions().length) {
      this.seedPrescriptions();
    }
    if (!this.getTemplates().length) {
      this.seedTemplates();
    }
  }

  private getFromStorage<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return [];
    }
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // PATIENTS MANAGEMENT
  public getPatients(): Patient[] {
    return this.getFromStorage<Patient>(this.storageKeys.patients);
  }

  public getPatient(id: string): Patient | null {
    const patients = this.getPatients();
    return patients.find(p => p.id === id) || null;
  }

  public createPatient(patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Patient {
    const newPatient: Patient = {
      ...patientData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const patients = this.getPatients();
    patients.push(newPatient);
    this.saveToStorage(this.storageKeys.patients, patients);
    return newPatient;
  }

  public updatePatient(id: string, updates: Partial<Patient>): Patient | null {
    const patients = this.getPatients();
    const index = patients.findIndex(p => p.id === id);

    if (index === -1) return null;

    patients[index] = {
      ...patients[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveToStorage(this.storageKeys.patients, patients);
    return patients[index];
  }

  public deletePatient(id: string): boolean {
    const patients = this.getPatients();
    const filtered = patients.filter(p => p.id !== id);

    if (filtered.length === patients.length) return false;

    this.saveToStorage(this.storageKeys.patients, filtered);
    return true;
  }

  // PRESCRIPTIONS MANAGEMENT
  public getPrescriptions(): Prescription[] {
    return this.getFromStorage<Prescription>(this.storageKeys.prescriptions);
  }

  public createPrescription(prescriptionData: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt' | 'numeroReceita'>): Prescription {
    const prescriptions = this.getPrescriptions();
    const receiptNumber = `RX-${new Date().getFullYear()}-${(prescriptions.length + 1).toString().padStart(4, '0')}`;

    const newPrescription: Prescription = {
      ...prescriptionData,
      id: this.generateId(),
      numeroReceita: receiptNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    prescriptions.push(newPrescription);
    this.saveToStorage(this.storageKeys.prescriptions, prescriptions);
    return newPrescription;
  }

  public updatePrescription(id: string, updates: Partial<Prescription>): Prescription | null {
    const prescriptions = this.getPrescriptions();
    const index = prescriptions.findIndex(p => p.id === id);

    if (index === -1) return null;

    prescriptions[index] = {
      ...prescriptions[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveToStorage(this.storageKeys.prescriptions, prescriptions);
    return prescriptions[index];
  }

  // DOCUMENTS MANAGEMENT
  public getDocuments(): Document[] {
    return this.getFromStorage<Document>(this.storageKeys.documents);
  }

  public createDocument(documentData: Omit<Document, 'id' | 'createdAt' | 'signed'>): Document {
    const newDocument: Document = {
      ...documentData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      signed: false
    };

    const documents = this.getDocuments();
    documents.push(newDocument);
    this.saveToStorage(this.storageKeys.documents, documents);
    return newDocument;
  }

  public signDocument(id: string): boolean {
    const documents = this.getDocuments();
    const index = documents.findIndex(d => d.id === id);

    if (index === -1) return false;

    documents[index].signed = true;
    documents[index].signedAt = new Date().toISOString();

    this.saveToStorage(this.storageKeys.documents, documents);
    return true;
  }

  // APPOINTMENTS MANAGEMENT
  public getAppointments(): Appointment[] {
    return this.getFromStorage<Appointment>(this.storageKeys.appointments);
  }

  public createAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Appointment {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: this.generateId(),
      status: 'agendado',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const appointments = this.getAppointments();
    appointments.push(newAppointment);
    this.saveToStorage(this.storageKeys.appointments, appointments);
    return newAppointment;
  }

  public updateAppointmentStatus(id: string, status: Appointment['status']): boolean {
    const appointments = this.getAppointments();
    const index = appointments.findIndex(a => a.id === id);

    if (index === -1) return false;

    appointments[index].status = status;
    appointments[index].updatedAt = new Date().toISOString();

    this.saveToStorage(this.storageKeys.appointments, appointments);
    return true;
  }

  // TEMPLATES MANAGEMENT
  public getTemplates(): Template[] {
    return this.getFromStorage<Template>(this.storageKeys.templates);
  }

  public createTemplate(templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Template {
    const newTemplate: Template = {
      ...templateData,
      id: this.generateId(),
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const templates = this.getTemplates();
    templates.push(newTemplate);
    this.saveToStorage(this.storageKeys.templates, templates);
    return newTemplate;
  }

  public incrementTemplateUsage(id: string): void {
    const templates = this.getTemplates();
    const index = templates.findIndex(t => t.id === id);

    if (index !== -1) {
      templates[index].usageCount++;
      templates[index].updatedAt = new Date().toISOString();
      this.saveToStorage(this.storageKeys.templates, templates);
    }
  }

  // SEED DATA
  private seedPatients(): void {
    const patients: Patient[] = [
      {
        id: '1',
        nome: 'Maria Silva Santos',
        idade: '45 anos',
        telefone: '(11) 99999-9999',
        email: 'maria.santos@email.com',
        endereco: 'São Paulo, SP',
        condicoes: ['Diabetes Tipo 2', 'Hipertensão'],
        statusBadge: 'Estável',
        statusColor: 'bg-green-500',
        avatar: 'MS',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        nome: 'João Carlos Oliveira',
        idade: '62 anos',
        telefone: '(11) 88888-8888',
        email: 'joao.oliveira@email.com',
        endereco: 'São Paulo, SP',
        condicoes: ['Cardiopatia', 'Colesterol Alto'],
        statusBadge: 'Atenção',
        statusColor: 'bg-yellow-500',
        avatar: 'JC',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        nome: 'Ana Paula Costa',
        idade: '38 anos',
        telefone: '(11) 77777-7777',
        email: 'ana.costa@email.com',
        endereco: 'São Paulo, SP',
        condicoes: ['Enxaqueca', 'Ansiedade'],
        statusBadge: 'Estável',
        statusColor: 'bg-green-500',
        avatar: 'AP',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    this.saveToStorage(this.storageKeys.patients, patients);
  }

  private seedPrescriptions(): void {
    const prescriptions: Prescription[] = [
      {
        id: '1',
        paciente: 'Maria Silva Santos',
        medicamentos: ['Metformina 850mg', 'Insulina NPH', 'Ácido Fólico 5mg'],
        dataEmissao: '2024-01-15',
        dataValidade: '2024-04-15',
        status: 'Ativa',
        statusColor: 'bg-green-500',
        crm: 'CRM SP 123456',
        observacoes: 'Tomar metformina após as refeições',
        numeroReceita: 'RX-2024-0001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    this.saveToStorage(this.storageKeys.prescriptions, prescriptions);
  }

  private seedTemplates(): void {
    const templates: Template[] = [
      {
        id: '1',
        title: 'Receita Médica Simples',
        description: 'Template padrão para prescrições de medicamentos controlados e não controlados',
        category: 'receita',
        usageCount: 156,
        aiAssisted: true,
        legalCompliant: true,
        fields: ['Paciente', 'Medicamento', 'Posologia', 'Quantidade', 'Orientações'],
        template: `RECEITA MÉDICA

Paciente: [NOME_PACIENTE]
Data de Nascimento: [DATA_NASCIMENTO]
Endereço: [ENDERECO_PACIENTE]

Prescrevo:

1. [MEDICAMENTO_1]
   Posologia: [POSOLOGIA_1]
   Quantidade: [QUANTIDADE_1]

Orientações Gerais:
[ORIENTACOES_MEDICAS]

Data: [DATA_CONSULTA]

_____________________________
Dr. [NOME_MEDICO]
CRM: [CRM_NUMERO]`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    this.saveToStorage(this.storageKeys.templates, templates);
  }

  // UTILITY METHODS
  public clearAllData(): void {
    Object.values(this.storageKeys).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  public exportData(): string {
    const allData = {
      patients: this.getPatients(),
      prescriptions: this.getPrescriptions(),
      documents: this.getDocuments(),
      appointments: this.getAppointments(),
      templates: this.getTemplates()
    };
    return JSON.stringify(allData, null, 2);
  }

  public importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);

      if (data.patients) this.saveToStorage(this.storageKeys.patients, data.patients);
      if (data.prescriptions) this.saveToStorage(this.storageKeys.prescriptions, data.prescriptions);
      if (data.documents) this.saveToStorage(this.storageKeys.documents, data.documents);
      if (data.appointments) this.saveToStorage(this.storageKeys.appointments, data.appointments);
      if (data.templates) this.saveToStorage(this.storageKeys.templates, data.templates);

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

export const dataManager = DataManager.getInstance();