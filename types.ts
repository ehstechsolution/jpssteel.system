
export interface Client {
  id: string;
  displayName: string;
  cnpj: string;
  fotoUrl: string;
  endereco: string;
  createdAt?: any;
}

export interface Representative {
  id: string;
  representanteName: string;
  telefone: string;
  email: string;
  setor: 'Comercial' | 'Operacional' | 'Logística' | 'Fiscal' | 'Outros';
  createdAt?: any;
}

export interface DefaultValues {
  gasolina: number;
  pedagio: number;
  alimentacao: number;
  valorHoraPadrao: number;
}

export interface Service {
  id: string;
  clientId: string;
  clientName: string;
  description: string;
  status: 'Pendente' | 'Em Andamento' | 'Concluído' | 'Cancelado';
  startDate: string;
  endDate: string;
  totalValue: number;
  paymentStatus: 'Aberto' | 'Pago' | 'Atrasado';
}

// Fix: Added missing Movement interface referenced in Dashboard and InventoryMovements components
export interface Movement {
  id: string;
  type: 'Entrada' | 'Saída';
  category: string;
  description: string;
  value: number;
  status: 'Confirmado' | 'Pendente';
  date: string;
}

// Fix: Changed Page from interface to enum to allow it to be used as both a type and a value in App.tsx and Layout.tsx
export enum Page {
  Dashboard = 'dashboard',
  Clients = 'clients',
  Services = 'services',
  Budget = 'budget',
  Movements = 'movements',
  Settings = 'settings'
}
