import { useState } from "react";
import { Button, Input, Card, Typography } from "antd";
import AppLayout from "./layout/AppLayout";
import { useSocket, useTaskSound } from "./hooks";

const REQUIRED_PASSWORD = import.meta.env.VITE_PASSWORD as string | undefined;
const SESSION_KEY = "app_auth";

function PasswordGate({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [authed, setAuthed] = useState(
    () => !REQUIRED_PASSWORD || sessionStorage.getItem(SESSION_KEY) === "1",
  );

  if (authed) return <>{children}</>;

  const submit = () => {
    if (value === REQUIRED_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setAuthed(true);
    } else {
      setError(true);
      setValue("");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0d0d0d",
      }}
    >
      <Card style={{ width: 320 }}>
        <Typography.Title level={4} style={{ marginBottom: 20 }}>
          Task Board
        </Typography.Title>
        <Input.Password
          value={value}
          placeholder="Пароль"
          status={error ? "error" : undefined}
          autoFocus
          onChange={(e) => {
            setValue(e.target.value);
            setError(false);
          }}
          onPressEnter={submit}
        />
        {error && (
          <Typography.Text type="danger" style={{ display: "block", marginTop: 8 }}>
            Неверный пароль
          </Typography.Text>
        )}
        <Button type="primary" onClick={submit} style={{ marginTop: 12, width: "100%" }}>
          Войти
        </Button>
      </Card>
    </div>
  );
}

function App() {
  useSocket();
  useTaskSound();
  return (
    <PasswordGate>
      <AppLayout />
    </PasswordGate>
  );
}

export default App;
