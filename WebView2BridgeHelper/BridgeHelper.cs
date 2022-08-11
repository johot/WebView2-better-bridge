using Microsoft.Web.WebView2.WinForms;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebView2BridgeHelper
{
    /// <summary>
    /// Subscribers to messages from TS/JS and invokes methods / parses JSON etc for a wrapping bridge class.
    /// Giving us the ability to use any arguments, use async methods pass complex objects etc :D
    /// </summary>
    public class BridgeHelper
    {
        private readonly WebView2 webView2;

        // Will invoke methods on this object
        private readonly object bridgeClass;
        private Type bridgeClassType;
        public BridgeHelper(object bridgeClass, WebView2 webView2)
        {
            this.webView2 = webView2;
            this.bridgeClass = bridgeClass;
            this.bridgeClassType = this.bridgeClass.GetType();
        }

        private JsonSerializerSettings jsonSerializerSettings = new JsonSerializerSettings
        {
            ContractResolver = new DefaultContractResolver
            {
                NamingStrategy = new CamelCaseNamingStrategy()
            },
            //Formatting = Formatting.Indented
        };

        public string speedTest()
        {
            return "hi";
        }

        public void SendBridgeMessage(string type, object data)
        {
            // Convert to JSON
            string result = JsonConvert.SerializeObject(new BridgeMessage() { Type = type, Data = data }, jsonSerializerSettings);

            webView2.CoreWebView2.PostWebMessageAsJson(result);
        }

        /// <summary>
        /// Called from TS/JS side works on both async and regular methods of the wrapped class :D !
        /// </summary>
        /// <param name="fnName"></param>
        /// <param name="argsJson"></param>
        /// <param name="callId"></param>
        /// <returns></returns>
        public async Task runFunction(string fnName, string argsJson, string callId)
        {
            // We have stored each argument as json data in an array, the array is also encoded to a string
            // since webview can't invoke string[] array functions
            var jsonDataArray = JsonConvert.DeserializeObject<string[]>(argsJson);

            var method = bridgeClassType.GetMethod(fnName);
            var parameters = bridgeClassType.GetMethod(fnName).GetParameters();

            if (parameters.Length != jsonDataArray.Length)
                throw new Exception("Wrong number of arguments, expected: " + parameters.Length + " but got: " + jsonDataArray.Length);

            var typedArgs = new object[jsonDataArray.Length];

            for (int i = 0; i < typedArgs.Length; i++)
            {
                var typedObj = JsonConvert.DeserializeObject(jsonDataArray[i], parameters[i].ParameterType);
                typedArgs[i] = typedObj;
            }

            var resultTyped = method.Invoke(this.bridgeClass, typedArgs);

            // Was it an async method (in bridgeClass?)
            var resultTypedTask = resultTyped as Task;

            string resultJson = null;

            // Was the method called async?
            if (resultTypedTask == null)
            {
                // Regular method:

                // Package the result
                resultJson = JsonConvert.SerializeObject(new BridgeResultMessage() { Result = resultTyped, CallId = callId }, jsonSerializerSettings);
            }
            else
            {
                // Async method:

                await resultTypedTask;
                var taskResult = (object)((dynamic)resultTypedTask).Result;

                // Package the result
                resultJson = JsonConvert.SerializeObject(new BridgeResultMessage() { Result = taskResult, CallId = callId }, jsonSerializerSettings);

            }

            // Since we can't return anything from an async function we post it back as a message instead with a callid to match the promise
            webView2.CoreWebView2.PostWebMessageAsJson(resultJson);
            //return "";
        }
    }

    public class BridgeMessage
    {
        public string Type { get; set; }
        public object Data { get; set; }
    }

    public class BridgeResultMessage
    {
        public string CallId { get; set; }
        public object Result { get; set; }
    }
}
