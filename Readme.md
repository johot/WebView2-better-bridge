# WebView2 Better Bridge

Using WebView2 call C# methods (async and sync) with complex parameters and return values from TS/JS!

## Installation

There currently is no NuGet and npm packages, instead copy the `WebView2BetterBridge\BetterBridge.cs` to your C# project and `web-ui\src\betterBridge.ts` to your frontend project.

## Usage

The documentation here is just a very light overview, for full details check the sample projects.

### Initialize bridge

- Create a regular class that contains all the methods you can call from TS/JS (see `SampleBridge.cs` for an example). Both async and sync methods with complex object parameters and return values will work.

- Register it by calling:

  ```cs
  webView2.CoreWebView2.AddHostObjectToScript("bridge", new BetterBridge(new MyBridge(), webView2));
  ```

  _Notice how BetterBridge wraps your own bridge class._

### Calling async C# methods

> Note: The TS/JS method on the bridge should use camelCase.

```ts
// TypeScript
import { createBridge } from "./betterBridge";
const bridge = createBridge("bridge");

const result = await bridge.helloWorldAsync(99, "abc", {
  text: "hello from JS!",
  sent: new Date(),
});
```

```cs
// C#
public async Task<Message> HelloWorldAsync(int someData, string moreData, Message message)
{
    var msg = new Message()
    {
        Text = $"Hi from C#! Thank you for the data: {message.Text} {message.Sent} {someData} and {moreData}.",
        Sent = DateTime.Now
    };

    await Task.Delay(500);

    return msg;
}
```

### Calling sync C# methods

> Note: The TS/JS method on the bridge should use camelCase.

> Note: Even though the C# method is sync it's still resolved to a Promise that we have to await. This is the recommended way since we do not want to lock up the UI.

```ts
// TypeScript
import { createBridge } from "./betterBridge";
const bridge = createBridge("bridge");

const result = await bridge.helloWorld(99, "abc", {
  text: "hello from JS!",
  sent: new Date(),
});
```

```cs
// C#
public Message HelloWorld(int someData, string moreData, Message message)
{
    return new Message()
    {
        Text = $"Hi from C#! Thank you for the data: {message.Text} {message.Sent} {someData} and {moreData}.",
        Sent = DateTime.Now
    };
}
```

### Sending messages from C# to TS/JS

Makes it a bit easier to send messages from C# to TS/JS instead of using `webView2.CoreWebView2.PostWebMessageAsJson` directly.

```cs
// C#
var messageSender = new BetterBridgeMessageSender(webView2);
messageSender.SendMessage("message", new Message() { Text = "I want to report something", Sent = DateTime.Now });
```

```ts
// TypeScript
import { createBridge } from "./betterBridge";
const bridge = createBridge("bridge");

bridge.addMessageHandler((type, data) => {
  console.log("Got message", type, data);
});
```

## Performance

Uses some reflection under the hood but when testing I saw very small performance differences often in the range of 0.1-0.5 ms. But your results may vary 😊.
