import React, { useEffect } from 'react';
import './App.css';

function App() {

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      console.log("Connected to server");
      socket.send("Hello from React client!");
    };

    socket.onmessage = (event) => {
      console.log("Message from server:", event.data);
    };

    socket.onclose = () => {
      console.log("Disconnected from server");
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div className="App">
      <div className="box">
        <h1>Hello world</h1>
      </div>
    </div>
  );
}

export default App;
