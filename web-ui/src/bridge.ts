export class Bridge {
  private webViewBridge = (window as any).chrome.webview.hostObjects.bridge;

  private generateCallId(functionName: string): string {
    return functionName + "_" + Math.random().toString(36).substr(2, 9);
  }

  // How fast can we go?
  speedTest = async () => {
    const result = await this.webViewBridge.speedTest();
    return result;
  };

  runFunction = async <TResult = any>(
    functionName: string,
    args: any[],
    timeout = 60000
  ): Promise<TResult> => {
    const promise = new Promise<TResult>(async (resolve, reject) => {
      const callId = this.generateCallId(functionName);

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

        reject(`The function ${functionName} timed out`);
      }, timeout);

      (window as any).chrome.webview.addEventListener(
        "message",
        messageHandler
      );

      const argsJson = args.map((a) => JSON.stringify(a));

      await this.webViewBridge.runFunction(
        functionName,
        JSON.stringify(argsJson),
        callId
      );
    });

    return promise;
  };
}
