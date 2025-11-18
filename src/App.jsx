import MainLayout from './components/Layout/MainLayout';
import { useSimulation } from './hooks/useSimulation';

function App() {
  // Enable automatic power flow calculation
  useSimulation();

  return <MainLayout />;
}

export default App;
