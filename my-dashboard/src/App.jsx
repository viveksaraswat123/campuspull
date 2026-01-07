import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import AlumniDashboard from './components/AlumniDashboard'; // Code from earlier
import StudentDashboard from './components/StudentDashboard'; // Code from earlier

function App() {
  const { user, logout } = useContext(AuthContext);

  if (!user) return <Login />;

  return (
    <div className="relative">
      <button onClick={logout} className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg z-50">
        Logout
      </button>

      {user.role === 'alumni' ? (
        <AlumniDashboard user={user} />
      ) : (
        <StudentDashboard user={user} />
      )}
    </div>
  );
}

export default App;