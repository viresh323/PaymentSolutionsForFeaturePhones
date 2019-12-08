using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;

namespace IVRPhoneTree.Web.Utility
{
    public class WebAPIRequest
    {
         HttpClient client = new HttpClient();
        public async Task<HttpResponseMessage> PostAsAJson(string endpoint,Dictionary<string, string> values)
        {         
            var content = new FormUrlEncodedContent(values);
            client.DefaultRequestHeaders.Add("ContentType", "application/json");
            HttpResponseMessage response = await client.PostAsync(endpoint, content);
            response.EnsureSuccessStatusCode();
            return response;
        }
    }
}