param([string]$ChromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe')

# Serve tests/acoustic-server.mjs first. Each run uses a dedicated Chromium profile.
$ErrorActionPreference = 'Stop'
$qaRoot = Split-Path -Parent $PSScriptRoot
$qaDirectory = Join-Path $qaRoot 'qa'
$resultsDirectory = Join-Path $qaDirectory 'results'
New-Item -ItemType Directory -Force -Path $resultsDirectory | Out-Null
$runId = [Guid]::NewGuid().ToString('N').Substring(0, 10)
$profilePath = Join-Path $qaDirectory "chrome-native-$runId"
$downloadPath = Join-Path $qaDirectory "downloads-$runId"
New-Item -ItemType Directory -Force -Path $profilePath, $downloadPath | Out-Null
$script:socket = $null
$script:commandNumber = 0
$checks = [System.Collections.Generic.List[string]]::new()
$browserProcess = $null
$script:qaEvents = [System.Collections.Generic.List[string]]::new()

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
            if ($response.method -eq 'Runtime.exceptionThrown') { $script:qaEvents.Add(($response.params | ConvertTo-Json -Depth 8 -Compress)) }
            if ($response.method -eq 'Network.responseReceived' -and $response.params.response.status -ge 400 -and $response.params.response.url -notmatch '/favicon.ico$') { $script:qaEvents.Add($response.params.response.url) }
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
    Send-Cdp 'Emulation.setDeviceMetricsOverride' @{width=1280;height=720;deviceScaleFactor=1;mobile=$false} | Out-Null
    Send-Cdp 'Browser.setDownloadBehavior' @{ behavior = 'allow'; downloadPath = $downloadPath } | Out-Null
    $allResults = @()
    $script:qaEvents = [System.Collections.Generic.List[string]]::new()
    Send-Cdp 'Runtime.enable' | Out-Null
    Send-Cdp 'Network.enable' | Out-Null
    foreach ($width in @(1440,1280)) {
        Send-Cdp 'Emulation.setDeviceMetricsOverride' @{width=$width;height=900;deviceScaleFactor=1;mobile=$false} | Out-Null
        foreach ($suite in @('acoustic','acoustic-ui','intro','story-ui','courses-ui','activities-ui','somesome-ui','ui','reliability')) {
            $suiteUrl = "http://127.0.0.1:4173/tests/$suite.html"
            Send-Cdp 'Page.navigate' @{url=$suiteUrl} | Out-Null
            try { Wait-Js "['passed','failed'].includes(document.body.dataset.status)" } catch { Write-Output (Eval-Js "({url:location.href,title:document.title,body:document.body.innerText.slice(0,3000),scripts:[...document.scripts].map(s=>s.src),engine:!!window.LunaEngine})"); throw }
            $detail = Eval-Js "document.getElementById('results').textContent"
            Write-Output "$width $suite $detail"
            Assert-Js "$width $suite" "document.body.dataset.status==='passed'"
            $allResults += @{width=$width;suite=$suite;result=$detail}
            if ($suite -eq 'acoustic-ui') {
                $capture = Send-Cdp 'Page.captureScreenshot' @{format='png'}
                [IO.File]::WriteAllBytes((Join-Path $qaDirectory "acoustic-2026-10-21/project-$width.png"),[Convert]::FromBase64String($capture.data))
            }
        }
    }
    Send-Cdp 'Page.navigate' @{url='http://127.0.0.1:4173/index.html'} | Out-Null
    Wait-Js "Boolean(window.LunaEngine && document.readyState==='complete')"
    Eval-Js "localStorage.clear();document.getElementById('new-game').focus()" | Out-Null
    Press-Key 'Enter' 'Enter' 13
    Assert-Js 'Ballad vocal major in new-game intro' "document.getElementById('intro-lines').textContent.includes('발라드')&&document.getElementById('intro-lines').textContent.includes('실용음악과 보컬 전공')"
    $capture = Send-Cdp 'Page.captureScreenshot' @{format='png'}
    [IO.File]::WriteAllBytes((Join-Path $qaDirectory 'acoustic-2026-10-21/intro.png'),[Convert]::FromBase64String($capture.data))
    Eval-Js "document.getElementById('intro-skip').click();let acousticState=LunaEngine.makeState();acousticState.trust=20;acousticState=LunaEngine.act(acousticState,'work','event').state;acousticState=LunaEngine.act(acousticState,'nextDay').state;acousticState=LunaEngine.act(acousticState,'date','concert').state;LunaEngine.storage.save(0,acousticState)" | Out-Null
    Send-Cdp 'Page.reload' @{} | Out-Null
    Wait-Js "Boolean(window.LunaEngine&&document.readyState==='complete')"
    Eval-Js "document.getElementById('continue-game').click()" | Out-Null
    Assert-Js 'Concert resume uses ballad scene in live cafe' "LunaEngine.storage.load(0).story.active.id==='concert'&&document.getElementById('modal-body').textContent.includes('발라드')&&LunaData.sceneImage('concert').includes('acoustic-live')"
    Wait-Js "[...document.querySelectorAll('img')].filter(i=>i.offsetWidth).every(i=>i.complete&&i.naturalWidth>0)"
    Eval-Js "new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(true);i.onerror=reject;i.src=LunaData.sceneImage('concert')})" | Out-Null
    Eval-Js "document.querySelectorAll('.vn-tool').forEach(b=>{if(b.textContent==='건너뛰기')b.click()});new Promise(r=>setTimeout(r,600))" | Out-Null
    $capture = Send-Cdp 'Page.captureScreenshot' @{format='png'}
    [IO.File]::WriteAllBytes((Join-Path $qaDirectory 'acoustic-2026-10-21/concert.png'),[Convert]::FromBase64String($capture.data))
    Send-Cdp 'Emulation.setDeviceMetricsOverride' @{width=390;height=844;deviceScaleFactor=1;mobile=$true} | Out-Null
    $capture = Send-Cdp 'Page.captureScreenshot' @{format='png'}
    [IO.File]::WriteAllBytes((Join-Path $qaDirectory 'acoustic-2026-10-21/unsupported-mobile.png'),[Convert]::FromBase64String($capture.data))
    if ($script:qaEvents.Count) { throw ($script:qaEvents -join "`n") }
    @{status='passed';checks=@($checks);suites=$allResults;runtime='Chromium via .NET ClientWebSocket CDP';runtimeAndNetworkErrors=@($script:qaEvents);viewports=@('1440x900','1280x900','390x844 PC-only boundary')} | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 (Join-Path $qaDirectory 'acoustic-2026-10-21/results.json')
} catch {
    @{status='failed';checks=@($checks);errors=@($script:qaEvents);error=$_.ToString()} | ConvertTo-Json -Depth 8 | Set-Content -Encoding UTF8 (Join-Path $qaDirectory 'acoustic-2026-10-21/results.json')
    throw
} finally {
    if ($script:socket) { try { Send-Cdp 'Browser.close' | Out-Null } catch {} ; $script:socket.Dispose() }
    if ($browserProcess -and -not $browserProcess.HasExited) { if (-not $browserProcess.WaitForExit(3000)) { Stop-Process -Id $browserProcess.Id -ErrorAction SilentlyContinue } }
}
