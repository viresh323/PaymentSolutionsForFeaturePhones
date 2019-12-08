using System.Web.Mvc;
using Twilio.AspNet.Mvc;
using Twilio.TwiML;
using Twilio.TwiML.Voice;

namespace IVRPhoneTree.Web.Controllers
{
    public class IVRController : TwilioController
    {
        // GET: IVR
        public ActionResult Index()
        {
            return View();
        }

        // POST: IVR/Welcome
        [HttpPost]
        public TwiMLResult Welcome()
        {
            var response = new VoiceResponse();
            var gather = new Gather(action: Url.ActionUri("AuthenticateUser", "Menu"), numDigits: 6, maxSpeechTime:120);
            gather.Say("Please enter your secret key to begin the transaction");
            response.Append(gather);

            return TwiML(response);
        }
    }
}