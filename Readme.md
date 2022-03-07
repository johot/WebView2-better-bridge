# WebView2 Bridge Helper

## Usage

### Sync C# methods

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

#### Async C# methods

```cs
// C#
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

> **Why no return value?** In the async sample we don't have to return a value. The reason for this is that a return value from an async method in C# will always be null, that is why we need to post a message back instead using the `ResultAsync` utility method.

> **What is `callId`**? Since we are sending the return value in the async case back as a message we need to match the call and the result using a unique id. If we didn't do this we could end up picking up the result of a different call when waiting for our promise to resolve on the JavaScript side.

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
