
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

export interface NotificationSettings {
  diasMovimentacao: number;
  alertMovimentacao: boolean;
}

export interface Service {
  id: string;
  orcRelacionado: string;
  clienteRelacionado: string;
  nomeCliente: string;
  fotoCliente: string;
  dataServico: string;
  localServico: string;
  valorServico: number;
  statusServico: 'Aguardando início' | 'Em execução' | 'Concluido' | 'Cancelado' | 'Em análise';
  descricao: string;
  createdAt?: any;
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
  parcelaAtual?: number;
  totalParcelas?: number;
  createdAt?: any;
}

export interface Credential {
  id: string;
  titulo: string;
  usuario: string;
  senha: string;
  categoria: string;
  createdAt?: any;
}

export enum Page {
  Dashboard = 'dashboard',
  Clients = 'clients',
  Services = 'services',
  Budget = 'budget',
  Movements = 'movements',
  AllMovements = 'all_movements',
  Passwords = 'passwords',
  Settings = 'settings'
}
