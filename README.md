# Cortex Base Backend

Um backend moderno para aplicação de notas com transcrição de áudio, construído com **Fastify**, **TypeScript** e **Drizzle ORM**.

## 🚀 Tecnologias

- **Node.js** com TypeScript (ESM)
- **Fastify** - Framework web rápido e eficiente
- **Drizzle ORM** - ORM type-safe para PostgreSQL
- **PostgreSQL** - Banco de dados principal
- **Zod** - Validação de schemas
- **JWT** - Autenticação
- **Google Gemini AI** - Processamento de IA
- **FFmpeg** - Processamento de áudio/vídeo
- **Vitest** - Testes unitários
- **Biome** - Linting e formatação

## 📋 Funcionalidades

### Autenticação
- Registro e login de usuários
- Autenticação JWT
- Hash seguro de senhas com bcrypt

### Gerenciamento de Notas
- Criação, listagem e visualização de notas
- Transcrição automática de áudio
- Resumos gerados por IA
- Organização em pastas com cores personalizáveis

### API Features
- Documentação automática com Swagger
- Rate limiting
- CORS configurado
- Validação de dados com Zod
- Upload de arquivos multipart

## 🛠️ Instalação

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL
- FFmpeg (para processamento de áudio)

### 1. Clone o repositório
```bash
git clone <repository-url>
cd cortex-base-backend
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o banco de dados
```bash
# Inicie o PostgreSQL com Docker
docker-compose up -d

# Ou configure manualmente no seu PostgreSQL local
```

### 4. Configure as variáveis de ambiente
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o .env com suas configurações
```

Variáveis necessárias:
```env
DATABASE_URL=postgresql://docker:docker@localhost:5432/cortex-base
JWT_SECRET=seu_jwt_secret_aqui
GEMINI_API_KEY=sua_chave_do_gemini_aqui
PORT=3333
```

### 5. Execute as migrações
```bash
# Gere as migrações
npm run db:generate

# Execute as migrações
npm run db:migrate

## 🚀 Execução
```

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
# Build
npm run build

# Start
npm start
```

### Testes
```bash
npm test
```

## 📚 Estrutura do Projeto

```
src/
├── config/          # Configurações (env)
├── db/              # Database
│   ├── schema/      # Schemas Drizzle (users, notes, folders)
│   ├── migrations/  # Migrações do banco
│   └── seed.ts      # Dados iniciais
├── middleware/      # Middlewares (auth)
├── plugins/         # Plugins Fastify
├── routes/          # Rotas da API
│   ├── auth/        # Autenticação
│   ├── notes/       # Gerenciamento de notas
│   └── folders/     # Gerenciamento de pastas
├── services/        # Serviços (Gemini AI, Media)
├── types/           # Definições TypeScript
└── utils/           # Utilitários
```

## 🔌 API Endpoints

### Autenticação
- `POST /api/v1/auth/register` - Registro de usuário
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Perfil do usuário

### Notas
- `GET /api/v1/notes` - Listar notas
- `POST /api/v1/notes` - Criar nota
- `GET /api/v1/notes/:id` - Obter nota
- `PUT /api/v1/notes/:id/folder` - Atribuir pasta à nota

### Pastas
- `GET /api/v1/folders` - Listar pastas
- `POST /api/v1/folders` - Criar pasta
- `GET /api/v1/folders/:id` - Obter pasta
- `PUT /api/v1/folders/:id/color` - Definir cor da pasta

### Documentação
- `GET /docs` - Swagger UI

## 🗄️ Schema do Banco

### Users
```sql
- id (UUID, PK)
- name (TEXT)
- email (TEXT, UNIQUE)
- password (TEXT, hashed)
- createdAt (TIMESTAMP)
```

### Folders
```sql
- id (UUID, PK)
- name (TEXT)
- color (TEXT, opcional)
- userId (UUID, FK)
- createdAt (TIMESTAMP)
```

### Notes
```sql
- id (UUID, PK)
- title (TEXT)
- summary (TEXT)
- transcription (TEXT)
- userId (UUID, FK)
- folderId (UUID, FK, opcional)
- createdAt (TIMESTAMP)
```

## 🛡️ Segurança

- Autenticação JWT
- Rate limiting configurado
- Helmet para headers de segurança
- Validação rigorosa de entrada com Zod
- Hash seguro de senhas

## 📝 Licença

Este projeto está sob a licença ISC.

---

**Projeto inspirado pelo NLW Agents da Rocketseat**
