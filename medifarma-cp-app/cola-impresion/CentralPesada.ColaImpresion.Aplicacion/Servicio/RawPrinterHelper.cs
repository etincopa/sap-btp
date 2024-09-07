using CentralPesada.ColaImpresion.Aplicacion.Servicio;
using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;

public static partial class RawPrinterHelper
{

    #region Estructuras y Declaraciones de API

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
    public partial class DOCINFOA
    {
        [MarshalAs(UnmanagedType.LPStr)]
        public string pDocName;
        [MarshalAs(UnmanagedType.LPStr)]
        public string pOutputFile;
        [MarshalAs(UnmanagedType.LPStr)]
        public string pDataType;
    }

    [DllImport("winspool.Drv", EntryPoint = "OpenPrinterA", SetLastError = true, CharSet = CharSet.Ansi, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool OpenPrinter([MarshalAs(UnmanagedType.LPStr)] string szPrinter, ref IntPtr hPrinter, IntPtr pd);
    [DllImport("winspool.Drv", EntryPoint = "ClosePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool ClosePrinter(IntPtr hPrinter);
    [DllImport("winspool.Drv", EntryPoint = "StartDocPrinterA", SetLastError = true, CharSet = CharSet.Ansi, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool StartDocPrinter(IntPtr hPrinter, int level, [In()][MarshalAs(UnmanagedType.LPStruct)] DOCINFOA di);
    [DllImport("winspool.Drv", EntryPoint = "EndDocPrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool EndDocPrinter(IntPtr hPrinter);
    [DllImport("winspool.Drv", EntryPoint = "StartPagePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool StartPagePrinter(IntPtr hPrinter);
    [DllImport("winspool.Drv", EntryPoint = "EndPagePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool EndPagePrinter(IntPtr hPrinter);
    [DllImport("winspool.Drv", EntryPoint = "WritePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool WritePrinter(IntPtr hPrinter, IntPtr pBytes, int dwCount, ref int dwWritten);

    #endregion

    public static bool SendBytesToPrinter(string szPrinterName, IntPtr pBytes, int dwCount)
    {
        int dwError = 0;
        int dwWritten = 0;
        var hPrinter = new IntPtr(0);
        var di = new DOCINFOA();
        bool bSuccess = false;
        // Assume failure unless you specifically succeed.
        di.pDocName = "IMPRESION " + dwCount;
        di.pDataType = "RAW";

        // Open the printer.
        if (OpenPrinter(szPrinterName.Normalize(), ref hPrinter, IntPtr.Zero))
        {
            // Start a document.
            if (StartDocPrinter(hPrinter, 1, di))
            {
                // Start a page.
                if (StartPagePrinter(hPrinter))
                {
                    // Write your bytes.
                    bSuccess = WritePrinter(hPrinter, pBytes, dwCount, ref dwWritten);
                    EndPagePrinter(hPrinter);
                }

                EndDocPrinter(hPrinter);
            }

            ClosePrinter(hPrinter);
        }
        // If you did not succeed, GetLastError may give more information
        // about why not.
        if (bSuccess == false)
        {
            dwError = Marshal.GetLastWin32Error();
        }

        return bSuccess;
    }

    public static bool SendFileToPrinter(string szPrinterName, string szFileName)
    {
        // Open the file.
        var fs = new FileStream(szFileName, FileMode.Open);
        // Create a BinaryReader on the file.
        var br = new BinaryReader(fs);
        // Dim an array of bytes big enough to hold the file's contents.
        var bytes = new byte[(int)(fs.Length - 1L + 1)];
        bool bSuccess = false;
        // Your unmanaged pointer.
        var pUnmanagedBytes = new IntPtr(0);
        int nLength;
        nLength = Convert.ToInt32(fs.Length);
        // Read the contents of the file into the array.
        bytes = br.ReadBytes(nLength);
        // Allocate some unmanaged memory for those bytes.
        pUnmanagedBytes = Marshal.AllocCoTaskMem(nLength);
        // Copy the managed byte array into the unmanaged array.
        Marshal.Copy(bytes, 0, pUnmanagedBytes, nLength);
        // Send the unmanaged bytes to the printer.
        bSuccess = SendBytesToPrinter(szPrinterName, pUnmanagedBytes, nLength);
        // Free the unmanaged memory that you allocated earlier.
        Marshal.FreeCoTaskMem(pUnmanagedBytes);
        return bSuccess;
    }

    public static bool SendStringToPrinter(string szPrinterName, string szString)
    {
        // by default System.String is UTF-16 / Unicode
        var bytes = Encoding.Unicode.GetBytes(szString);

        // convert this to UTF-8. This is a lossy conversion and you might lose some chars
        bytes = Encoding.Convert(Encoding.Unicode, Encoding.UTF8, bytes);
        int bCount = bytes.Length;

        // allocate some unmanaged memory
        var ptr = Marshal.AllocCoTaskMem(bCount);

        // copy the byte[] into the memory pointer
        Marshal.Copy(bytes, 0, ptr, bCount);

        // Send the converted byte[] to the printer.
        var bSuccess = SendBytesToPrinter(szPrinterName, ptr, bCount);

        var colaImpresion = new ColaImpresion();
        colaImpresion.LogWrite(szPrinterName);
        // free the unmanaged memory
        Marshal.FreeCoTaskMem(ptr);

        // it worked! Happy cry.
        return bSuccess;
    }
}