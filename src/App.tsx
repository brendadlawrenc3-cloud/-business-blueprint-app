import { CEOProvider } from './context/CEOContext';
import { CEOCommandCenter } from './pages/CEOCommandCenter';
import './index.css';

function App() {
  return (
    <CEOProvider>
      <CEOCommandCenter />
    </CEOProvider>
  );
}

export default App;
