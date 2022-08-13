import React, { useEffect, useState } from "react";
import "./App.css";
import { BetterBridge } from "./betterBridge";

const bridge = new BetterBridge("bridge");

function App() {
  useEffect(() => {
    bridge.addMessageHandler((type, data) => {
      alert("Got message of type: " + type + " data: " + JSON.stringify(data));
    });
  });

  return (
    <div className="App" style={{ display: "flex", gap: 16, padding: 16 }}>
      <button
        onClick={async () => {
          var startTime = performance.now();
          const result = await bridge.runMethod("HelloWorld", [
            99,
            "abc",
            {
              text: "hello from JS!",
              sent: new Date(),
            },
          ]);
          var endTime = performance.now();
          console.log(result, endTime - startTime + "milliseconds");
          alert("Got result back: " + JSON.stringify(result, undefined, 2));
        }}
      >
        Call method (C# sync)
      </button>
      <button
        onClick={async () => {
          var startTime = performance.now();
          const result = await bridge.runMethod("HelloWorldAsync", [
            99,
            "abc",
            {
              text: "hello from JS!",
              sent: new Date(),
            },
          ]);
          var endTime = performance.now();
          console.log(result, endTime - startTime + "milliseconds");

          alert("Got result back: " + JSON.stringify(result, undefined, 2));
        }}
      >
        Call method (C# async)
      </button>

      <button
        onClick={async () => {
          var startTime = performance.now();
          const result = await bridge.runMethod(
            "StartSendingMessagesAsync",
            []
          );
          var endTime = performance.now();
          console.log(result, endTime - startTime + "milliseconds");

          alert("Got result back: " + JSON.stringify(result, undefined, 2));
        }}
      >
        Start sending messages from C#
      </button>

      {/* <button
        onClick={async () => {
          var startTime = performance.now();
          const result = await bridge.speedTest();
          var endTime = performance.now();
          console.log(result, endTime - startTime + "milliseconds");

          alert("Got result back: " + JSON.stringify(result, undefined, 2));
        }}
      >
        Regular call (for speed testing)
      </button> */}
    </div>
  );
}

export default App;
