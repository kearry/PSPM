# Personal Stock Market Manager

A comprehensive, local-first stock portfolio management application built with Next.js, Prisma, and TailwindCSS.

![Stock Market Manager Dashboard](https://via.placeholder.com/1200x600?text=Stock+Manager+Dashboard)

## Features

- **Dashboard**: Visual overview of portfolio value, sector allocation, and recent activity
- **Stocks Management**: Track stocks with tickers, names, and sectors
- **Transaction Tracking**: Record buy and sell transactions with quantity, price, and date
- **Notes System**: Attach notes to stocks and transactions
- **Portfolio Analytics**: View average price, total holdings, and value calculations
- **Data Export**: Export transactions to CSV format
- **Dark/Light Mode**: Toggle between themes for comfortable viewing
- **Responsive Design**: Works on desktop and mobile devices
- **Local Database**: All data stored locally in SQLite for privacy

## Tech Stack

- **Frontend**: React + Next.js (App Router)
- **Backend**: Next.js server actions
- **Database**: SQLite (via Prisma ORM)
- **ORM**: Prisma for type-safe database operations
- **Styling**: TailwindCSS with shadcn/ui components
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Date Handling**: date-fns for date manipulation
- **Theme**: next-themes for dark/light mode

## Prerequisites

- Node.js 18+ and npm
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/stock-market-manager.git
cd stock-market-manager
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npx prisma db push
npx prisma generate
```

4. Seed the database with sample data:
```bash
npx prisma db seed
```

5. Start the development server:
```bash
npm run dev
```

6. Open your browser and navigate to http://localhost:3000

## Usage Guide

### Dashboard

The dashboard provides an overview of your portfolio with:
- Total portfolio value
- Sector breakdown chart
- Recent transactions
- Stock holdings summary

### Stocks

Manage your stock information:
- Add stocks with ticker symbol, company name, and sector
- Filter and sort your stock list
- Click on a stock to view detailed information and transaction history

### Transactions

Record your stock transactions:
- Log buy and sell orders
- Include quantity, price per share, and transaction date
- View transaction history by stock or across your portfolio

### Notes

Keep track of your investment research:
- Add notes to specific stocks
- Add context to transactions
- Review all notes in one place

### Settings

Configure your application:
- Update user profile information
- Toggle between light and dark theme
- Export transaction data to CSV
- View sector categories

## Database Schema

The application uses the following data models:

- **User**: User profile information
- **Stock**: Stock details with ticker, name, and sector
- **Transaction**: Buy/sell transactions with quantity, price, and date
- **Note**: Notes that can be attached to stocks or transactions
- **Sector**: Industry categories for stocks
- **AuditLog**: Record of major actions for data integrity

## Development

### Project Structure

```
stock-manager/
├── prisma/                  # Database schema and configuration
├── public/                  # Static assets
└── src/
    ├── actions/             # Server actions for data operations
    ├── app/                 # Next.js App Router pages
    ├── components/          # React components
    │   ├── dashboard/       # Dashboard-specific components
    │   ├── layout/          # Layout components
    │   ├── notes/           # Note-related components
    │   ├── settings/        # Settings-related components
    │   ├── stocks/          # Stock-related components
    │   ├── transactions/    # Transaction-related components
    │   └── ui/              # UI components from shadcn/ui
    ├── hooks/               # Custom React hooks
    ├── lib/                 # Utility functions and config
    └── providers/           # Context providers
```

### Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm start`: Start the production server
- `npm run lint`: Run ESLint to check for issues
- `npm run db:push`: Push schema changes to the database
- `npm run db:studio`: Open Prisma Studio to inspect the database
- `npm run db:seed`: Seed the database with sample data

## Data Persistence

All data is stored in a local SQLite database file. The database file is located at:

```
prisma/dev.db
```

You can back up this file to preserve your data.

## Customization

### Adding New Features

To add new features:

1. Update the Prisma schema if new data models are needed
2. Create server actions in the `src/actions` directory
3. Add UI components in the `src/components` directory
4. Create routes in the `src/app` directory using the Next.js App Router

### Styling

The application uses TailwindCSS for styling. You can customize the theme in:

```
tailwind.config.js
```

## Troubleshooting

### Common Issues

1. **Database connection errors**:
   - Ensure the SQLite database file exists
   - Check that Prisma is properly configured

2. **UI inconsistencies**:
   - Clear browser cache
   - Ensure TailwindCSS classes are applied correctly

3. **Data not updating**:
   - Verify server actions are properly revalidating paths
   - Check browser console for errors

### Database Inspection

Use Prisma Studio to directly inspect and modify the database:

```bash
npx prisma studio
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [TailwindCSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/)

---

Created by [Your Name] - [Your Website/GitHub]