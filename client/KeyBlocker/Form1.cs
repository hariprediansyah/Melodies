using System;
using System.Runtime.InteropServices;
using System.Windows.Forms;

namespace KeyBlocker
{
    public partial class Form1 : Form
    {
        private static IntPtr _hookID = IntPtr.Zero;
        private static IntPtr _mouseHookID = IntPtr.Zero;
        private const int WH_KEYBOARD_LL = 13;
        private const int WH_MOUSE_LL = 14;
        private const int WM_KEYDOWN = 0x0100;
        private const int WM_SYSKEYDOWN = 0x0104;
        private const int WM_RBUTTONDOWN = 0x0204;
        private const int WM_RBUTTONUP = 0x0205;
        private delegate IntPtr LowLevelKeyboardProc(int nCode, IntPtr wParam, IntPtr lParam);
        private delegate IntPtr LowLevelMouseProc(int nCode, IntPtr wParam, IntPtr lParam);
        private LowLevelKeyboardProc _proc;
        private LowLevelMouseProc _mouseProc;

        public Form1()
        {
            InitializeComponent();
            _proc = HookCallback;
            _mouseProc = MouseHookCallback;
            _hookID = SetHook(_proc); // Hook keyboard
            _mouseHookID = SetMouseHook(_mouseProc); // Hook mouse
            this.ShowInTaskbar = false;
            this.WindowState = FormWindowState.Minimized;
            this.Hide();
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            UnhookWindowsHookEx(_hookID);
            UnhookWindowsHookEx(_mouseHookID);
            base.OnFormClosing(e);
        }

        private IntPtr SetHook(LowLevelKeyboardProc proc)
        {
            using (var curProcess = System.Diagnostics.Process.GetCurrentProcess())
            using (var curModule = curProcess.MainModule)
            {
                return SetWindowsHookEx(WH_KEYBOARD_LL, proc,
                    GetModuleHandle(curModule.ModuleName), 0);
            }
        }

        private IntPtr SetMouseHook(LowLevelMouseProc proc)
        {
            using (var curProcess = System.Diagnostics.Process.GetCurrentProcess())
            using (var curModule = curProcess.MainModule)
            {
                return SetWindowsHookEx(WH_MOUSE_LL, proc,
                    GetModuleHandle(curModule.ModuleName), 0);
            }
        }

        private IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam)
        {
            if (nCode >= 0)
            {
                bool isKeyDown = wParam == (IntPtr)WM_KEYDOWN || wParam == (IntPtr)WM_SYSKEYDOWN;

                if (isKeyDown)
                {
                    int vkCode = Marshal.ReadInt32(lParam);
                    Keys key = (Keys)vkCode;

                    // Cek kombinasi key yang diblokir
                    if (IsBlockedCombination(key))
                    {
                        return (IntPtr)1; // Blokir key
                    }
                }
            }
            return CallNextHookEx(_hookID, nCode, wParam, lParam);
        }

        private IntPtr MouseHookCallback(int nCode, IntPtr wParam, IntPtr lParam)
        {
            if (nCode >= 0)
            {
                // Blokir klik kanan
                if (wParam == (IntPtr)WM_RBUTTONDOWN || wParam == (IntPtr)WM_RBUTTONUP)
                {
                    return (IntPtr)1; // Blokir klik kanan
                }
            }
            return CallNextHookEx(_mouseHookID, nCode, wParam, lParam);
        }

        private bool IsBlockedCombination(Keys key)
        {
            // Cek status modifier keys secara real-time
            bool ctrlPressed = (GetAsyncKeyState(Keys.ControlKey) & 0x8000) != 0;
            bool altPressed = (GetAsyncKeyState(Keys.Menu) & 0x8000) != 0;
            bool shiftPressed = (GetAsyncKeyState(Keys.ShiftKey) & 0x8000) != 0;

            // Blokir kombinasi key yang berbahaya untuk aplikasi Electron
            switch (key)
            {
                case Keys.LWin:
                case Keys.RWin:
                    return true; // Blokir Windows key

                case Keys.F4:
                    return altPressed; // Blokir Alt+F4 (close aplikasi)

                case Keys.Tab:
                    return altPressed; // Blokir Alt+Tab

                case Keys.Escape:
                    return ctrlPressed; // Blokir Ctrl+Esc

                case Keys.Delete:
                    return ctrlPressed && altPressed; // Blokir Ctrl+Alt+Del

                case Keys.F12:
                    return true; // Blokir F12 (Developer Tools)

                case Keys.F11:
                    return true; // Blokir F11 (Fullscreen toggle)

                // Blokir shortcut Developer Tools
                case Keys.I:
                    return ctrlPressed && shiftPressed; // Blokir Ctrl+Shift+I (DevTools)

                case Keys.J:
                    return ctrlPressed && shiftPressed; // Blokir Ctrl+Shift+J (Console)

                case Keys.C:
                    return ctrlPressed && shiftPressed; // Blokir Ctrl+Shift+C (Element Inspector)

                case Keys.U:
                    return ctrlPressed; // Blokir Ctrl+U (View Source)

                // Blokir refresh page
                case Keys.F5:
                    return true; // Blokir F5 (Refresh)

                case Keys.R:
                    return ctrlPressed; // Blokir Ctrl+R (Refresh)

                // Blokir zoom
                case Keys.Oemplus:
                case Keys.Add:
                    return ctrlPressed; // Blokir Ctrl++ (Zoom In)

                case Keys.OemMinus:
                case Keys.Subtract:
                    return ctrlPressed; // Blokir Ctrl+- (Zoom Out)

                case Keys.D0:
                    return ctrlPressed; // Blokir Ctrl+0 (Reset Zoom)

                default:
                    return false;
            }
        }

        // ========== DLL IMPORTS ==========
        [DllImport("user32.dll")]
        private static extern IntPtr SetWindowsHookEx(int idHook,
            LowLevelKeyboardProc lpfn, IntPtr hMod, uint dwThreadId);

        [DllImport("user32.dll")]
        private static extern IntPtr SetWindowsHookEx(int idHook,
            LowLevelMouseProc lpfn, IntPtr hMod, uint dwThreadId);

        [DllImport("user32.dll")]
        private static extern bool UnhookWindowsHookEx(IntPtr hhk);

        [DllImport("user32.dll")]
        private static extern IntPtr CallNextHookEx(IntPtr hhk,
            int nCode, IntPtr wParam, IntPtr lParam);

        [DllImport("kernel32.dll")]
        private static extern IntPtr GetModuleHandle(string lpModuleName);

        [DllImport("user32.dll")]
        private static extern short GetAsyncKeyState(Keys vKey);
    }
}