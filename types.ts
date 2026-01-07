
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

export interface Movement {
  id: string;
  tipo: 'Entrada' | 'Saída';
  categoria: string;
  descricao: string;
  valor: number;
  status: 'Pendente' | 'Cancelado' | 'Consolidado' | 'Arquivado';
  vencimento: string;
  observacao: string;
  idRelacionado: string;
  createdAt?: any;
}

export enum Page {
  Dashboard = 'dashboard',
  Clients = 'clients',
  Services = 'services',
  Budget = 'budget',
  Movements = 'movements',
  Settings = 'settings'
}
