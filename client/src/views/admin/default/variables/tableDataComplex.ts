type RowObj = {
	source: string;
	category: 'Income' | 'Expense' | 'Savings';
	purpose: string;
	target?: number;
	currentAmount?: number;
	stepupDate?: string;
	stepupAmount?: number;
	dueDate: string;
	expectedAmount?: number;
	amount: number;
};

const tableDataComplex: RowObj[] = [
	{
		source: 'Monthly Salary',
		category: 'Income',
		purpose: 'Primary income source',
		dueDate: '01',
		expectedAmount: 75000,
		amount: 75000
	},
	{
		source: 'Freelance Work',
		category: 'Income',
		purpose: 'Side projects and consulting',
		dueDate: '05',
		expectedAmount: 20000,
		amount: 25000
	},
	{
		source: 'House Rent',
		category: 'Expense',
		purpose: 'Monthly rent payment',
		dueDate: '05',
		expectedAmount: 18000,
		amount: 18000
	},
	{
		source: 'Groceries & Food',
		category: 'Expense',
		purpose: 'Monthly food expenses',
		dueDate: '15',
		expectedAmount: 7000,
		amount: 8000
	},
	{
		source: 'Utilities',
		category: 'Expense',
		purpose: 'Electricity, water, internet',
		dueDate: '10',
		expectedAmount: 3500,
		amount: 3500
	},
	{
		source: 'Car Loan EMI',
		category: 'Expense',
		purpose: 'Auto loan payment',
		dueDate: '07',
		expectedAmount: 12000,
		amount: 12000
	},
	{
		source: 'SIP - Equity Fund',
		category: 'Savings',
		purpose: 'Long-term wealth creation',
		target: 500000,
		currentAmount: 85000,
		stepupDate: 'March',
		stepupAmount: 500,
		dueDate: '10',
		expectedAmount: 5000,
		amount: 5000
	},
	{
		source: 'SIP - Debt Fund',
		category: 'Savings',
		purpose: 'Stable returns investment',
		target: 300000,
		currentAmount: 45000,
		stepupDate: 'June',
		stepupAmount: 300,
		dueDate: '15',
		expectedAmount: 3000,
		amount: 3000
	},
	{
		source: 'PPF',
		category: 'Savings',
		purpose: 'Retirement planning',
		target: 1500000,
		currentAmount: 280000,
		dueDate: '20',
		expectedAmount: 12500,
		amount: 12500
	},
	{
		source: 'Emergency Fund',
		category: 'Savings',
		purpose: 'Contingency savings',
		target: 300000,
		currentAmount: 125000,
		dueDate: '25',
		expectedAmount: 10000,
		amount: 10000
	}
];
export default tableDataComplex;
