using System;
using Autodesk.AutoCAD.Runtime;
using Autodesk.AutoCAD.Windows;

[assembly: CommandClass(typeof(LawCheckingList.AutoCAD.Commands))]

namespace LawCheckingList.AutoCAD
{
    public class Commands
    {
        private static PaletteSet _palette;

        // 在 AutoCAD 命令列輸入 LAWCHECK 開啟／關閉《建築技術規則》檢索面板
        [CommandMethod("LAWCHECK")]
        public void ToggleLawPalette()
        {
            if (_palette == null)
            {
                _palette = new PaletteSet("建築技術規則檢索", "LAWCHECK",
                    new Guid("6E0B5C1A-3D2F-4B7E-9A41-2C8D7F5E1B90"))
                {
                    Style = PaletteSetStyles.ShowCloseButton
                          | PaletteSetStyles.ShowAutoHideButton
                          | PaletteSetStyles.ShowPropertiesMenu,
                    MinimumSize = new System.Drawing.Size(480, 400),
                };
                _palette.Add("法規", new LawPaletteControl());
            }

            _palette.Visible = !_palette.Visible;
        }
    }
}
