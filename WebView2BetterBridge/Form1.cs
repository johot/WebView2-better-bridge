using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace WebView2BetterBridge
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
            this.Resize += new System.EventHandler(this.Form_Resize);
            InitializeAsync();
        }

        private void Form_Resize(object sender, EventArgs e)
        {
            webView2.Size = this.ClientSize - new System.Drawing.Size(webView2.Location);
        }

        async void InitializeAsync()
        {
            await webView2.EnsureCoreWebView2Async(null);

            webView2.Source = new Uri("http://localhost:3000");
            webView2.CoreWebView2.AddHostObjectToScript("bridge", new BetterBridge(new SimpleBridge(new BetterBridgeMessageSender(webView2)), webView2));
        }
    }

    public class MyFunctions
    {
        public async Task<string> HelloWorld(Int64 nr)
        {
            await Task.Delay(3000);
            return "HELLO!";
        }
    }
}
