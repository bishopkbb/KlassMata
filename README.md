# KlassMata - School Management System

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748)](https://www.prisma.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A comprehensive, modern school management platform built to streamline educational operations, enhance communication, and improve administrative efficiency. Designed for schools across Nigeria and beyond.

## 🎯 Overview

KlassMata is a full-stack SaaS solution that digitizes school operations, from student enrollment and attendance tracking to payments and academic performance monitoring. Built with scalability in mind, it supports multi-school deployments while maintaining data isolation and security.

**Aligned with UN SDG 4: Quality Education** - Ensuring inclusive, equitable education management.

## ✨ Key Features

### 👨‍💼 Administration
- **Multi-school Support**: Manage multiple schools from a single platform
- **Role-based Access Control**: Granular permissions for super admins, school admins, teachers, students, and parents
- **Subscription Management**: Built-in SaaS billing with multiple tier support
- **Comprehensive Analytics**: Real-time dashboards and performance metrics

### 👨‍🏫 Teacher Management
- **Invite System**: Secure email-based teacher onboarding with unique invite codes
- **Class & Subject Assignment**: Flexible assignment of teachers to classes and subjects
- **Performance Tracking**: Monitor teaching effectiveness and student outcomes

### 👨‍🎓 Student Management
- **Digital Student Profiles**: Complete student information with parent linkage
- **Enrollment Management**: Streamlined admission and registration processes
- **Academic Records**: Historical performance tracking and report cards

### 📚 Academic Operations
- **Attendance Tracking**: Quick mark with bulk actions, real-time sync, offline-first capability
- **Assignment Management**: Create, distribute, and grade assignments with deadline tracking
- **Exam Management**: Schedule exams, record results, generate gradebooks
- **Subject Management**: Curriculum planning and subject organization

### 💰 Financial Management
- **Integrated Payments**: Flutterwave and Paga payment gateway integration
- **Fee Management**: Invoice generation, payment tracking, and receipt automation
- **Subscription Billing**: Automated recurring billing for school subscriptions
- **Financial Reports**: Revenue tracking and payment analytics

### 📊 Reports & Analytics
- **Student Performance Reports**: Individual and class-level analytics
- **Attendance Reports**: Trends, patterns, and insights
- **Financial Summaries**: Revenue, outstanding payments, and forecasting
- **Custom Exports**: CSV and PDF report generation

### 🔐 Security & Authentication
- **JWT-based Authentication**: Secure, stateless authentication with NextAuth.js
- **Password Encryption**: Industry-standard bcrypt hashing
- **Session Management**: Secure session handling with automatic expiration
- **Email Verification**: Account activation via email confirmation

### 📧 Communication
- **Email Integration**: Powered by Resend for reliable email delivery
- **Teacher Invitations**: Automated invitation emails with onboarding links
- **Notifications**: In-app and email notifications for important events

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Lucide Icons
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Hooks

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes (RESTful)
- **ORM**: Prisma 5.0
- **Database**: MongoDB Atlas
- **Authentication**: NextAuth.js (JWT strategy)
- **Email**: Resend

### DevOps & Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Code Quality**: ESLint, Prettier
- **Type Checking**: TypeScript strict mode
- **Containerization**: Docker & Docker Compose
- **Deployment**: Vercel (recommended), Railway, AWS

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn
- MongoDB Atlas account (or local MongoDB 6.0+)
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/bishopkbb/klassMata.git
cd klassMata
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# App Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-secure-random-string-here

# Database
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/klassMata?retryWrites=true&w=majority

# Email (Resend)
RESEND_API_KEY=re_your_resend_api_key_here

# Payment Providers (Optional)
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
PAGA_PUBLIC_KEY=your_paga_public_key
PAGA_SECRET_KEY=your_paga_secret_key
```

**Generate secure secrets:**
```bash
# For NEXTAUTH_SECRET
openssl rand -base64 32
```

### 4. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to view/edit data
npx prisma studio
```

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🐳 Docker Deployment

### Development with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Docker Build

```bash
# Build image
docker build -t klassmata:latest .

# Run container
docker run -p 3000:3000 --env-file .env klassmata:latest
```

## 📁 Project Structure

```
klassmata/
├── app/                          # Next.js 15 App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   └── register/
│   ├── admin/                    # Admin dashboard
│   │   ├── dashboard/
│   │   ├── teachers/
│   │   ├── students/
│   │   └── settings/
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── teachers/             # Teacher management
│   │   ├── students/             # Student management
│   │   └── payments/             # Payment processing
│   ├── onboard/                  # Teacher onboarding
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── providers.tsx             # Context providers
├── components/                   # React components
│   ├── InviteTeacherButton.tsx
│   ├── PendingInvites.tsx
│   └── ...
├── lib/                          # Utility functions
│   ├── prisma.ts                 # Prisma client
│   ├── email.ts                  # Email service
│   └── email-templates.ts        # Email templates
├── prisma/                       # Database
│   └── schema.prisma             # Database schema
├── public/                       # Static assets
├── types/                        # TypeScript definitions
├── .env.example                  # Environment template
├── docker-compose.yml            # Docker setup
├── Dockerfile                    # Container config
├── next.config.js                # Next.js config
├── tailwind.config.ts            # Tailwind config
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies
```

## 🔑 Default Access

### Super Admin
- Email: `ajibade_tosin@yahoo.com`
- Automatically receives super admin privileges upon registration

### Teacher Registration
- Default role for new registrations
- Can also be invited by admins via secure invite system

### Invite-Based Onboarding
Teachers can be invited by school admins:
1. Admin sends invite via email
2. Teacher receives unique invite code
3. Teacher completes onboarding at `/onboard?code=INVITE_CODE`
4. Teacher account created and linked to school

## 📚 API Documentation

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login (via NextAuth)
- `GET /api/auth/session` - Get current session

### Teachers
- `GET /api/teachers` - List all teachers (school-specific)
- `POST /api/teachers/invite` - Send teacher invitation
- `GET /api/teachers/invite` - List pending invites
- `DELETE /api/teachers/invite/[id]` - Cancel invitation
- `POST /api/teachers/onboard` - Complete teacher onboarding
- `GET /api/teachers/onboard?code=` - Validate invite code

### Students
- `GET /api/students` - List all students
- `POST /api/students` - Create student
- `PUT /api/students/[id]` - Update student
- `DELETE /api/students/[id]` - Delete student

### Payments
- `POST /api/payments/initiate` - Initiate payment
- `POST /api/payments/webhook` - Payment webhook handler
- `GET /api/payments/[id]` - Get payment details

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage
```

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run type-check` | Run TypeScript compiler check |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run db:seed` | Seed database with sample data |

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway up
```

### Custom Server

```bash
# Build production bundle
npm run build

# Start production server
npm start
```

## 🔧 Configuration

### Email Setup (Resend)
1. Sign up at [resend.com](https://resend.com)
2. Get API key
3. Add to `.env`: `RESEND_API_KEY=re_...`
4. (Optional) Verify custom domain for branded emails

### Payment Integration
1. **Flutterwave**: Get keys from [flutterwave.com](https://flutterwave.com)
2. **Paga**: Get keys from [paga.com](https://paga.com)
3. Add keys to `.env`

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style
- Follow existing code patterns
- Use TypeScript strict mode
- Write meaningful commit messages
- Add tests for new features
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide](https://lucide.dev/)
- Email service by [Resend](https://resend.com/)

## 📞 Support

- **Email**: ajibade_tosin@yahoo.com
- **Documentation**: [docs.klassmata.com](https://docs.klassmata.com)
- **Issues**: [GitHub Issues](https://github.com/bishopkbb/klassmata/issues)
- **Discussions**: [GitHub Discussions](https://github.com/bishopkbb/klassMata/discussions)

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] SMS notifications integration
- [ ] Advanced analytics dashboard
- [ ] Parent portal
- [ ] Student portal
- [ ] Digital resources marketplace
- [ ] Video conferencing integration
- [ ] Multi-language support
- [ ] Offline mode for attendance

## 📈 Project Status

**Current Version**: 1.0.0  
**Status**: Active Development  
**Last Updated**: October 2025

---

Made with ❤️ for Nigerian schools
