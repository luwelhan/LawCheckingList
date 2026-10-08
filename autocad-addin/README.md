# AutoCAD 2021 外掛：建築技術規則檢索面板

在 AutoCAD 裡開一個可停靠的面板（PaletteSet + WebView2），直接使用本 repo 的法規檢索工具。

## 需求（Windows 筆電）

- AutoCAD 2021（R24.0，.NET Framework 4.8；R24.0–R24.3 即 2021–2024 都適用）
- [.NET SDK](https://dotnet.microsoft.com/download)（8.0 以上，用來編譯）
- Node.js（用來建置網頁）
- Microsoft Edge WebView2 Runtime（Windows 10/11 通常已內建）

## 安裝（自動載入）

```powershell
cd autocad-addin
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

腳本會：`npm run build` 建置網頁 → `dotnet build` 編譯外掛 → 複製到
`%APPDATA%\Autodesk\ApplicationPlugins\LawCheckingList.bundle`。
重新啟動 AutoCAD 後，在命令列輸入 **`LAWCHECK`** 開啟／關閉面板。

## 開發時（不安裝）

1. repo 根目錄執行 `npm run dev`（http://localhost:3000）
2. `dotnet build -c Release`
3. AutoCAD 中執行 `NETLOAD`，選 `bin\Release\LawCheckingList.AutoCAD.dll`，再輸入 `LAWCHECK`

外掛旁若有 `web\index.html`（安裝版）就載入本機檔案、可離線使用；
沒有的話就連到 `npm run dev` 的開發伺服器，改網頁會即時反映在 AutoCAD 面板裡。

## 檔案

| 檔案 | 說明 |
| --- | --- |
| `Commands.cs` | `LAWCHECK` 指令，建立／切換 PaletteSet |
| `LawPaletteControl.cs` | 以 WebView2 載入網頁 |
| `PackageContents.xml` | ApplicationPlugins bundle 設定（啟動時自動載入） |
| `install.ps1` | 建置並安裝 bundle |
