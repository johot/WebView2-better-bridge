﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebView2BetterBridge
{
    public class SimpleBridge
    {
        private readonly BetterBridgeMessageSender messageSender;

        public SimpleBridge(BetterBridgeMessageSender messageSender)
        {
            this.messageSender = messageSender;
        }

        public async Task StartSendingMessagesAsync()
        {
            messageSender.SendMessage("message", new Message() { Text = "Message 1", Sent = DateTime.Now });
            await Task.Delay(1000);
            messageSender.SendMessage("message", new Message() { Text = "Message 2", Sent = DateTime.Now });
            await Task.Delay(1000);
            messageSender.SendMessage("message", new Message() { Text = "Message 3", Sent = DateTime.Now });
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
            var msg = new Message()
            {
                Text = $"Hi from C#! Thank you for the data: {message.Text} {message.Sent} {someData} and {moreData}.",
                Sent = DateTime.Now
            };

            await Task.Delay(500);

            return msg;
        }
    }

    public class Message
    {
        public string Text { get; set; }

        public DateTime Sent { get; set; }
    }
}
