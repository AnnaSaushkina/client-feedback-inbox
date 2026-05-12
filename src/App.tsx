import AppLayout from "./layout/AppLayout";
import { useSocket } from "./hooks/useSocket";
import { useTaskSound } from "./hooks/useTaskSound";

function App() {
  useSocket();
  useTaskSound();
  return <AppLayout />;
}

export default App;
