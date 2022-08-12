# WebView2 Better Bridge

Using WebView2 call C# methods (async and sync) with complex parameters and return values from TS/JS!

## Installation

There currently is no NuGet package, instead copy the `BetterBridge.cs` and `betterBridge.ts` files to your own project.

## Usage

The documentation here is just a very light overview, for full details check the sample projects.

### Initialize bridge

- Create a regular class that contains all the methods you can call from JS (see `SampleBridge.cs` for an example). Both async and sync methods with complex object parameters and return values will work(!).

- Register it by calling:

  ```cs
  webView2.CoreWebView2.AddHostObjectToScript("bridge", new BetterBridge(new MyBridge(), webView2));
  ```

  _Notice how BetterBridge wraps your own bridge class._

### Calling sync C# methods

```ts
// TypeScript
const bridge = new BetterBridge();

const result = await bridge.runMethod("HelloWorld", [
  99,
  "abc",
  {
    text: "hello from JS!",
    sent: new Date(),
  },
]);
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

### Calling async C# methods

```ts
// TypeScript
const bridge = new BetterBridge();

const result = await bridge.runMethod("HelloWorldAsync", [
  99,
  "abc",
  {
    text: "hello from JS!",
    sent: new Date(),
  },
]);
```

```cs
// C#
public async Task<Message> HelloWorldAsync(int someData, string moreData, Message message)
{
    await Task.Delay(1000);

    var msg = new Message()
    {
        Text = $"Hi from C#! Thank you for the data: {message.Text} {message.Sent} {someData} and {moreData}.",
        Sent = DateTime.Now
    };

    await Task.Delay(1000);

    return msg;
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
const bridge = new BetterBridge();
bridge.addMessageHandler((type, data) => {
  console.log("Got message", type, data);
});
```

## Performance

Uses some reflection under the hood but when testing I saw very small performance differences often in the range of 0.1-0.5 ms. But your results may vary 😊.

## Current limitations

Currently designed for use by a single bridge class (and BetterBridge instance) but should be pretty easy to make work for multiple bridges / host objects if needed.
