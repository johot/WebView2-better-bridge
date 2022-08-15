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

    var startTime = performance.now();

    const availableMethods = (window as any).chrome.webview.hostObjects.sync[
      bridgeName
    ].GetMethods();

    console.log(performance.now() - startTime + " it took...");

    availableMethods.forEach((methodName: string) => {
      const lowerCaseMethodName = lowercaseFirstLetter(methodName);

      (this as any)[lowerCaseMethodName] = (...args: any[]) => {
        return this.runMethod(methodName, args);
      };
    });

    (window as any).chrome.webview.addEventListener("message", (event: any) => {
      // This data will already be deserialized for us
      const eventData = event.data;
      const type: string = eventData.type;
      const data: any = eventData.data;

      if (type) {
        this.onMessage(type, data);
      }
    });
  }

  addMessageHandler = (messageHandler: MessageHandler) => {
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

  private generateCallId(functionName: string): string {
    return functionName + "_" + Math.random().toString(36).substr(2, 9);
  }

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

  runMethodLegacyMode = async <TResult = any>(
    methodName: string,
    args: any[],
    timeout = 60000
  ): Promise<TResult> => {
    const promise = new Promise<TResult>(async (resolve, reject) => {
      const callId = this.generateCallId(methodName);

      const messageHandler = (event: {
        data: {
          result: string;
          callId: string;
        };
      }) => {
        // Since this function gets called for every message we must see if it is "our" message otherwise ignore
        if (event.data.callId === callId) {
          (window as any).chrome.webview.removeEventListener(
            "message",
            messageHandler
          );

          // Remove timeout
          clearTimeout(timeoutHandle);

          resolve(event.data.result as unknown as TResult);
        } else {
          // This message was for someone else we keep waiting for our result (or until timeout hits)
        }
      };

      const timeoutHandle = setTimeout(() => {
        (window as any).chrome.webview.removeEventListener(
          "message",
          messageHandler
        );

        reject(`The function ${methodName} timed out`);
      }, timeout);

      (window as any).chrome.webview.addEventListener(
        "message",
        messageHandler
      );

      const argsJson = args.map((a) => JSON.stringify(a));

      await this.webViewBridge.RunMethod(
        methodName,
        JSON.stringify(argsJson),
        callId
      );
    });

    return promise;
  };

  // How fast can we go? For debugging / testing only
  speedTest = async () => {
    const result = await this.webViewBridge.speedTest();
    return result;
  };
}

export type MessageHandler = (type: string, data: any) => void;

function lowercaseFirstLetter(name: string) {
  return name.charAt(0).toLowerCase() + name.slice(1);
}
