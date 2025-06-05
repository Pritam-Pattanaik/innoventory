# Innoventory - IP Management Dashboard

A comprehensive multi-user dashboard for intellectual property management with admin and sub-admin functionality. Built with modern technologies including React.js, TypeScript, PostgreSQL, and Prisma ORM.

## Features

### 🎯 Multi-User System
- **Admin Dashboard**: Full access to all features and analytics
- **Sub-Admin Dashboard**: Personalized view with assigned permissions
- Role-based access control (RBAC)
- Permission management system

### 📊 Interactive Analytics
- Animated KPI cards with real-time data
- Interactive charts (Bar, Line, Doughnut) with clickable segments
- Geographic work distribution with interactive world map
- Yearly trends and country-wise breakdowns

### 🎨 Modern UI/UX
- Smooth animations using Anime.js and Framer Motion
- Responsive design with Tailwind CSS
- Interactive widgets and components
- Real-time data visualization

### 📈 Dashboard Features

#### Admin Dashboard
- **KPIs**: Total customers, vendors, IPs registered/closed
- **Geographic Distribution**: Interactive world map showing work distribution
- **Pending Work**: Top 10 pending items with urgency indicators
- **Pending Payments**: Payment tracking with visual indicators
- **Yearly Trends**: Multi-dataset charts for historical analysis

#### Sub-Admin Dashboard
- **Personalized Summary**: Assigned customers, vendors, and orders
- **Order Status Breakdown**: Visual representation of work progress
- **Assigned Pending Orders**: Priority-based task management
- **Recent Activity Log**: Personal activity tracking
- **Quick Actions**: Contextual action buttons based on permissions

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Anime.js, Framer Motion
- **Charts**: Chart.js, React-Chartjs-2
- **Maps**: Leaflet, React-Leaflet
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: JWT, bcryptjs
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Neon account)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd innoventory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database - Replace with your Neon database URL
   DATABASE_URL="postgresql://username:password@localhost:5432/innoventory?schema=public"

   # NextAuth
   NEXTAUTH_SECRET="your-secret-key-here-change-this-in-production"
   NEXTAUTH_URL="http://localhost:3000"

   # JWT
   JWT_SECRET="your-jwt-secret-here-change-this-in-production"

   # App
   NODE_ENV="development"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # Seed the database with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Demo Credentials

### Admin Access
- **Email**: admin@innoventory.com
- **Password**: admin123
- **Permissions**: Full access to all features

### Sub-Admin Access
- **Email**: subadmin@innoventory.com
- **Password**: subadmin123
- **Permissions**: Limited access (Customers, Orders, Analytics)
