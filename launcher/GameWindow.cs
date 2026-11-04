using System.Diagnostics;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace AquaLuna;

// Hosts the HTML game in WebView2 so it runs as a desktop app instead of a browser tab.
sealed class GameWindow : Form
{
    // The game's saves live in localStorage, which is keyed to this origin. Never change it after release.
    const string Host = "aqualuna.example";
    const string StartUrl = $"https://{Host}/index.html";
    // The game layout needs at least 1280×720 CSS pixels; smaller windows are zoomed out instead of cropped.
    const int MinCssWidth = 1280, MinCssHeight = 720;
    const string KeyBridge = """
        addEventListener('keydown', e => {
          if (e.key === 'F11' || (e.key === 'Enter' && e.altKey)) { e.preventDefault(); e.stopImmediatePropagation(); chrome.webview.postMessage('fullscreen'); }
        }, true);
        """;

    readonly WebView2 view = new() { Dock = DockStyle.Fill, AllowExternalDrop = false, DefaultBackgroundColor = Color.FromArgb(16, 28, 45) };
    readonly string gameRoot;
    bool fullscreen, closeConfirmed;
    FormWindowState restoreState;
    Rectangle restoreBounds;

    public GameWindow(string gameRoot)
    {
        this.gameRoot = gameRoot;
        Text = "Aqua Luna · 한여울의 첫해";
        Icon = Icon.ExtractAssociatedIcon(Application.ExecutablePath);
        BackColor = view.DefaultBackgroundColor;
        StartPosition = FormStartPosition.CenterScreen;
        MinimumSize = new Size(800, 480);
        var scale = DeviceDpi / 96.0;
        var area = Screen.FromPoint(Cursor.Position).WorkingArea;
        ClientSize = new Size(Math.Min((int)(1440 * scale), area.Width - 40), Math.Min((int)(900 * scale), area.Height - 60));
        Controls.Add(view);
        Load += async (_, _) => await StartAsync();
        Resize += (_, _) => FitZoom();
        DpiChanged += (_, _) => FitZoom();
    }

    async Task StartAsync()
    {
        var dataFolder = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "AquaLuna", "WebView2");
        try
        {
#if DEBUG
            // Development only: AQUALUNA_DEVTOOLS_PORT=9333 lets test scripts drive the game over the DevTools protocol.
            var port = Environment.GetEnvironmentVariable("AQUALUNA_DEVTOOLS_PORT");
            var options = string.IsNullOrEmpty(port) ? null : new CoreWebView2EnvironmentOptions($"--remote-debugging-port={port}");
#else
            CoreWebView2EnvironmentOptions? options = null;
#endif
            var env = await CoreWebView2Environment.CreateAsync(null, dataFolder, options);
            await view.EnsureCoreWebView2Async(env);
        }
        catch (WebView2RuntimeNotFoundException)
        {
            MessageBox.Show(this, "실행에 필요한 Microsoft Edge WebView2 런타임이 없어요.\n확인을 누르면 설치 페이지를 엽니다.", "Aqua Luna", MessageBoxButtons.OK, MessageBoxIcon.Error);
            OpenExternal("https://go.microsoft.com/fwlink/p/?LinkId=2124703");
            Close();
            return;
        }

        var core = view.CoreWebView2;
        var settings = core.Settings;
#if !DEBUG
        settings.AreDevToolsEnabled = false;
        settings.AreDefaultContextMenusEnabled = false;
#endif
        settings.AreBrowserAcceleratorKeysEnabled = false;
        settings.IsZoomControlEnabled = false;
        settings.IsPinchZoomEnabled = false;
        settings.IsSwipeNavigationEnabled = false;
        settings.IsStatusBarEnabled = false;
        settings.IsGeneralAutofillEnabled = false;
        settings.IsPasswordAutosaveEnabled = false;

        core.SetVirtualHostNameToFolderMapping(Host, gameRoot, CoreWebView2HostResourceAccessKind.Deny);
        core.NewWindowRequested += (_, e) => { e.Handled = true; OpenExternal(e.Uri); };
        core.NavigationStarting += (_, e) => { if (!IsGameUri(e.Uri)) { e.Cancel = true; OpenExternal(e.Uri); } };
        core.NavigationCompleted += (_, _) => FitZoom();
        core.DownloadStarting += OnDownloadStarting;
        core.WebMessageReceived += (_, e) => { if (e.TryGetWebMessageAsString() == "fullscreen") ToggleFullscreen(); };
        core.ProcessFailed += OnProcessFailed;
        await core.AddScriptToExecuteOnDocumentCreatedAsync(KeyBridge);

        FitZoom();
        core.Navigate(StartUrl);
    }

    static bool IsGameUri(string uri) =>
        uri.StartsWith($"https://{Host}/", StringComparison.OrdinalIgnoreCase) || uri.StartsWith("blob:", StringComparison.OrdinalIgnoreCase)
        || uri.StartsWith("data:", StringComparison.OrdinalIgnoreCase) || uri.StartsWith("about:", StringComparison.OrdinalIgnoreCase);

    static void OpenExternal(string uri)
    {
        if (Uri.TryCreate(uri, UriKind.Absolute, out var u) && (u.Scheme == Uri.UriSchemeHttps || u.Scheme == Uri.UriSchemeHttp))
            Process.Start(new ProcessStartInfo(u.AbsoluteUri) { UseShellExecute = true });
    }

    void FitZoom()
    {
        var size = view.ClientSize;
        if (WindowState == FormWindowState.Minimized || size.Width <= 0 || size.Height <= 0) return;
        var scale = DeviceDpi / 96.0;
        view.ZoomFactor = Math.Min(1.0, Math.Min(size.Width / (MinCssWidth * scale), size.Height / (MinCssHeight * scale)));
    }

    void ToggleFullscreen()
    {
        fullscreen = !fullscreen;
        if (fullscreen)
        {
            restoreState = WindowState;
            restoreBounds = WindowState == FormWindowState.Normal ? Bounds : RestoreBounds;
            if (WindowState == FormWindowState.Maximized) WindowState = FormWindowState.Normal;
            FormBorderStyle = FormBorderStyle.None;
            WindowState = FormWindowState.Maximized;
        }
        else
        {
            // Re-adding the border keeps the borderless size, so put the exact previous window back.
            FormBorderStyle = FormBorderStyle.Sizable;
            WindowState = FormWindowState.Normal;
            Bounds = restoreBounds;
            WindowState = restoreState;
        }
    }

    // "파일 내보내기" downloads a JSON save; let the player pick where it goes (defaults to Downloads).
    void OnDownloadStarting(object? sender, CoreWebView2DownloadStartingEventArgs e)
    {
        var deferral = e.GetDeferral();
        BeginInvoke(() =>
        {
            try
            {
                using var dialog = new SaveFileDialog
                {
                    Title = "저장 파일 보관",
                    FileName = Path.GetFileName(e.ResultFilePath),
                    InitialDirectory = Path.GetDirectoryName(e.ResultFilePath),
                    Filter = "Aqua Luna 저장 파일 (*.json)|*.json|모든 파일 (*.*)|*.*",
                };
                if (dialog.ShowDialog(this) == DialogResult.OK) { e.ResultFilePath = dialog.FileName; e.Handled = true; }
                else e.Cancel = true;
            }
            finally { deferral.Complete(); }
        });
    }

    void OnProcessFailed(object? sender, CoreWebView2ProcessFailedEventArgs e)
    {
        if (e.ProcessFailedKind == CoreWebView2ProcessFailedKind.BrowserProcessExited)
        {
            MessageBox.Show(this, "게임 화면이 예기치 않게 종료됐어요. 자동 저장된 곳부터 다시 이어 할 수 있어요.", "Aqua Luna", MessageBoxButtons.OK, MessageBoxIcon.Error);
            closeConfirmed = true;
            Close();
        }
        else if (e.ProcessFailedKind is CoreWebView2ProcessFailedKind.RenderProcessExited or CoreWebView2ProcessFailedKind.RenderProcessUnresponsive)
        {
            MessageBox.Show(this, "게임 화면에 문제가 생겨 다시 불러올게요. 자동 저장된 곳부터 이어 할 수 있어요.", "Aqua Luna", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            view.Reload();
        }
    }

    // The game shows #save-warning when autosave failed; closing then would lose progress, as the browser's beforeunload warned.
    protected override async void OnFormClosing(FormClosingEventArgs e)
    {
        if (closeConfirmed || view.CoreWebView2 is null) { base.OnFormClosing(e); return; }
        e.Cancel = true;
        var unsaved = "false";
        try { unsaved = await view.CoreWebView2.ExecuteScriptAsync("(s => !!s && !s.hidden)(document.getElementById('save-warning'))"); }
        catch (Exception) { }
        if (unsaved == "true" && MessageBox.Show(this, "자동 저장이 막혀 아직 저장되지 않은 진행이 있어요.\n그래도 종료할까요? 게임 상단의 '파일로 보관'으로 먼저 백업할 수 있어요.", "Aqua Luna", MessageBoxButtons.YesNo, MessageBoxIcon.Warning) != DialogResult.Yes) return;
        closeConfirmed = true;
        Close();
    }
}
