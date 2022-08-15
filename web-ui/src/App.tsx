import { useEffect } from "react";
import "./App.css";
import { createBridge } from "./betterBridge";

interface SimpleBridge {
  helloWorld: (number: number, string: string, message: any) => Promise<any>;
  helloWorldAsync: (
    number: number,
    string: string,
    message: any
  ) => Promise<any>;
  startSendingMessagesAsync: () => Promise<any>;
}

const bridge = createBridge<SimpleBridge>("bridge");

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
          const result = await bridge.helloWorld(99, "abc", {
            text: "hello from JS!",
            sent: new Date(),
          });
          var endTime = performance.now();
          var perf = endTime - startTime;
          console.log(result, perf + "milliseconds");
          alert("Got result back: " + JSON.stringify(result, undefined, 2));
        }}
      >
        Call method (C# sync)
      </button>
      <button
        onClick={async () => {
          var startTime = performance.now();
          const result = await bridge.helloWorldAsync(99, "abc", {
            text: "hello from JS!",
            sent: new Date(),
          });
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
          const result = await bridge.startSendingMessagesAsync();
          var endTime = performance.now();
          console.log(result, endTime - startTime + "milliseconds");
        }}
      >
        Start sending messages from C#
      </button>
    </div>
  );
}

export default App;
