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
    /// A function can accept one of the following args: string, int, boolean
    /// For any complex object set it to string and name it somethingJson then use the ParseArg function
    /// </summary>
    public abstract class BridgeHelperBase
    {
        private readonly WebView2 webView2;
        public BridgeHelperBase(WebView2 webView2)
        {
            this.webView2 = webView2;
        }
        public void ResultAsync(object returnValue, string callId = null)
        {
            // Convert to JSON
            string result = JsonConvert.SerializeObject(new BridgeResultMessage() { Result = returnValue, CallId = callId }, jsonSerializerSettings);

            webView2.CoreWebView2.PostWebMessageAsJson(result);
        }

        public void SendBridgeMessage(string type, object data)
        {
            // Convert to JSON
            string result = JsonConvert.SerializeObject(new BridgeMessage() { Type = type, Data = data }, jsonSerializerSettings);

            webView2.CoreWebView2.PostWebMessageAsJson(result);
        }

        public string Result(object returnValue)
        {
            // Convert to JSON
            string value = JsonConvert.SerializeObject(returnValue, jsonSerializerSettings);

            return value;
        }

        public T ParseArg<T>(string json)
        {
            return JsonConvert.DeserializeObject<T>(json);
        }

        private JsonSerializerSettings jsonSerializerSettings = new JsonSerializerSettings
        {
            ContractResolver = new DefaultContractResolver
            {
                NamingStrategy = new CamelCaseNamingStrategy()
            },
            Formatting = Formatting.Indented
        };
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
