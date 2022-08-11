using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebView2BridgeHelper.Old;

namespace WebView2BridgeHelper
{
    public class SimpleBridge
    {
        public Person helloWorld(string message, Person person)
        { 
            person.Messages.Add(message);

            return person;
        }

        public async Task<Person> helloWorldAsync(string message, Person person)
        {            
            //await Task.Delay(1000);

            person.Messages.Add(message);
           // await Task.Delay(1000);

            return person;
        }
    }
}
