using System;
using System.IO;
using System.Windows.Forms;
using AcApp = Autodesk.AutoCAD.ApplicationServices.Application;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace LawCheckingList.AutoCAD
{
    // 以 WebView2 承載網頁版檢索工具的面板內容
    public class LawPaletteControl : UserControl
    {
        private const string VirtualHost = "lawcheck.local";
        private const string DevServerUrl = "http://localhost:3000";

        private readonly WebView2 _webView = new WebView2 { Dock = DockStyle.Fill };

        public LawPaletteControl()
        {
            Controls.Add(_webView);
        }

        protected override async void OnLoad(EventArgs e)
        {
            base.OnLoad(e);
            try
            {
                string addinDir = Path.GetDirectoryName(typeof(LawPaletteControl).Assembly.Location);

                // 外掛是被 acad.exe 載入的，WebView2Loader.dll 不在系統搜尋路徑上，需手動指定
                string loaderDir = Path.Combine(addinDir, "runtimes", "win-x64", "native");
                if (!File.Exists(Path.Combine(loaderDir, "WebView2Loader.dll")))
                    loaderDir = addinDir;
                try
                {
                    CoreWebView2Environment.SetLoaderDllFolderPath(loaderDir);
                }
                catch (InvalidOperationException)
                {
                    // 其他元件已先載入 WebView2Loader，直接沿用即可
                }

                // 預設的使用者資料夾會建在 acad.exe 旁（Program Files，無寫入權限），改放 LocalAppData
                string userDataDir = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                    "LawCheckingList.AutoCAD", "WebView2");
                var env = await CoreWebView2Environment.CreateAsync(null, userDataDir);
                await _webView.EnsureCoreWebView2Async(env);

                // 優先載入外掛旁的 web\（npm run build 產出的 dist）；沒有的話連 npm run dev 的開發伺服器
                string webDir = Path.Combine(addinDir, "web");
                if (File.Exists(Path.Combine(webDir, "index.html")))
                {
                    _webView.CoreWebView2.SetVirtualHostNameToFolderMapping(
                        VirtualHost, webDir, CoreWebView2HostResourceAccessKind.Allow);
                    _webView.CoreWebView2.Navigate($"https://{VirtualHost}/index.html");
                }
                else
                {
                    _webView.CoreWebView2.Navigate(DevServerUrl);
                }
            }
            catch (Exception ex)
            {
                AcApp.DocumentManager.MdiActiveDocument?.Editor.WriteMessage(
                    $"\n[LAWCHECK] WebView2 初始化失敗：{ex.Message}" +
                    "\n請確認已安裝 Microsoft Edge WebView2 Runtime。\n");
            }
        }
    }
}
