# MoneeBunny 💰🐰

MoneeBunny is a modern budgeting tool designed to help users manage their finances effectively. Built with Node.js, TypeScript, Express, and PostgreSQL with Prisma ORM.

## ✨ Features

- 🔐 **User Authentication** - Secure login and registration with JWT
- 💰 **Budget Management** - Create, update, delete, and retrieve budgets
- 📊 **Transaction Tracking** - Add, update, and monitor financial transactions
- 👤 **User Profile Management** - Manage user information and preferences
- 🔒 **Role-based Authorization** - Secure API endpoints with middleware
- ✅ **Input Validation** - Request validation with express-validator

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript 5.x (ES2022)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator

## 📁 Project Structure

```
MoneeBunny/
├── prisma/
│   └── schema.prisma          # Prisma database schema
├── src/
│   ├── app.ts                 # Application entry point
│   ├── config/
│   │   └── database.ts        # Prisma client configuration
│   ├── controllers/           # Request handlers
│   │   ├── authController.ts
│   │   ├── budgetController.ts
│   │   ├── transactionController.ts
│   │   └── userController.ts
│   ├── middleware/            # Express middleware
│   │   ├── auth.ts           # Authentication & authorization
│   │   └── validation.ts     # Request validation
│   ├── routes/               # API routes
│   │   ├── auth.ts
│   │   ├── budgets.ts
│   │   ├── transactions.ts
│   │   └── users.ts
│   ├── services/             # Business logic layer
│   │   ├── budgetService.ts
│   │   ├── transactionService.ts
│   │   └── userService.ts
│   └── types/                # TypeScript type definitions
│       ├── index.ts
│       └── express.d.ts      # Express type extensions
├── tests/                    # Test files
├── .env.example              # Environment variables template
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── README.md                # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jessie82923/MoneeBunny.git
   cd MoneeBunny
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file and configure it:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/moneebunny
   JWT_SECRET=your_jwt_secret_here
   PORT=3000
   NODE_ENV=development
   DEBUG=moneebunny:*
   ```

4. **Set up PostgreSQL database**
   
   Create a PostgreSQL database:
   ```bash
   # Connect to PostgreSQL
   sudo -u postgres psql
   
   # Create database and user
   CREATE USER monee WITH PASSWORD 'moneePWD';
   CREATE DATABASE moneebunny OWNER monee;
   GRANT ALL PRIVILEGES ON DATABASE moneebunny TO monee;
   \q
   ```

5. **Generate Prisma Client and push schema**
   ```bash
   # Generate Prisma Client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   ```

6. **Start the application**
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`.

## 📜 Available Scripts

```bash
npm start           # Start the application
npm run build       # Build TypeScript to JavaScript
npm test            # Run tests
npm run db:generate # Generate Prisma Client
npm run db:push     # Push schema to database (development)
npm run db:migrate  # Create and apply migrations
npm run db:studio   # Open Prisma Studio (database GUI)
npm run db:seed     # Seed the database with initial data
```

## 🗄️ Database Schema

### Models

- **User**: User accounts with authentication
- **Budget**: Budget plans with periods and amounts
- **Transaction**: Financial transactions linked to budgets

See `prisma/schema.prisma` for detailed schema definition.

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Budgets
- `POST /api/budgets` - Create new budget
- `GET /api/budgets` - Get all budgets
- `GET /api/budgets/:id` - Get budget by ID
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Transactions
- `POST /api/transactions` - Add new transaction
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get transaction by ID
- `PUT /api/transactions/:id` - Update transaction

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

## 🧪 Testing

```bash
npm test
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based authorization middleware
- Input validation and sanitization
- Environment variable configuration

## 📝 Development Notes

- Built with TypeScript 5.x targeting ES2022
- Follows RESTful API design principles
- Uses Prisma for type-safe database access
- Implements service layer pattern for business logic

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**jessie82923**

## 🙏 Acknowledgments

- Prisma for excellent ORM
- Express.js community
- TypeScript team