# WebView2 Bridge Helper

## Installation
There currently is no NuGet package, instead copy the `BridgeHelperBase.cs` and `bridge.ts` files to your own project.

## Usage

## Initialize bridge
* Create a class that contains all the methods you can call from JS and inherit from `BridgeHelperBase`
* Register it by calling: `webView2.CoreWebView2.AddHostObjectToScript("bridge", new SampleBridge(webView2))`

*See sample project for more details.*

### Calling sync C# methods

```cs
// C#
public string helloWorld(string message, string personJson)
{
    // Converts complex objects from string->object
    var person = ParseArg<Person>(personJson);

    person.Messages.Add(message);

    // Converts complex objects from object->string
    return Result(person);
}
```

```tsx
// TypeScript
const bridge = new Bridge();

const result = await bridge.runFunction("helloWorld", [
  "hello from JS!",
  {
    firstName: "foo",
    lastName: "bar",
  },
]);
```

#### Calling async C# methods

```cs
// C#

// Note: Always add an ending parameter called "callId" for all async methods, you don't have to set this value yourself from JS
public async Task helloWorldAsync(string message, string personJson, string callId)
{
    // Converts complex objects from string->object
    var person = ParseArg<Person>(personJson);

    person.Messages.Add(message);

    await Task.Delay(1000);

    // Converts complex objects from object->string and posts a message back
    // over the bridge so we can resolve a promise
    ResultAsync(person, callId);
}
```

> **Why no return value?** In the async sample we don't have to return a value. The reason for this is that a return value from an async method over the WebView2 bridge will always be null, that is why we need to post a message back instead by using the `ResultAsync` utility method.

> **What is `callId`**? Since we are sending the return value in the async case back as a message we need to match the original call (from JS) and the return message result using a unique id. If we didn't do this we could end up picking up the result of a different call when waiting for our promise to resolve on the JavaScript side.

```tsx
// TypeScript
const bridge = new Bridge();

const result = await bridge.runFunctionAsync("helloWorld", [
  "hello from JS!",
  {
    firstName: "foo",
    lastName: "bar",
  },
]);
```
