import React, { useState } from "react";
import "./App.css";
import { Bridge } from "./bridge";

const bridge = new Bridge();

function App() {
  return (
    <div className="App" style={{ display: "flex", gap: 16, padding: 16 }}>
      <button
        onClick={async () => {
          var startTime = performance.now();
          const result = await bridge.runFunction("helloWorld", [
            "hello from JS!",
            {
              firstName: "foo",
              lastName: "bar",
            },
          ]);
          var endTime = performance.now();

          alert(
            "Got result back: " +
              JSON.stringify(result, undefined, 2) +
              " it took " +
              (endTime - startTime) +
              "milliseconds"
          );
        }}
      >
        Send message (C# sync)
      </button>
      <button
        onClick={async () => {
          var startTime = performance.now();
          const result = await bridge.runFunction("helloWorldAsync", [
            "hello from JS!",
            {
              firstName: "foo",
              lastName: "bar",
            },
          ]);
          var endTime = performance.now();

          alert(
            "Got result back: " +
              JSON.stringify(result, undefined, 2) +
              " it took " +
              (endTime - startTime) +
              "milliseconds"
          );
        }}
      >
        Send message (C# async)
      </button>
      <button
        onClick={async () => {
          var startTime = performance.now();
          const result = await bridge.speedTest();
          var endTime = performance.now();

          alert(
            "Got result back: " +
              result +
              " it took " +
              (endTime - startTime) +
              "milliseconds"
          );

          console.log(endTime - startTime);
        }}
      >
        Regular call (for speed testing)
      </button>
    </div>
  );
}

export default App;
