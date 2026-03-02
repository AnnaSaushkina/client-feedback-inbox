import { Layout, Button } from "antd";
import { useState } from "react";
import Board from "../components/Board/Board";
import { taskStore } from "../state/TaskStore";

const { Content } = Layout;

export default function AppLayout() {
  const [, forceRender] = useState({});

  const handleAdd = () => {
    taskStore.addTask("Новая задача");
    forceRender({});
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ padding: 24 }}>
        <Button type="primary" onClick={handleAdd}>
          Добавить задачу
        </Button>

        <Board />
      </Content>
    </Layout>
  );
}
