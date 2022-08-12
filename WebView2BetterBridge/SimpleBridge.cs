using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebView2BetterBridge
{
    public class SimpleBridge
    {
        public async Task StartSendingMessagesAsync()
        {
            BetterBridge.Current.SendMessage("message", new Message() { Text = "Message 1", Sent = DateTime.Now });
            await Task.Delay(3000);
            BetterBridge.Current.SendMessage("message", new Message() { Text = "Message 2", Sent = DateTime.Now });
            await Task.Delay(3000);
            BetterBridge.Current.SendMessage("message", new Message() { Text = "Message 3", Sent = DateTime.Now });
        }

        public Message HelloWorld(int someData, string moreData, Message message)
        {
            return new Message()
            {
                Text = $"Hi from C#! Thank you for the data: {message.Text} {message.Sent} {someData} and {moreData}.",
                Sent = DateTime.Now
            };
        }

        public async Task<Message> HelloWorldAsync(int someData, string moreData, Message message)
        {
            await Task.Delay(1000);

            var msg = new Message()
            {
                Text = $"Hi from C#! Thank you for the data: {message.Text} {message.Sent} {someData} and {moreData}.",
                Sent = DateTime.Now
            };

            await Task.Delay(1000);

            return msg;
        }
    }

    public class Message
    {
        public string Text { get; set; }

        public DateTime Sent { get; set; }
    }
}
