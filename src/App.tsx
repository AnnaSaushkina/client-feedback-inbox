import { useEffect } from "react";
import "./App.css";
import { taskStore } from "./state/TaskStore";
import AppLayout from "./layout/AppLayout";

function App() {
  useEffect(() => {
    taskStore.addTask("Test");
  }, []);

  return <AppLayout />;
}

export default App;
