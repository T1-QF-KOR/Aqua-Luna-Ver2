namespace AquaLuna;

static class Program
{
    [STAThread]
    static void Main()
    {
        ApplicationConfiguration.Initialize();
        var gameRoot = FindGameRoot();
        if (gameRoot is null)
        {
            MessageBox.Show("게임 파일(game\\index.html)을 찾지 못했어요.\n설치 폴더가 온전한지 확인해 주세요.", "Aqua Luna", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return;
        }
        Application.Run(new GameWindow(gameRoot));
    }

    // Release layout: AquaLuna.exe beside game\index.html. Development: walk up from bin\ to the repository root.
    static string? FindGameRoot()
    {
        var packaged = Path.Combine(AppContext.BaseDirectory, "game");
        if (File.Exists(Path.Combine(packaged, "index.html"))) return packaged;
        for (var dir = new DirectoryInfo(AppContext.BaseDirectory); dir is not null; dir = dir.Parent)
            if (File.Exists(Path.Combine(dir.FullName, "index.html")) && File.Exists(Path.Combine(dir.FullName, "src", "campus-v2", "game.js"))) return dir.FullName;
        return null;
    }
}
