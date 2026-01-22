
-- Script SQL para Criação do Banco de Dados
-- Associação dos Moradores da Praia do Meio

-- 1. Tabela de Usuários (Operadores do Sistema)
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Associados (Membros)
CREATE TABLE members (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    email VARCHAR(255),
    phone VARCHAR(20),
    birth_date DATE,
    join_date DATE NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    
    -- Dados de Endereço (Normalizado na mesma tabela para performance em sistemas pequenos)
    street VARCHAR(255),
    number VARCHAR(50),
    complement VARCHAR(255),
    neighborhood VARCHAR(100) DEFAULT 'Praia do Meio',
    zip_code VARCHAR(10),

    -- Auditoria
    created_by_id VARCHAR(36) REFERENCES users(id),
    created_by_name VARCHAR(255),
    updated_by_id VARCHAR(36) REFERENCES users(id),
    updated_by_name VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Tabela de Recebimentos (Entradas/Mensalidades)
CREATE TABLE payments (
    id VARCHAR(36) PRIMARY KEY,
    member_id VARCHAR(36) NOT NULL,
    month INT NOT NULL CHECK (month BETWEEN 0 AND 11),
    year INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending')),
    
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- 4. Tabela de Despesas (Saídas/Livro Caixa)
CREATE TABLE expenses (
    id VARCHAR(36) PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    created_by_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para otimização de buscas
CREATE INDEX idx_member_cpf ON members(cpf);
CREATE INDEX idx_payment_year_month ON payments(year, month);
CREATE INDEX idx_expense_date ON expenses(date);

-- Inserção do usuário administrador inicial
INSERT INTO users (id, name, username, password, role) 
VALUES ('admin', 'Administrador Geral', 'admin', '123456', 'admin');
