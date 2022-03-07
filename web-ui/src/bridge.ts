export class Bridge {
  private webViewBridge = (window as any).chrome.webview.hostObjects.bridge;

  runFunction = async <TResult = any>(
    functionName: string,
    args: any[]
  ): Promise<any> => {
    const fnArgs = this.convertArgs(args);

    const rawReturnValue = await this.webViewBridge[functionName](...fnArgs);

    // Try to deserialize if string (we can't be sure if it is json or not)
    if (typeof rawReturnValue === "string") {
      try {
        const objectReturnValue = JSON.parse(rawReturnValue);
        return objectReturnValue as TResult;
      } catch (err) {
        // Json deserialize failed return original result
        return rawReturnValue;
      }
    } else {
      return rawReturnValue;
    }
  };

  private generateCallId(functionName: string): string {
    return functionName + "_" + Math.random().toString(36).substr(2, 9);
  }

  runFunctionAsync = async <TResult = any>(
    functionName: string,
    args: any[],
    timeout = 60000
  ): Promise<TResult> => {
    const promise = new Promise<TResult>((resolve, reject) => {
      const callId = this.generateCallId(functionName);

      const messageHandler = (event: {
        data: {
          result: string;
          callId: string;
        };
      }) => {
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

        reject(`The function ${functionName} timed out`);
      }, timeout);

      (window as any).chrome.webview.addEventListener(
        "message",
        messageHandler
      );

      const fnArgs = this.convertArgs(args);
      fnArgs.push(callId);

      // Because its async on the C# side there will be no return value we can use
      this.webViewBridge[functionName](...fnArgs);
    });

    return promise;
  };

  private convertArgs(args: any[]) {
    const fnArgs: any[] = [];

    for (const arg of args) {
      if (typeof arg === "object") {
        fnArgs.push(JSON.stringify(arg));
      } else {
        fnArgs.push(arg);
      }
    }

    return fnArgs;
  }
}
