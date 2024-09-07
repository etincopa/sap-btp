using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace InterfaceBalanza.Model
{
    public class TransaccionRequestDto
    {
		public string port { get; set; }
		public int boundRate { get; set; }
		public int parity { get; set; }
		public int dataBits { get; set; }
		public int stopBits { get; set; }
		
		public string comando { get; set; }
	}
}
