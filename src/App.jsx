import React from "react";

export default function App() {
  const today = new Date().toLocaleDateString();

  const saved = JSON.parse(localStorage.getItem("tasks") || "[]");

  const [tasks, setTasks] = React.useState(saved);
  const [input, setInput] = React.useState("");

  React.useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!input.trim()) return;

    if (tasks.length >= 3) {
      alert("max 3 tasks");
      return;
    }

    setTasks([
      ...tasks,
      {
        id: Date.now(),
        text: input,
        done: false,
      },
    ]);

    setInput("");
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, done: !task.done }
          : task
      )
    );
  };

  const completed = tasks.filter((t) => t.done).length;
  const score = `${completed}/${tasks.length || 3}`;

  return (
    <div style={{
      minHeight: "100vh",
      background: "black",
      color: "white",
      padding: "40px",
      fontFamily: "Arial"
    }}>
      <h1>Today</h1>

      <p>{today}</p>

      <h2>Day Score: {score}</h2>

      <div>
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => toggleTask(task.id)}
            style={{
              padding: "15px",
              marginTop: "10px",
              border: "1px solid gray",
              cursor: "pointer",
              background: task.done ? "white" : "#111",
              color: task.done ? "black" : "white"
            }}
          >
            {task.text}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "20px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="new task"
          style={{
            padding: "10px",
            width: "250px"
          }}
        />

        <button
          onClick={addTask}
          style={{
            padding: "10px",
            marginLeft: "10px"
          }}
        >
          add
        </button>
      </div>
    </div>
  );
}