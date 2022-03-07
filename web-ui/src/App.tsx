import React, { useState } from "react";
import "./App.css";
import { Bridge } from "./bridge";

const bridge = new Bridge();

function App() {
  return (
    <div className="App" style={{ display: "flex", gap: 16, padding: 16 }}>
      <button
        onClick={async () => {
          const result = await bridge.runFunction("helloWorld", [
            "hello from JS!",
            {
              firstName: "foo",
              lastName: "bar",
            },
          ]);

          alert("Got result back: " + JSON.stringify(result, undefined, 2));
        }}
      >
        Send message (C# sync)
      </button>
      <button
        onClick={async () => {
          const result = await bridge.runFunctionAsync("helloWorldAsync", [
            "hello from JS!",
            {
              firstName: "foo",
              lastName: "bar",
            },
          ]);

          alert("Got result back: " + JSON.stringify(result, undefined, 2));
        }}
      >
        Send message (C# async)
      </button>
    </div>
  );
}

export default App;
