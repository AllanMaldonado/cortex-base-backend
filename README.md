# 🧠 Cortex Base Backend

> Backend moderno para aplicação de notas com transcrição de áudio via IA, construído com Fastify, TypeScript e Drizzle ORM.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-5.4-black?logo=fastify)](https://fastify.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue?logo=postgresql)](https://www.postgresql.org/)
[![Tests](https://img.shields.io/badge/Tests-27%20passed-brightgreen)](./tests)

---

## ✨ Funcionalidades

### 🔐 Autenticação & Usuários
- **Registro e Login** com validação robusta
- **Autenticação JWT** (token expira em 1 dia)
- **Hash bcrypt** de senhas (10 rounds)
- **Gerenciamento de perfil** (atualização e exclusão)
- **Alteração de senha** com validação

### 📝 Notas Inteligentes
- **Upload de áudio/vídeo** (conversão automática para MP3)
- **Transcrição via Google Gemini AI** (português brasileiro)
- **Geração automática de título e resumo** via IA
- **CRUD completo** (criar, ler, atualizar, deletar)
- **Busca full-text** em título, resumo e transcrição
- **Paginação e ordenação** customizáveis
- **Limite de 76KB** por arquivo (otimizado para Gemini)

### 📁 Organização com Pastas
- **Criação e gerenciamento** de pastas
- **Cores personalizáveis** para organização visual
- **Associação de notas** a pastas
- **Listagem de notas** por pasta com busca e paginação
- **Desassociação automática** ao deletar pasta (SET NULL)

### 🚀 Features da API
- **Documentação automática** com Swagger UI (`/docs`)
- **Rate limiting** (100 req/min)
- **CORS configurável**
- **Validação de schemas** com Zod
- **Type-safe** com TypeScript
- **Logs estruturados** com Fastify Logger
- **Headers de segurança** com Helmet

---

## 🛠️ Stack Tecnológica

| Categoria | Tecnologia |
|-----------|-----------|
| **Runtime** | Node.js 18+ (ESM) |
| **Linguagem** | TypeScript 5.8 |
| **Framework** | Fastify 5.4 |
| **Banco de Dados** | PostgreSQL 17 |
| **ORM** | Drizzle ORM 0.44 |
| **Validação** | Zod 4.0 |
| **Autenticação** | JWT (@fastify/jwt) |
| **IA** | Google Gemini 2.5 Flash |
| **Processamento** | FFmpeg (vídeo → áudio) |
| **Testes** | Vitest 3.2 |
| **Linting** | Biome 2.1 |

---

## 📦 Instalação

### Pré-requisitos
```bash
# Certifique-se de ter instalado:
- Node.js 18+
- PostgreSQL
- FFmpeg (para conversão de vídeo)
```

### 1️⃣ Clone e instale
```bash
git clone <repository-url>
cd cortex-base-backend
npm install
```

### 2️⃣ Configure o ambiente
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite com suas configurações
nano .env
```

**Variáveis obrigatórias:**
```env
DATABASE_URL=postgresql://docker:docker@localhost:5432/cortex-base
SECRET_KEY=seu_secret_jwt_super_seguro_aqui
GEMINI_API_KEY=sua_chave_google_gemini_aqui
PORT=3333
CORS_ORIGIN=http://localhost:3000  # Opcional
```

### 3️⃣ Inicie o banco de dados
```bash
# Com Docker (recomendado)
docker-compose up -d

# Ou configure PostgreSQL manualmente
```

### 4️⃣ Execute as migrações
```bash
# Gera arquivos de migração (se modificou schema)
npm run db:generate

# Aplica migrações no banco
npm run db:migrate

# Opcional: Seed para dados de teste
npm run db:seed
```

### 5️⃣ Inicie o servidor
```bash
# Modo desenvolvimento (hot reload)
npm run dev

# Modo produção
npm run build
npm start
```

🎉 **Servidor rodando em:** `http://localhost:3333`  
📚 **Documentação Swagger:** `http://localhost:3333/docs`

---

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Modo watch (desenvolvimento)
npm test -- --watch

# Coverage (se configurado)
npm test -- --coverage
```

**Cobertura de testes:**
- ✅ Autenticação (registro, login, JWT)
- ✅ CRUD de Notas (com isolamento entre usuários)
- ✅ CRUD de Pastas
- ✅ Upload e validação de arquivos
- ✅ Constraints do banco (CASCADE, SET NULL)
- ✅ Segurança (acesso não autorizado)

**27 testes passando** 🎯

---

## 📁 Estrutura do Projeto

```
cortex-base-backend/
├── src/
│   ├── config/              # Configuração (env vars)
│   ├── db/
│   │   ├── schema/          # Schemas Drizzle (users, notes, folders)
│   │   ├── migrations/      # Migrações SQL geradas
│   │   ├── connection.ts    # Conexão PostgreSQL
│   │   └── seed.ts          # Dados iniciais
│   ├── middleware/
│   │   └── authenticate.ts  # Middleware JWT
│   ├── plugins/
│   │   └── index.ts         # Plugins Fastify (CORS, JWT, Swagger, etc)
│   ├── routes/
│   │   ├── auth/            # Login, registro, perfil
│   │   ├── notes/           # CRUD + busca + upload
│   │   ├── folders/         # CRUD de pastas
│   │   ├── users/           # Gerenciamento de usuário
│   │   └── index.ts         # Registro de rotas
│   ├── services/
│   │   ├── gemini.ts        # Integração Gemini AI
│   │   └── media.ts         # Processamento FFmpeg
│   ├── types/               # Type definitions
│   ├── utils/               # Hash, helpers
│   ├── app.ts               # Configuração Fastify
│   └── server.ts            # Entry point
├── tests/                   # Testes Vitest
├── docker-compose.yml       # PostgreSQL container
├── drizzle.config.ts        # Config Drizzle ORM
└── package.json
```

---

## 🔌 API Endpoints

### 🔐 Autenticação
```http
POST   /api/v1/auth/register    # Criar conta
POST   /api/v1/auth/login       # Login (retorna JWT)
GET    /api/v1/auth/me          # Perfil autenticado
```

### 👤 Usuários
```http
PUT    /api/v1/users/me         # Atualizar perfil
PUT    /api/v1/users/password   # Alterar senha
DELETE /api/v1/users/me         # Deletar conta
```

### 📝 Notas
```http
GET    /api/v1/notes                    # Listar (paginação, filtros)
POST   /api/v1/notes                    # Criar (upload áudio/vídeo)
GET    /api/v1/notes/search?q=termo     # Buscar
GET    /api/v1/notes/:id                # Obter uma nota
PUT    /api/v1/notes/:id                # Atualizar
DELETE /api/v1/notes/:id                # Deletar
PUT    /api/v1/notes/:id/folder         # Associar a pasta
```

### 📁 Pastas
```http
GET    /api/v1/folders              # Listar pastas
POST   /api/v1/folders              # Criar pasta
GET    /api/v1/folders/:id          # Obter pasta
PUT    /api/v1/folders/:id          # Atualizar pasta
DELETE /api/v1/folders/:id          # Deletar pasta
PUT    /api/v1/folders/:id/color    # Definir cor
GET    /api/v1/folders/:id/notes    # Notas da pasta (paginação)
```

### 📚 Outros
```http
GET    /api/v1/health    # Health check
GET    /docs             # Swagger UI
```

---

## 💡 Exemplos de Uso

### Registro e Login
```bash
# Registrar
curl -X POST http://localhost:3333/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "senha123"
  }'

# Login (salve o token)
curl -X POST http://localhost:3333/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

### Upload de Nota
```bash
curl -X POST http://localhost:3333/api/v1/notes \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -F "file=@audio.mp3"
```

### Listar Notas com Paginação
```bash
curl "http://localhost:3333/api/v1/notes?page=1&limit=10&sortBy=createdAt&order=desc" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# Resposta:
{
  "message": "Notes retrieved successfully",
  "notes": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45
  }
}
```

### Buscar Notas
```bash
curl "http://localhost:3333/api/v1/notes/search?q=reunião" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Criar Pasta
```bash
curl -X POST http://localhost:3333/api/v1/folders \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Trabalho",
    "color": "#FF5733"
  }'
```

---

## 🗄️ Schema do Banco de Dados

### 👤 `users`
| Campo | Tipo | Constraints |
|-------|------|-------------|
| id | UUID | PK, DEFAULT random |
| name | TEXT | NOT NULL |
| email | TEXT | NOT NULL, UNIQUE |
| password_hash | TEXT | NOT NULL |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW |

### 📁 `folders`
| Campo | Tipo | Constraints |
|-------|------|-------------|
| id | UUID | PK, DEFAULT random |
| name | TEXT | NOT NULL |
| color | TEXT | NULL |
| user_id | UUID | FK → users(id) ON DELETE CASCADE |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW |

**Índices:** `folders_user_id_idx`

### 📝 `notes`
| Campo | Tipo | Constraints |
|-------|------|-------------|
| id | UUID | PK, DEFAULT random |
| title | TEXT | NOT NULL |
| summary | TEXT | NOT NULL |
| transcription | TEXT | NOT NULL |
| user_id | UUID | FK → users(id) ON DELETE CASCADE |
| folder_id | UUID | FK → folders(id) ON DELETE SET NULL |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW |

**Índices:** `notes_user_id_idx`, `notes_folder_id_idx`, `notes_created_at_idx`

**Relacionamentos:**
- Deletar usuário → Deleta todas suas notas e pastas (CASCADE)
- Deletar pasta → Notas ficam sem pasta (SET NULL)

---

## 🛡️ Segurança

- ✅ **JWT Authentication** com expiração de 1 dia
- ✅ **Bcrypt** para hash de senhas (10 rounds)
- ✅ **Rate Limiting** (100 req/min)
- ✅ **Helmet** para headers HTTP seguros
- ✅ **Validação rigorosa** com Zod em todos os endpoints
- ✅ **Isolamento de dados** entre usuários
- ✅ **CORS** configurável
- ✅ **SQL Injection** prevenido (ORM com prepared statements)


---

## 📝 Scripts Disponíveis

```bash
npm run dev          # Servidor em modo watch
npm start            # Servidor em produção
npm run build        # Build TypeScript
npm test             # Rodar testes
npm run db:generate  # Gerar migrações
npm run db:migrate   # Aplicar migrações
npm run db:seed      # Popular banco com dados
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---
