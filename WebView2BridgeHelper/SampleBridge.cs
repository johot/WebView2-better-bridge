using Microsoft.Web.WebView2.WinForms;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace WebView2BridgeHelper
{
    public class Person
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }

        public List<string> Messages { get; set; } = new List<string>();
    }

    public class SampleBridge : BridgeHelperBase
    {
        public SampleBridge(WebView2 webView2) : base(webView2)
        {
        }

        public string helloWorld(string message, string personJson)
        {
            var person = ParseArg<Person>(personJson);

            person.Messages.Add(message);

            return Result(person);
        }

        public async Task helloWorldAsync(string message, string personJson, string callId)
        {
            var person = ParseArg<Person>(personJson);

            person.Messages.Add(message);

            await Task.Delay(1000);

            ResultAsync(person, callId);
        }
    }
}
