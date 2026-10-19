param([string]$ChromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe', [string[]]$Tests = @('runner','story','courses','activities','reliability','ui','wardrobe','story-ui','fashion','courses-ui','activities-ui'), [switch]$ContinueOnFailure)

# Real Chromium input and filesystem download/import checks. Uses only a dedicated test profile.
$ErrorActionPreference = 'Stop'
$qaRoot = (Get-Location).Path
$qaDirectory = Join-Path $qaRoot 'qa'
$resultsDirectory = Join-Path $qaDirectory 'results'
New-Item -ItemType Directory -Force -Path $resultsDirectory | Out-Null
$runId = [Guid]::NewGuid().ToString('N').Substring(0, 10)
$profilePath = Join-Path $qaDirectory "chrome-native-$runId"
New-Item -ItemType Directory -Force -Path $profilePath | Out-Null
$script:socket = $null
$script:commandNumber = 0
$checks = [System.Collections.Generic.List[string]]::new()
$failures = [System.Collections.Generic.List[string]]::new()
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
    $arguments = @('--headless=new', '--disable-gpu', '--allow-file-access-from-files', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', '--remote-debugging-address=127.0.0.1', "--user-data-dir=`"$profilePath`"", 'about:blank')
    $browserProcess = Start-Process -FilePath $ChromePath -ArgumentList $arguments -WindowStyle Hidden -PassThru -RedirectStandardError (Join-Path $qaDirectory 'story-browser.log')
    $portFile = Join-Path $profilePath 'DevToolsActivePort'
    $watch = [Diagnostics.Stopwatch]::StartNew()
    while (-not (Test-Path -LiteralPath $portFile)) {
        if ($browserProcess.HasExited -or $watch.ElapsedMilliseconds -gt 12000) { throw 'Dedicated test browser failed to start.' }
        Start-Sleep -Milliseconds 100
    }
    $port = [int](Get-Content -LiteralPath $portFile -TotalCount 1)
    $pages = Invoke-RestMethod -Uri "http://127.0.0.1:$port/json/list"
    $page = $pages | Where-Object type -eq 'page' | Select-Object -First 1
    $script:socket = [Net.WebSockets.ClientWebSocket]::new()
    $script:socket.ConnectAsync([Uri]$page.webSocketDebuggerUrl, [Threading.CancellationToken]::None).GetAwaiter().GetResult() | Out-Null
    Send-Cdp 'Page.enable' | Out-Null
    # Each suite/viewport starts fresh; iframe reloads within a suite retain their saves.
    Send-Cdp 'Page.addScriptToEvaluateOnNewDocument' @{source="if(window === window.top && location.protocol === 'file:') { localStorage.clear(); sessionStorage.clear(); }"} | Out-Null
    foreach ($test in $Tests) {
        $widths = if ($test -in @('courses-ui','activities-ui','ui','wardrobe','story-ui','fashion')) { @(1280,1440,1920) } else { @(1440) }
        foreach ($width in $widths) {
            Send-Cdp 'Emulation.setDeviceMetricsOverride' @{width=$width;height=$(if ($width -eq 1280) { 720 } elseif ($width -eq 1920) { 1080 } else { 900 });deviceScaleFactor=1;mobile=$false} | Out-Null
            $url = ([Uri](Join-Path $qaRoot "tests/$test.html")).AbsoluteUri + "?viewport=$width"
            Send-Cdp 'Page.navigate' @{url=$url} | Out-Null
            $pageLiteral = $url | ConvertTo-Json -Compress
            Wait-Js "location.href === $pageLiteral && ['passed','failed'].includes(document.body?.dataset.status)"
            $status = Eval-Js 'document.body.dataset.status'
            $result = Eval-Js 'document.getElementById("results").textContent'
            Write-Output "$test $width $status`n$result"
            [IO.File]::WriteAllText((Join-Path $resultsDirectory "narrative-$test-$width.txt"),$result,[Text.UTF8Encoding]::new($false))
            Start-Sleep -Milliseconds 250
            $shot = Send-Cdp 'Page.captureScreenshot' @{format='png';captureBeyondViewport=$false}
            [IO.File]::WriteAllBytes((Join-Path $qaDirectory "narrative-$test-$width.png"),[Convert]::FromBase64String($shot.data))
            if ($status -eq 'failed') { $failures.Add("$test at $width"); if ($ContinueOnFailure) { continue }; throw "Failed $test at $width" }
            if ($test -eq 'activities') {
                $audit = Eval-Js 'JSON.stringify(window.activityAudit,null,2)'
                [IO.File]::WriteAllText((Join-Path $qaDirectory 'activity-audit.json'),$audit,[Text.UTF8Encoding]::new($false))
            }
            if ($test -eq 'activities-ui') {
                $beforeMoves = Eval-Js 'window.activityMoveCount()'
                $key = Eval-Js 'window.activityKey()'
                $keyCode = @{ArrowUp=38;ArrowDown=40;ArrowLeft=37;ArrowRight=39}[$key]
                Press-Key $key $key $keyCode
                Assert-Js "Activity $width native arrow moves one tile" "window.activityMoveCount() === $($beforeMoves + 1)"
                Eval-Js 'window.showMusic()' | Out-Null
                $shot = Send-Cdp 'Page.captureScreenshot' @{format='png';captureBeyondViewport=$false}
                [IO.File]::WriteAllBytes((Join-Path $qaDirectory "activity-music-$width.png"),[Convert]::FromBase64String($shot.data))
                Eval-Js 'window.showMemory()' | Out-Null
                $shot = Send-Cdp 'Page.captureScreenshot' @{format='png';captureBeyondViewport=$false}
                [IO.File]::WriteAllBytes((Join-Path $qaDirectory "activity-memory-$width.png"),[Convert]::FromBase64String($shot.data))
            }
            if ($test -eq 'courses') {
                $audit = Eval-Js 'JSON.stringify(window.courseAudit,null,2)'
                [IO.File]::WriteAllText((Join-Path $qaDirectory 'course-content-audit.json'),$audit,[Text.UTF8Encoding]::new($false))
            }
            if ($test -eq 'courses-ui') {
                Eval-Js 'window.showCourseBook()' | Out-Null
                $shot = Send-Cdp 'Page.captureScreenshot' @{format='png';captureBeyondViewport=$false}
                [IO.File]::WriteAllBytes((Join-Path $qaDirectory "course-book-$width.png"),[Convert]::FromBase64String($shot.data))
                Eval-Js 'window.showCourseCatalog()' | Out-Null
                $shot = Send-Cdp 'Page.captureScreenshot' @{format='png';captureBeyondViewport=$false}
                [IO.File]::WriteAllBytes((Join-Path $qaDirectory "course-catalog-$width.png"),[Convert]::FromBase64String($shot.data))
            }
            if ($test -eq 'fashion') {
                Eval-Js "document.getElementById('app').contentDocument.querySelector('[data-shop-item=mini-pleats] .product-preview').click()" | Out-Null
                $shot = Send-Cdp 'Page.captureScreenshot' @{format='png';captureBeyondViewport=$false}
                [IO.File]::WriteAllBytes((Join-Path $qaDirectory "fashion-preview-$width.png"),[Convert]::FromBase64String($shot.data))
            }
            if ($test -eq 'story-ui') {
                Press-Key 'Tab' 'Tab' 9
                Assert-Js "Narrative $width native Tab focuses a choice" "Boolean(document.getElementById('app').contentDocument.activeElement.dataset.storyChoice)"
                $shot = Send-Cdp 'Page.captureScreenshot' @{format='png';captureBeyondViewport=$false}
                [IO.File]::WriteAllBytes((Join-Path $qaDirectory "narrative-choices-$width.png"),[Convert]::FromBase64String($shot.data))
                Press-Key 'Enter' 'Enter' 13
                Assert-Js "Narrative $width native Enter commits one choice" "document.getElementById('app').contentWindow.LunaEngine.storage.load(0).story.active.choices.length === 1"
                Press-Key 'Escape' 'Escape' 27
                Assert-Js "Narrative $width Escape preserves progress" "!document.getElementById('app').contentDocument.getElementById('modal').open && document.getElementById('app').contentWindow.LunaEngine.storage.load(0).story.active.choices.length === 1"
            }
        }
    }
    $checks | Set-Content -Encoding UTF8 (Join-Path $resultsDirectory 'narrative-native-input.txt')
    $checks | Write-Output
    if ($failures.Count) { throw ("Failed suites: " + ($failures -join ', ')) }
} finally {
    if ($script:socket) { $script:socket.Dispose() }
    if ($browserProcess -and -not $browserProcess.HasExited) { Stop-Process -Id $browserProcess.Id -ErrorAction SilentlyContinue }
}
