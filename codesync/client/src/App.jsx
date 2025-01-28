import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import io from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:3001");

function App() {
  const [code, setCode] = useState("// Start coding here...");
  const [output, setOutput] = useState("");
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);

  useEffect(() => {
    socket.on("code-update", (newCode) => {
      setCode(newCode);
    });

    socket.on("output-update", (newOutput) => {
      setOutput(newOutput);
      setIsTerminalOpen(true); // Show terminal when output arrives
    });

    return () => {
      socket.off("code-update");
      socket.off("output-update");
    };
  }, []);

  function handleEditorChange(value) {
    setCode(value);
    socket.emit("code-change", value);
  }

  function runCode() {
    socket.emit("run-code", code);
  }

  return (
    <div className="app-container">
      <div className="header">
        <h1>CodeSync</h1>
        <div className="header-buttons">
          {!isTerminalOpen && (
            <button
              className="terminal-toggle"
              onClick={() => setIsTerminalOpen(true)}
            >
              Show Terminal
            </button>
          )}
          <button className="run-btn" onClick={runCode}>
            Run
          </button>
        </div>
      </div>
      <div className="main-container">
        <Editor
          height={isTerminalOpen ? "60vh" : "calc(100vh - 40px)"}
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          options={{
            fontSize: 14,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
        {isTerminalOpen && (
          <div className="terminal">
            <div className="terminal-header">
              <span>Terminal</span>
              <button onClick={() => setIsTerminalOpen(false)}>×</button>
            </div>
            <pre className="terminal-content">
              {output || "> Output will appear here..."}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
