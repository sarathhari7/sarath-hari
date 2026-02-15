# Personal Dashboard - Frontend

React TypeScript frontend for the Personal Dashboard application featuring Todo management and Budget tracking.

## Features

- **Budget Tracking**: Track income, expenses, and savings with real-time calculations
- **Todo Management**: Create, update, and manage your todos
- **Calendar View**: Visual calendar for planning
- **Recipe Book**: Browse recipes (placeholder feature)
- **Profile Management**: User profile settings
- **Dark Mode**: Toggle between light and dark themes
- **Real-time Data**: Live updates from Firebase backend

## Tech Stack

- **React 19** with TypeScript
- **shadcn/ui** with Radix UI primitives
- **Tailwind CSS** for styling
- **TanStack React Table** for data tables
- **React Router** for navigation
- **React Icons** for iconography

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running on `http://localhost:9000`

## Installation

1. Install dependencies:
```bash
cd client
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set the API URL:
```env
REACT_APP_API_URL=http://localhost:9000
```

## Running the Application

### Development Mode
```bash
npm start
```

The app will open at `http://localhost:9001`

### Production Build
```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## Project Structure

```
client/
├── public/
│   ├── index.html
│   └── favicon.svg
├── src/
│   ├── assets/          # Images, fonts, static files
│   ├── components/      # Reusable UI components
│   │   ├── calendar/
│   │   ├── card/
│   │   ├── navbar/
│   │   ├── sidebar/
│   │   ├── ui/         # shadcn/ui components
│   │   └── widget/
│   ├── layouts/         # Layout components
│   │   └── admin/
│   ├── services/        # API service layer
│   │   ├── api.ts
│   │   └── budgetService.ts
│   ├── views/           # Page components
│   │   └── admin/
│   │       ├── default/     # Budget Dashboard
│   │       ├── marketplace/ # Recipe Book
│   │       ├── profile/     # User Profile
│   │       └── todos/       # Todo Management
│   ├── App.tsx
│   ├── index.tsx
│   └── routes.tsx
├── .env                # Environment variables (gitignored)
├── .env.example        # Example environment file
├── components.json     # shadcn/ui configuration
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## Key Components

### Budget Dashboard (`/admin/default`)
- **Summary Cards**: Display total income, expenses, savings, and balance
- **Budget Table**: Comprehensive table with:
  - Source, Category, Purpose, Target, Stepup, Due Date, Expected, Actual
  - Current/Final toggle to view present vs projected end-of-month state
  - Color-coded variance indicators
  - Progress bars for SIP targets
  - Totals row with aggregated values

### Todo Management (`/admin/todos`)
- Create, edit, and delete todos
- Priority levels (Low, Medium, High)
- Status tracking (Pending, In Progress, Completed)
- Quick tasks section

### Calendar
- Mini calendar component
- Available in navbar dropdown

## API Integration

The frontend connects to the backend API for all data operations:

### Budget API Endpoints Used
- `GET /api/budget` - Fetch all transactions
- `GET /api/budget/summary` - Get totals
- `GET /api/budget/:id` - Get single transaction
- `POST /api/budget` - Create transaction
- `PUT /api/budget/:id` - Update transaction
- `DELETE /api/budget/:id` - Delete transaction

### API Service Layer
Located in `src/services/`:
- `api.ts` - Base API configuration and helper functions
- `budgetService.ts` - Budget-specific API calls

Example usage:
```typescript
import { getAllTransactions, createTransaction } from 'services/budgetService';

// Fetch all transactions
const response = await getAllTransactions();
if (response.success) {
  console.log(response.data);
}

// Create new transaction
const newTransaction = {
  source: 'Monthly Salary',
  category: 'Income',
  purpose: 'Primary income',
  dueDate: '01',
  amount: 75000
};
await createTransaction(newTransaction);
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server |
| `npm run build` | Create production build |
| `npm test` | Run test suite |
| `npm run eject` | Eject from Create React App (irreversible) |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:9000` |

## Color Theme

### Brand Colors
- **Primary**: `#18B7BE` (Cyan)
- **Secondary**: `#178CA4` (Teal)
- **Dark**: `#072A40` (Navy)

### Gradients
- Profile gradient: `linear-gradient(135deg, #18B7BE 0%, #178CA4 50%, #072A40 100%)`

## Troubleshooting

### API Connection Issues

**Problem**: Cannot connect to backend API

**Solutions**:
1. Ensure backend server is running on port 9000
2. Check `.env` file has correct `REACT_APP_API_URL`
3. Verify CORS is enabled on backend
4. Check browser console for network errors

### Build Errors

**Problem**: TypeScript compilation errors

**Solutions**:
1. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
2. Clear TypeScript cache: `rm -rf node_modules/.cache`
3. Check `tsconfig.json` for correct paths

### Loading Spinner Never Stops

**Problem**: Budget page shows loading forever

**Solutions**:
1. Open browser console to check for API errors
2. Verify backend is running: `curl http://localhost:9000/health`
3. Check if Firebase credentials are configured in backend
4. Seed database: `cd ../server && npm run seed:budget`

## Development Tips

### Adding New API Endpoints

1. Add types to service file:
```typescript
export interface NewType {
  id: string;
  name: string;
}
```

2. Create service function:
```typescript
export const getNewData = async (): Promise<ApiResponse<NewType[]>> => {
  return apiCall<NewType[]>('/api/new-endpoint');
};
```

3. Use in component:
```typescript
const [data, setData] = useState<NewType[]>([]);

useEffect(() => {
  const fetchData = async () => {
    const response = await getNewData();
    if (response.success && response.data) {
      setData(response.data);
    }
  };
  fetchData();
}, []);
```

### Adding shadcn/ui Components

```bash
npx shadcn@latest add <component-name>
```

Example:
```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Code splitting with React.lazy
- Image optimization
- Tailwind CSS purging in production
- React 19 concurrent features

## Credits

Built on top of [Horizon UI](https://horizon-ui.com/horizon-tailwind-react-ts) - Tailwind CSS React Admin Dashboard Template

## License

ISC
