interface AnyMethod {
  // Keys can be strings, numbers, or symbols.
  // If you know it to be strings only, you can also restrict it to that.
  // For the value you can use any or unknown,
  // with unknown being the more defensive approach.
  [methodName: string | number | symbol]: any;
}

export function createBridge<
  T = Record<string, (...args: any[]) => Promise<any>>
>(bridgeName: string) {
  return new BetterBridge(bridgeName) as BetterBridge & T;
}

class BetterBridge {
  private webViewBridge: any = undefined;
  private messageHandlers: MessageHandler[] = [];

  constructor(bridgeName: string) {
    this.webViewBridge = (window as any).chrome.webview.hostObjects[bridgeName];

    const availableMethods = (window as any).chrome.webview.hostObjects.sync[
      bridgeName
    ].GetMethods();

    availableMethods.forEach((methodName: string) => {
      const lowerCaseMethodName = lowercaseFirstLetter(methodName);

      (this as any)[lowerCaseMethodName] = (...args: any[]) => {
        return this.runMethod(methodName, args);
      };
    });
  }

  // TODO: Need logic to clean this up when no handlers exist anymore, might cause leaks
  private initMessageHandling = () => {
    (window as any).chrome.webview.addEventListener("message", (event: any) => {
      // This data will already be deserialized for us
      const eventData = event.data;
      const type: string = eventData.type;
      const data: any = eventData.data;

      if (type) {
        this.onMessage(type, data);
      }
    });
  };

  private messageHandlingInitialized = false;

  addMessageHandler = (messageHandler: MessageHandler) => {
    if (!this.messageHandlingInitialized) {
      this.initMessageHandling();
      this.messageHandlingInitialized = true;
    }

    this.messageHandlers.push(messageHandler);
  };

  removeMessageHandler = (messageHandler: MessageHandler) => {
    const index = this.messageHandlers.indexOf(messageHandler);
    this.messageHandlers.splice(index, 1);
  };

  private onMessage = (type: string, data: any) => {
    // Call all handlers
    for (const handler of this.messageHandlers) {
      handler(type, data);
    }
  };

  // Only works in WebView2 1.0.1293.44+
  private runMethod = async <TResult = any>(
    methodName: string,
    args: any[]
  ): Promise<TResult> => {
    const argsJson = args.map((a) => JSON.stringify(a));

    const returnJson = await this.webViewBridge.RunMethod(
      methodName,
      JSON.stringify(argsJson)
    );

    return JSON.parse(returnJson);
  };
}

export type MessageHandler = (type: string, data: any) => void;

function lowercaseFirstLetter(name: string) {
  return name.charAt(0).toLowerCase() + name.slice(1);
}
