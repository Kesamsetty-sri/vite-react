import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
// Note: jspdf would need to be installed in a real project: npm install jspdf
// For this preview, we'll just mock the export function.
// import jsPDF from 'jspdf';

// --- Mock Data ---
const initialCustomers = [
  { id: 1, name: 'Aarav Sharma', email: 'aarav@shop.com' },
  { id: 2, name: 'Priya Singh', email: 'priya@shop.com' },
  { id: 3, name: 'Rohan Gupta', email: 'rohan@shop.com' },
  { id: 4, name: 'Sneha Patel', email: 'sneha@shop.com' },
  { id: 5, name: 'Vikram Kumar', email: 'vikram@shop.com' },
  { id: 6, name: 'Anjali Reddy', email: 'anjali@shop.com' },
  { id: 7, name: 'Mohammed Khan', email: 'mohammed@shop.com' },
  { id: 8, name: 'Diya Mehta', email: 'diya@shop.com' },
  { id: 9, name: 'Kabir Joshi', email: 'kabir@shop.com' },
  { id: 10, name: 'Ishaan Verma', email: 'ishaan@shop.com' },
];

const initialLoans = [
  // Aarav Sharma
  { id: 101, customerId: 1, itemSold: 'Groceries', amount: 1500, dueDate: '2025-05-15', repayments: [{ amount: 500, date: '2025-05-01' }] },
  { id: 102, customerId: 1, itemSold: 'Milk Subscription', amount: 600, dueDate: '2025-06-01', repayments: [] },
  // Priya Singh
  { id: 201, customerId: 2, itemSold: 'Tailoring Service', amount: 2500, dueDate: '2025-04-20', repayments: [{ amount: 1000, date: '2025-04-15' }, { amount: 1000, date: '2025-04-25' }] }, // Overdue
  { id: 202, customerId: 2, itemSold: 'Fabric', amount: 800, dueDate: '2025-05-25', repayments: [] },
  // Rohan Gupta
  { id: 301, customerId: 3, itemSold: 'Snacks & Drinks', amount: 1200, dueDate: '2025-05-10', repayments: [{ amount: 1200, date: '2025-05-05' }] }, // Fully paid
  // Sneha Patel
  { id: 401, customerId: 4, itemSold: 'Vegetables', amount: 750, dueDate: '2025-05-18', repayments: [] },
  { id: 402, customerId: 4, itemSold: 'Cooking Oil', amount: 400, dueDate: '2025-06-05', repayments: [] },
  // Vikram Kumar
  { id: 501, customerId: 5, itemSold: 'Hardware Supplies', amount: 3200, dueDate: '2025-04-30', repayments: [{ amount: 1000, date: '2025-04-28' }] }, // Overdue
  // Anjali Reddy
  { id: 601, customerId: 6, itemSold: 'Stationery', amount: 550, dueDate: '2025-05-22', repayments: [] },
  // Mohammed Khan
  { id: 701, customerId: 7, itemSold: 'Phone Recharge', amount: 300, dueDate: '2025-05-08', repayments: [{ amount: 300, date: '2025-05-02' }] }, // Fully paid
  // Diya Mehta
  { id: 801, customerId: 8, itemSold: 'Cosmetics', amount: 1800, dueDate: '2025-06-10', repayments: [] },
  // Kabir Joshi
  { id: 901, customerId: 9, itemSold: 'Dairy Products', amount: 950, dueDate: '2025-05-28', repayments: [] },
  // Ishaan Verma
  { id: 1001, customerId: 10, itemSold: 'Cleaning Supplies', amount: 650, dueDate: '2025-05-12', repayments: [] },
];

// --- Utility Functions ---
const calculateRemainingBalance = (loan) => {
  const totalRepaid = loan.repayments.reduce((sum, repayment) => sum + repayment.amount, 0);
  return loan.amount - totalRepaid;
};

const isLoanOverdue = (loan) => {
  const remaining = calculateRemainingBalance(loan);
  return remaining > 0 && new Date(loan.dueDate) < new Date();
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
};

// --- Context API for State Management ---
const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [customers, setCustomers] = useState(() => {
      const savedCustomers = localStorage.getItem('crediKhaataCustomers');
      return savedCustomers ? JSON.parse(savedCustomers) : initialCustomers;
  });
  const [loans, setLoans] = useState(() => {
      const savedLoans = localStorage.getItem('crediKhaataLoans');
      return savedLoans ? JSON.parse(savedLoans) : initialLoans;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('crediKhaataUser'));
  const [currentPage, setCurrentPage] = useState(isAuthenticated ? 'dashboard' : 'login'); // 'login', 'dashboard', 'customerDetail', 'addCustomer', 'addLoan', 'recordRepayment'
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedLoanId, setSelectedLoanId] = useState(null); // For repayment form
  const [theme, setTheme] = useState(() => localStorage.getItem('crediKhaataTheme') || 'light'); // 'light' or 'dark'
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' }); // type: 'success' or 'error'

  // Persist data to localStorage
  useEffect(() => {
    localStorage.setItem('crediKhaataCustomers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('crediKhaataLoans', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    if (isAuthenticated) {
        localStorage.setItem('crediKhaataUser', 'loggedIn'); // Store a simple flag
        setCurrentPage('dashboard');
    } else {
        localStorage.removeItem('crediKhaataUser');
        setCurrentPage('login');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('crediKhaataTheme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // --- Actions ---
  const login = (email, password) => {
    // Mock login - in reality, you'd call an API
    console.log('Attempting login for:', email);
    if (email === 'shopkeeper@test.com' && password === 'password') {
      setIsAuthenticated(true);
      showToast('Login successful!', 'success');
      return true;
    }
    showToast('Invalid credentials.', 'error');
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    showToast('Logged out.', 'success');
  };

  const addCustomer = (name, email) => {
    const newCustomer = {
      id: Date.now(), // Simple unique ID generation
      name,
      email,
    };
    setCustomers([...customers, newCustomer]);
    showToast('Customer added successfully!', 'success');
    setCurrentPage('dashboard');
  };

  const addLoan = (customerId, itemSold, amount, dueDate) => {
    const newLoan = {
      id: Date.now(),
      customerId: parseInt(customerId, 10), // Ensure customerId is a number
      itemSold,
      amount: parseFloat(amount), // Ensure amount is a number
      dueDate,
      repayments: [],
    };
    setLoans([...loans, newLoan]);
    showToast('Loan added successfully!', 'success');
    setCurrentPage('customerDetail'); // Go back to the customer's detail page
    setSelectedCustomerId(parseInt(customerId, 10)); // Ensure the correct customer page is shown
  };

  const recordRepayment = (loanId, repaymentAmount, repaymentDate) => {
      setLoans(prevLoans =>
          prevLoans.map(loan => {
              if (loan.id === loanId) {
                  // Find the customer ID before updating
                  const currentCustomerId = loan.customerId;
                  // Check if repayment exceeds remaining balance
                  const remaining = calculateRemainingBalance(loan);
                  const amountToRecord = Math.min(parseFloat(repaymentAmount), remaining);

                  if (amountToRecord <= 0) {
                       showToast('Repayment amount must be positive and not exceed the remaining balance.', 'error');
                       return loan; // Return unchanged loan if invalid amount
                  }

                   const updatedRepayments = [
                      ...loan.repayments,
                      { amount: amountToRecord, date: repaymentDate }
                  ];
                  // Update selectedCustomerId here to ensure we return to the correct page
                  setSelectedCustomerId(currentCustomerId);
                  showToast('Repayment recorded successfully!', 'success');
                  return { ...loan, repayments: updatedRepayments };
              }
              return loan;
          })
      );
      setCurrentPage('customerDetail'); // Navigate back to customer detail page
  };


  const navigate = (page, customerId = null, loanId = null) => {
    setCurrentPage(page);
    setSelectedCustomerId(customerId);
    setSelectedLoanId(loanId);
  };

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000); // Hide after 3 seconds
  };

  // Memoize derived data to avoid recalculations on every render
  const customerLoanData = useMemo(() => {
    return customers.map(customer => {
      const customerLoans = loans.filter(loan => loan.customerId === customer.id);
      const activeLoans = customerLoans.filter(loan => calculateRemainingBalance(loan) > 0);

      const outstandingBalance = activeLoans.reduce((sum, loan) => sum + calculateRemainingBalance(loan), 0);

      const dueDates = activeLoans
        .map(loan => new Date(loan.dueDate))
        .sort((a, b) => a - b);
      const nextDueDate = dueDates.length > 0 ? formatDate(dueDates[0].toISOString().split('T')[0]) : 'N/A';

      const isAnyLoanOverdue = activeLoans.some(isLoanOverdue);
      const status = outstandingBalance === 0 ? 'Paid Up' : (isAnyLoanOverdue ? 'Overdue' : 'Up-to-date');

      return {
        ...customer,
        outstandingBalance,
        nextDueDate,
        status,
      };
    });
  }, [customers, loans]);

  const selectedCustomerDetails = useMemo(() => {
      if (!selectedCustomerId) return null;
      const customer = customers.find(c => c.id === selectedCustomerId);
      if (!customer) return null;
      const customerLoans = loans.filter(loan => loan.customerId === selectedCustomerId);
      return {
          ...customer,
          loans: customerLoans,
      };
  }, [selectedCustomerId, customers, loans]);


  return (
    <AppContext.Provider value={{
      isAuthenticated,
      login,
      logout,
      customers: customerLoanData, // Use the memoized data
      loans,
      addCustomer,
      addLoan,
      recordRepayment,
      navigate,
      currentPage,
      selectedCustomerId,
      selectedCustomerDetails, // Use the memoized details
      selectedLoanId,
      theme,
      toggleTheme,
      showToast,
    }}>
      {children}
      {toast.show && <Toast message={toast.message} type={toast.type} />}
    </AppContext.Provider>
  );
};

// --- UI Components ---

// Toast Notification
const Toast = ({ message, type }) => {
  const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  return (
    <div className={`fixed bottom-5 right-5 ${bgColor} text-white px-4 py-2 rounded-md shadow-lg transition-opacity duration-300 animate-fadeIn`}>
      {message}
    </div>
  );
};

// Header Component
const Header = () => {
  const { isAuthenticated, logout, navigate, theme, toggleTheme } = useContext(AppContext);

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-gray-800 dark:to-black text-white p-4 shadow-md sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold cursor-pointer" onClick={() => navigate('dashboard')}>CrediKhaata</h1>
        <nav className="flex items-center space-x-4">
          {isAuthenticated && (
            <>
              <button
                onClick={() => navigate('dashboard')}
                className="hover:text-blue-200 dark:hover:text-indigo-300 transition duration-150"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('addCustomer')}
                className="hover:text-blue-200 dark:hover:text-indigo-300 transition duration-150"
              >
                Add Customer
              </button>
               <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 px-3 py-1 rounded-md text-sm font-medium transition duration-150"
              >
                Logout
              </button>
            </>
          )}
           <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-white/20 dark:hover:bg-gray-700 transition duration-150"
            aria-label="Toggle dark mode"
           >
            {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
             ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
             )}
          </button>
        </nav>
      </div>
    </header>
  );
};

// Login Page Component
const LoginPage = () => {
  const { login } = useContext(AppContext);
  const [email, setEmail] = useState('shopkeeper@test.com'); // Pre-fill for demo
  const [password, setPassword] = useState('password'); // Pre-fill for demo
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!login(email, password)) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-indigo-600 dark:text-indigo-400 mb-8">CrediKhaata Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="********"
            />
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition duration-150 ease-in-out"
            >
              Login
            </button>
          </div>
           <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              Use email: shopkeeper@test.com & password: password
            </p>
        </form>
      </div>
    </div>
  );
};

// Dashboard Page Component
const DashboardPage = () => {
  const { customers, navigate } = useContext(AppContext);

  // Helper to determine status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Overdue': return 'text-red-600 dark:text-red-400 font-semibold';
      case 'Up-to-date': return 'text-green-600 dark:text-green-400 font-semibold';
      case 'Paid Up': return 'text-gray-500 dark:text-gray-400';
      default: return 'text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Customer Dashboard</h2>
       <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
         <div className="overflow-x-auto">
           <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
             <thead className="bg-gray-50 dark:bg-gray-700">
               <tr>
                 <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                 <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Outstanding Balance (₹)</th>
                 <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">Next Due Date</th>
                 <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                 <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
               </tr>
             </thead>
             <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
               {customers.length > 0 ? customers.map((customer) => (
                 <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150">
                   <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{customer.name}</td>
                   <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 hidden sm:table-cell">{customer.outstandingBalance.toFixed(2)}</td>
                   <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 hidden md:table-cell">{customer.nextDueDate}</td>
                   <td className={`px-4 py-3 whitespace-nowrap text-sm ${getStatusColor(customer.status)}`}>
                     {customer.status === 'Overdue' && <span className="mr-1">⚠️</span>}
                     {customer.status}
                   </td>
                   <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                     <button
                       onClick={() => navigate('customerDetail', customer.id)}
                       className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 transition duration-150"
                     >
                       View Details
                     </button>
                   </td>
                 </tr>
               )) : (
                 <tr>
                    <td colSpan="5" className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        No customers found. Add one!
                    </td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>
       </div>
    </div>
  );
};

// Customer Detail Page Component
const CustomerDetailPage = () => {
  const { selectedCustomerDetails, navigate, showToast } = useContext(AppContext);

  if (!selectedCustomerDetails) {
    return <div className="container mx-auto p-6 text-center text-gray-600 dark:text-gray-400">Customer not found or not selected.</div>;
  }

  const { id: customerId, name, email, loans } = selectedCustomerDetails;

  const handleExportPDF = () => {
    // In a real app, you'd use jsPDF here:
    // const doc = new jsPDF();
    // doc.text(`Customer Statement: ${name}`, 10, 10);
    // // ... add loan details, balances etc.
    // doc.save(`${name}_statement.pdf`);
    console.log(`Generating PDF for customer ${customerId}`);
    showToast('PDF export functionality is mocked.', 'success'); // Placeholder
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <button onClick={() => navigate('dashboard')} className="mb-4 text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200">&larr; Back to Dashboard</button>

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-100">{name}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{email}</p>
            </div>
            <div className="mt-3 sm:mt-0 flex space-x-2">
                 <button
                    onClick={() => navigate('addLoan', customerId)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-150"
                 >
                    + Add Loan
                 </button>
                 <button
                    onClick={handleExportPDF}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-150"
                 >
                    Export PDF
                 </button>
            </div>
        </div>
      </div>


      <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Loan History</h3>
      {loans.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No loans recorded for this customer yet.</p>
      ) : (
        <div className="space-y-4">
          {loans.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate)).map((loan) => { // Sort by most recent due date
            const remainingBalance = calculateRemainingBalance(loan);
            const overdue = isLoanOverdue(loan);
            return (
              <div key={loan.id} className={`bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 border-l-4 ${overdue ? 'border-red-500' : (remainingBalance <= 0 ? 'border-green-500' : 'border-blue-500')}`}>
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-2">
                  <div>
                    <p className="font-semibold text-lg text-gray-800 dark:text-gray-100">{loan.itemSold}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Amount: ₹{loan.amount.toFixed(2)} | Due: {formatDate(loan.dueDate)}
                      {overdue && <span className="ml-2 text-xs font-bold text-red-600 dark:text-red-400">(OVERDUE)</span>}
                      {remainingBalance <= 0 && <span className="ml-2 text-xs font-bold text-green-600 dark:text-green-400">(PAID)</span>}
                    </p>
                  </div>
                   <p className={`text-lg font-semibold ${remainingBalance > 0 ? (overdue ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-100') : 'text-green-600 dark:text-green-400'}`}>
                     Remaining: ₹{remainingBalance.toFixed(2)}
                   </p>
                </div>

                {/* Repayments Section */}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                   <div className="flex justify-between items-center mb-2">
                     <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Repayments:</h4>
                     {remainingBalance > 0 && (
                         <button
                            onClick={() => navigate('recordRepayment', customerId, loan.id)}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-md text-xs font-medium transition duration-150"
                         >
                            + Record Repayment
                         </button>
                     )}
                   </div>
                  {loan.repayments.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      {loan.repayments.map((repayment, index) => (
                        <li key={index}>
                          ₹{repayment.amount.toFixed(2)} on {formatDate(repayment.date)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">No repayments recorded yet.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


// Add Customer Form Page Component
const AddCustomerFormPage = () => {
  const { addCustomer, navigate } = useContext(AppContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      addCustomer(name.trim(), email.trim());
      // No need to navigate here, addCustomer does it
    } else {
      // Basic validation feedback (could use toast)
      alert('Please fill in both name and email.');
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-lg">
       <button onClick={() => navigate('dashboard')} className="mb-4 text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200">&larr; Back to Dashboard</button>
      <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Add New Customer</h2>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-4">
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Name</label>
          <input
            type="text"
            id="customerName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="e.g., Priya Singh"
          />
        </div>
        <div>
          <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Email (Optional)</label>
          <input
            type="email"
            id="customerEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
             className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="e.g., priya@example.com"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition duration-150"
          >
            Add Customer
          </button>
        </div>
      </form>
    </div>
  );
};

// Add Loan Form Page Component
const AddLoanFormPage = () => {
  const { addLoan, selectedCustomerId, customers, navigate, showToast } = useContext(AppContext);
  const [itemSold, setItemSold] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  const customer = customers.find(c => c.id === selectedCustomerId);

  if (!customer) {
      // Handle case where customer might not be found (though unlikely with current flow)
      navigate('dashboard'); // Go back to safety
      showToast('Customer not found.', 'error');
      return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const loanAmount = parseFloat(amount);
    if (!itemSold.trim() || isNaN(loanAmount) || loanAmount <= 0 || !dueDate) {
       showToast('Please fill all fields correctly (Amount must be positive).', 'error');
       return;
    }
    addLoan(selectedCustomerId, itemSold.trim(), loanAmount, dueDate);
    // Navigation is handled within addLoan
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-lg">
       <button onClick={() => navigate('customerDetail', selectedCustomerId)} className="mb-4 text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200">&larr; Back to {customer.name}'s Details</button>
      <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Add New Loan for {customer.name}</h2>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-4">
        <div>
          <label htmlFor="itemSold" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Sold / Service</label>
          <input
            type="text"
            id="itemSold"
            value={itemSold}
            onChange={(e) => setItemSold(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="e.g., Groceries, Tailoring"
          />
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loan Amount (₹)</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="0.01"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="e.g., 1500.00"
          />
        </div>
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
          <input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            // Set min date to today to prevent past due dates for new loans
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 transition duration-150"
          >
            Add Loan
          </button>
        </div>
      </form>
    </div>
  );
};

// Record Repayment Form Page Component
const RecordRepaymentFormPage = () => {
  const { recordRepayment, selectedCustomerId, selectedLoanId, loans, customers, navigate, showToast } = useContext(AppContext);
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [repaymentDate, setRepaymentDate] = useState(new Date().toISOString().split('T')[0]); // Default to today

  const customer = customers.find(c => c.id === selectedCustomerId);
  const loan = loans.find(l => l.id === selectedLoanId);

  if (!customer || !loan) {
    // Handle case where data might be missing
    navigate('dashboard'); // Go back to safety
    showToast('Could not find customer or loan details.', 'error');
    return null;
  }

   const remainingBalance = calculateRemainingBalance(loan);

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(repaymentAmount);
    if (isNaN(amount) || amount <= 0 || !repaymentDate) {
      showToast('Please enter a valid positive amount and date.', 'error');
      return;
    }
    if (amount > remainingBalance) {
        showToast(`Repayment amount cannot exceed remaining balance of ₹${remainingBalance.toFixed(2)}.`, 'error');
        return;
    }

    recordRepayment(selectedLoanId, amount, repaymentDate);
    // Navigation is handled within recordRepayment
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-lg">
       <button onClick={() => navigate('customerDetail', selectedCustomerId)} className="mb-4 text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200">&larr; Back to {customer.name}'s Details</button>
      <h2 className="text-2xl md:text-3xl font-semibold mb-1 text-gray-800 dark:text-gray-100">Record Repayment</h2>
       <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">For loan: <span className="font-medium">{loan.itemSold}</span> (Remaining: ₹{remainingBalance.toFixed(2)})</p>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-4">
        <div>
          <label htmlFor="repaymentAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Repayment Amount (₹)</label>
          <input
            type="number"
            id="repaymentAmount"
            value={repaymentAmount}
            onChange={(e) => setRepaymentAmount(e.target.value)}
            required
            min="0.01"
            step="0.01"
            max={remainingBalance.toFixed(2)} // Set max value to remaining balance
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder={`Max ₹${remainingBalance.toFixed(2)}`}
          />
        </div>
        <div>
          <label htmlFor="repaymentDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Repayment Date</label>
          <input
            type="date"
            id="repaymentDate"
            value={repaymentDate}
            onChange={(e) => setRepaymentDate(e.target.value)}
            required
            max={new Date().toISOString().split('T')[0]} // Cannot be a future date
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition duration-150"
          >
            Record Repayment
          </button>
        </div>
      </form>
    </div>
  );
};


// --- Main App Component ---
function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

// Component to conditionally render pages based on context state
const MainContent = () => {
    const { isAuthenticated, currentPage } = useContext(AppContext);

    if (!isAuthenticated) {
        return <LoginPage />;
    }

    // Render authenticated content
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <Header />
            <main>
                {currentPage === 'dashboard' && <DashboardPage />}
                {currentPage === 'customerDetail' && <CustomerDetailPage />}
                {currentPage === 'addCustomer' && <AddCustomerFormPage />}
                {currentPage === 'addLoan' && <AddLoanFormPage />}
                {currentPage === 'recordRepayment' && <RecordRepaymentFormPage />}
            </main>
             <footer className="text-center py-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 mt-8">
                CrediKhaata &copy; {new Date().getFullYear()}
            </footer>
        </div>
    );
}

export default App;

