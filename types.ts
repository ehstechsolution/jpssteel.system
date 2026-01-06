
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

export interface Budget {
  id: string;
  clientId: string;
  clientName: string;
  items: BudgetItem[];
  tax: number;
  discount: number;
  subtotal: number;
  total: number;
  validUntil: string;
  date: string;
}

export interface BudgetItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Movement {
  id: string;
  type: 'Entrada' | 'Saída';
  category: string;
  description: string;
  value: number;
  date: string;
  status: 'Confirmado' | 'Pendente';
}

export enum Page {
  Dashboard = 'dashboard',
  Clients = 'clients',
  Services = 'services',
  Budget = 'budget',
  Movements = 'movements',
  Settings = 'settings'
}
