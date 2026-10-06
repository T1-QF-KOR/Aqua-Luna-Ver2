param([string]$ChromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe')

# Real Chromium input and filesystem download/import checks. Uses only a dedicated test profile.
$ErrorActionPreference = 'Stop'
$qaRoot = Split-Path -Parent $PSScriptRoot
$qaDirectory = Join-Path $qaRoot 'qa'
$runId = [Guid]::NewGuid().ToString('N').Substring(0, 10)
$profilePath = Join-Path $qaDirectory "chrome-native-$runId"
$downloadPath = Join-Path $qaDirectory "downloads-$runId"
New-Item -ItemType Directory -Force -Path $profilePath, $downloadPath | Out-Null
$script:socket = $null
$script:commandNumber = 0
$checks = [System.Collections.Generic.List[string]]::new()
$browserProcess = $null

function Send-Cdp([string]$Method, [hashtable]$Params = @{}) {
    $script:commandNumber += 1
    $requestId = $script:commandNumber
    $message = @{ id = $requestId; method = $Method; params = $Params } | ConvertTo-Json -Depth 40 -Compress
    $bytes = [Text.Encoding]::UTF8.GetBytes($message)
    $timeout = [Threading.CancellationTokenSource]::new(20000)
    try {
        $script:socket.SendAsync([ArraySegment[byte]]::new($bytes), [Net.WebSockets.WebSocketMessageType]::Text, $true, $timeout.Token).GetAwaiter().GetResult() | Out-Null
        while ($true) {
            $stream = [IO.MemoryStream]::new()
            try {
                do {
                    $buffer = New-Object byte[] 65536
                    $received = $script:socket.ReceiveAsync([ArraySegment[byte]]::new($buffer), $timeout.Token).GetAwaiter().GetResult()
                    if ($received.MessageType -eq [Net.WebSockets.WebSocketMessageType]::Close) { throw 'Browser closed the debugging connection.' }
                    $stream.Write($buffer, 0, $received.Count)
                } while (-not $received.EndOfMessage)
                $response = [Text.Encoding]::UTF8.GetString($stream.ToArray()) | ConvertFrom-Json
            } finally { $stream.Dispose() }
            if ($response.id -eq $requestId) {
                if ($response.error) { throw ($response.error | ConvertTo-Json -Compress) }
                return $response.result
            }
        }
    } finally { $timeout.Dispose() }
}

function Eval-Js([string]$Expression) {
    $result = Send-Cdp 'Runtime.evaluate' @{ expression = $Expression; returnByValue = $true; awaitPromise = $true }
    if ($result.exceptionDetails) { throw ($result.exceptionDetails | ConvertTo-Json -Depth 8 -Compress) }
    return $result.result.value
}

function Assert-Js([string]$Name, [string]$Expression) {
    if ((Eval-Js $Expression) -ne $true) { throw "FAILED: $Name" }
    $checks.Add("PASS $Name")
}

function Press-Key([string]$Key, [string]$Code, [int]$VirtualKey, [int]$Modifiers = 0) {
    $keyEvent = @{ type = 'keyDown'; key = $Key; code = $Code; windowsVirtualKeyCode = $VirtualKey; modifiers = $Modifiers }
    if ($Key -eq 'Enter') { $keyEvent.text = "`r"; $keyEvent.unmodifiedText = "`r" }
    Send-Cdp 'Input.dispatchKeyEvent' $keyEvent | Out-Null
    Send-Cdp 'Input.dispatchKeyEvent' @{ type = 'keyUp'; key = $Key; code = $Code; windowsVirtualKeyCode = $VirtualKey; modifiers = $Modifiers } | Out-Null
}

function Wait-Js([string]$Expression) {
    $watch = [Diagnostics.Stopwatch]::StartNew()
    while ($watch.ElapsedMilliseconds -lt 12000) {
        if ((Eval-Js $Expression) -eq $true) { return }
        Start-Sleep -Milliseconds 80
    }
    throw "Timed out waiting for $Expression"
}

try {
    $arguments = @('--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', '--remote-debugging-address=127.0.0.1', "--user-data-dir=`"$profilePath`"", 'about:blank')
    $browserProcess = Start-Process -FilePath $ChromePath -ArgumentList $arguments -WindowStyle Hidden -PassThru -RedirectStandardError (Join-Path $qaDirectory 'native-browser.log')
    $portFile = Join-Path $profilePath 'DevToolsActivePort'
    $watch = [Diagnostics.Stopwatch]::StartNew()
    while (-not (Test-Path -LiteralPath $portFile)) {
        if ($browserProcess.HasExited) { throw 'Dedicated test browser exited during startup.' }
        if ($watch.ElapsedMilliseconds -gt 12000) { throw 'Browser did not provide its debugging port.' }
        Start-Sleep -Milliseconds 100
    }
    $port = [int](Get-Content -LiteralPath $portFile -TotalCount 1)
    $pages = Invoke-RestMethod -Uri "http://127.0.0.1:$port/json/list"
    $page = $pages | Where-Object type -eq 'page' | Select-Object -First 1
    if (-not $page.webSocketDebuggerUrl) { throw 'No page target returned by the test browser.' }
    $script:socket = [Net.WebSockets.ClientWebSocket]::new()
    $script:socket.ConnectAsync([Uri]$page.webSocketDebuggerUrl, [Threading.CancellationToken]::None).GetAwaiter().GetResult() | Out-Null
    Send-Cdp 'Page.enable' | Out-Null
    Send-Cdp 'Browser.setDownloadBehavior' @{ behavior = 'allow'; downloadPath = $downloadPath } | Out-Null
    $gameUrl = ([Uri](Join-Path $qaRoot 'index.html')).AbsoluteUri
    Send-Cdp 'Page.navigate' @{ url = $gameUrl } | Out-Null
    Wait-Js "Boolean(window.LunaEngine && document.getElementById('new-game'))"
    Send-Cdp 'Page.bringToFront' | Out-Null
    Eval-Js "document.getElementById('new-game').focus()" | Out-Null
    Assert-Js 'Initial action receives browser focus' "document.activeElement.id === 'new-game'"
    Press-Key 'Enter' 'Enter' 13
    Wait-Js "!document.getElementById('play-screen').hidden"
    Assert-Js 'Enter starts a new game and focuses the work action' "document.activeElement.id === 'work-button' && LunaEngine.storage.load(0).money === 80000"

    Press-Key 'Enter' 'Enter' 13
    Wait-Js "document.getElementById('modal').open"
    Assert-Js 'Keyboard opens work menu with visible focus' "document.activeElement.id === 'close-modal'"
    Press-Key 'Tab' 'Tab' 9
    Assert-Js 'Tab enters first available work action' "document.activeElement.dataset.actionId === 'cafe'"
    Press-Key 'Enter' 'Enter' 13
    Assert-Js 'Enter opens resource preview without spending time' "Boolean(document.querySelector('.resource-preview')) && LunaEngine.storage.load(0).ap === 3"
    Press-Key 'Escape' 'Escape' 27
    Wait-Js "!document.getElementById('modal').open"
    Assert-Js 'Escape cancels preview and restores trigger focus' "document.activeElement.id === 'work-button' && LunaEngine.storage.load(0).money === 80000"

    # Earn once, then export through the actual browser download mechanism.
    Eval-Js "document.getElementById('work-button').click(); document.querySelector('[data-action-id=edit]').click(); document.querySelector('#modal-body .confirm-actions .primary').click(); document.getElementById('save-button').click(); [...document.querySelectorAll('#modal-body button')].find(b=>b.textContent==='파일 내보내기').click()" | Out-Null
    $saveFile = Join-Path $downloadPath 'aqua-luna-day-1.json'
    $watch.Restart()
    while (-not (Test-Path -LiteralPath $saveFile)) {
        if ($watch.ElapsedMilliseconds -gt 12000) { throw 'Save file download did not complete.' }
        Start-Sleep -Milliseconds 100
    }
    $exported = Get-Content -LiteralPath $saveFile -Raw -Encoding utf8 | ConvertFrom-Json
    if ($exported.money -ne 155000 -or $exported.journal.Count -ne 1) { throw 'Exported file does not contain current play state.' }
    $checks.Add('PASS actual downloaded JSON contains earned money and history')
    Assert-Js 'Save notification remains visible inside an open modal' "document.getElementById('toast').parentElement.id === 'modal' && !document.getElementById('toast').hidden"

    Eval-Js "document.getElementById('close-modal').click(); document.getElementById('home-button').click(); document.getElementById('new-game').click(); document.querySelector('#modal-body .confirm-actions .primary').click(); document.getElementById('load-button').click()" | Out-Null
    $document = Send-Cdp 'DOM.getDocument'
    $input = Send-Cdp 'DOM.querySelector' @{ nodeId = $document.root.nodeId; selector = '#modal-body input[type=file]' }
    Send-Cdp 'DOM.setFileInputFiles' @{ nodeId = $input.nodeId; files = @($saveFile) } | Out-Null
    Wait-Js "document.getElementById('modal-title').textContent === '저장 파일 불러오기'"
    Assert-Js 'File import asks before replacing the current play state' "LunaEngine.storage.load(0).money === 80000"
    Eval-Js "document.querySelector('#modal-body .confirm-actions .primary').focus()" | Out-Null
    Press-Key 'Enter' 'Enter' 13
    Wait-Js "!document.getElementById('modal').open"
    Assert-Js 'Enter confirms imported save and restores full state' "LunaEngine.storage.load(0).money === 155000 && LunaEngine.storage.load(0).ap === 2 && LunaEngine.storage.load(0).journal.length === 1"

    # Browser reload is distinct from in-memory title/continue.
    Send-Cdp 'Page.reload' | Out-Null
    Wait-Js "Boolean(window.LunaEngine && document.getElementById('continue-game') && !document.getElementById('continue-game').disabled)"
    Eval-Js "document.getElementById('continue-game').focus()" | Out-Null
    Press-Key 'Enter' 'Enter' 13
    Wait-Js "!document.getElementById('play-screen').hidden"
    Assert-Js 'Reload plus keyboard continue restores downloaded/imported session' "document.getElementById('money').textContent.includes('155,000') && LunaEngine.storage.load(0).ap === 2"

    $checks | Set-Content -LiteralPath (Join-Path $qaDirectory 'NATIVE_INPUT_RESULTS.txt') -Encoding utf8
    $checks | Write-Output
} catch {
    $checks.Add("FAIL $($_.Exception.Message)")
    $checks | Set-Content -LiteralPath (Join-Path $qaDirectory 'NATIVE_INPUT_RESULTS.txt') -Encoding utf8
    if ($script:socket -and $script:socket.State -eq [Net.WebSockets.WebSocketState]::Open) {
        try { Eval-Js "JSON.stringify({focus:document.activeElement?.id,modal:document.getElementById('modal')?.open,title:document.getElementById('modal-title')?.textContent,ready:document.readyState})" | Set-Content -LiteralPath (Join-Path $qaDirectory 'native-debug.txt') -Encoding utf8 } catch { }
    }
    throw
} finally {
    if ($script:socket -and $script:socket.State -eq [Net.WebSockets.WebSocketState]::Open) {
        try { Send-Cdp 'Browser.close' | Out-Null } catch { }
        $script:socket.Dispose()
    }
    if ($browserProcess -and -not $browserProcess.HasExited) {
        if (-not $browserProcess.WaitForExit(3000)) { Stop-Process -Id $browserProcess.Id -ErrorAction SilentlyContinue }
    }
}
