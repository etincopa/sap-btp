using System;
using System.Collections.Generic;
using System.IO.Ports;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using InterfaceBalanza.Model;

namespace InterfaceBalanza
{
    public class SerialPortController : ApiController
    {
		//private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
		
		public AuditoriaResponseDto Post([FromBody] TransaccionRequestDto request)
        {
			
			AuditoriaResponseDto response = new AuditoriaResponseDto();
            try {
				
				SerialPort port = new SerialPort(request.port, request.boundRate, (Parity)request.parity, request.dataBits, (StopBits)request.stopBits);
				
				if (port.IsOpen == false)
				{
					try
					{
						port.Open(); 
						port.WriteLine(request.comando);
						string data = port.ReadLine().ToString();
						response.iCode = 1;
						response.mensaje = data;
					}
					catch (Exception ex)
					{
						response.iCode = -70;
						response.mensaje = ex.Message;
					}
					finally {
						port.Close();
					}
                }
                else
                {
					response.iCode = -80;
					response.mensaje = "Puerto ya esta abierto no se puede leer";
				}
			}
			catch(Exception ex)
            {
                response.iCode = -90;
                response.mensaje= ex.Message;
			}

            return response;
        }
		public AuditoriaResponseDto Get()
		{
			AuditoriaResponseDto response = new AuditoriaResponseDto();
			response.iCode = 1;
			return response;
		}
	}
}
