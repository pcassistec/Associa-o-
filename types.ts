
export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  zipCode: string;
}

export interface Member {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  address: Address;
  joinDate: string;
  birthDate: string; // ISO date string YYYY-MM-DD
  active: boolean;
  // Campos de Auditoria
  createdById?: string;
  createdByName?: string;
  updatedById?: string;
  updatedByName?: string;
  updatedAt?: string;
}

export type PaymentMethod = 'Pix' | 'Dinheiro' | 'Cartão de Débito' | 'Cartão de Crédito' | 'Transferência' | 'Outro';

export interface Payment {
  id: string;
  memberId: string;
  month: number; // 0-11
  year: number;
  amount: number;
  paymentDate: string;
  status: 'paid' | 'pending';
  paymentMethod?: PaymentMethod;
  createdByName?: string; // Quem registrou o pagamento
}

export interface Expense {
  id: string;
  category: 'Manutenção' | 'Utilidades' | 'Administrativo' | 'Eventos' | 'Outros';
  description: string;
  amount: number;
  date: string;
  paymentMethod?: PaymentMethod;
  createdByName: string;
  createdAt: string;
}

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
}

export type AppView = 'dashboard' | 'members' | 'addresses' | 'payments' | 'reports' | 'users' | 'settings' | 'finance' | 'cashflow';
