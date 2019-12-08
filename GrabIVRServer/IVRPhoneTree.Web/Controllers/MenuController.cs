using IVRPhoneTree.Web.Models;
using IVRPhoneTree.Web.Utility;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Twilio.AspNet.Mvc;
using Twilio.TwiML;
using Twilio.TwiML.Voice;

namespace IVRPhoneTree.Web.Controllers
{
    public class MenuController : ControllerBase
    {
        private readonly WebAPIRequest _webAPIRequest;
        public MenuController()
        {
            _webAPIRequest = new WebAPIRequest();
        }

        [HttpPost]
        public async Task<ActionResult> AuthenticateUser(string digits, string from)
        {
            var values = new Dictionary<string, string>
                                {
                                { "mobileNumber",  from},
                                { "secretKey", digits }
                                };
            HttpResponseMessage httpResponse = await _webAPIRequest.PostAsAJson("http://localhost:3000/v1/customers/authorize", values);
            var isAuthenticated = JToken.Parse(httpResponse.Content.ReadAsStringAsync().Result);
            var response = new VoiceResponse();
            if (string.Equals("true", Convert.ToString(isAuthenticated["status"]), StringComparison.OrdinalIgnoreCase))
            {

                var gather = new Gather(action: Url.ActionUri("WalletOptions", "Menu"), numDigits: 10, maxSpeechTime: 120);
                gather.Say("Your number is" + from + " Press 1 to Check your Balance. Press 2 to transfer your wallet money");
                response.Append(gather);


            }
            else
            {
                var gather = new Gather(action: Url.ActionUri("AuthenticateUser", "Menu"), numDigits: 6, maxSpeechTime: 120);
                gather.Say("Oops, incorrect secret key. Please enter your secret key to begin the transaction");
                response.Append(gather);

            }
            return TwiML(response);

        }
        [HttpPost]
        public async Task<TwiMLResult> WalletOptions(string from, string digits)
        {
            if (digits == "1")
            {
                return await GetWalletBalance(from);
            }
            else
            {
                var response = new VoiceResponse();
                var gather = new Gather(action: Url.ActionUri("GetEndUserMobileNo", "Menu"), finishOnKey: "#", maxSpeechTime: 120);
                gather.Say("Enter the mobile number of a person whom you want to transfer money followed by #");
                response.Append(gather);
                return TwiML(response);
            }

        }
        [HttpPost]
        public async Task<TwiMLResult> GetWalletBalance(string from)
        {
            var response = new VoiceResponse();
            var values = new Dictionary<string, string>
                                {
                                { "mobileNumber",  from}
                                };
            var httpResponse = await _webAPIRequest.PostAsAJson("http://localhost:3000/v1/customers/wallet/balance", values);
            var balanceModel = JToken.Parse(httpResponse.Content.ReadAsStringAsync().Result);
            string balance = Convert.ToString(balanceModel["balance"]);
            response.Say("You have " + balance + " in the wallet");
            response.Hangup();
            return TwiML(response);
        }

        [HttpPost]
        public TwiMLResult GetAccountDetails()
        {
            var response = new VoiceResponse();
            var gather = new Gather(action: Url.ActionUri("GetEndUserMobileNo", "Menu"), finishOnKey: "#", maxSpeechTime: 120);
            gather.Say("Enter the mobile number of a person whom you want to transfer money followed by #");
            response.Append(gather);

            return TwiML(response);
        }
        [HttpPost]
        public TwiMLResult GetEndUserMobileNo(string digits, string from)
        {

            var response = new VoiceResponse();

            if (digits == from)
            {
                response.Say("Oops! You entered your number instead. Try again.");
                return GetAccountDetails();
            }

            var gather = new Gather(action: Url.ActionUri("ProcessPayment/" + digits, "Menu"), finishOnKey: "#");
            gather.Say("Please enter the amount you want to transfer followed by #");
            response.Append(gather);

            return TwiML(response);
        }
        [HttpPost]
        public TwiMLResult ProcessPayment(string id, string digits)
        {
            var response = new VoiceResponse();
            var gather = new Gather(action: Url.ActionUri("ConfirmPayment/" + id + "#" + digits, "Menu"), finishOnKey: "#");
            response.Say("You are paying amount of " + digits + " to " + id,
                         voice: "alice", language: "en-GB");
            gather.Say("Press 1 to Confirm, Press 2 to go back");
            response.Append(gather);

            return TwiML(response);
        }
        [HttpPost]
        public async Task<TwiMLResult> ConfirmPayment(string id, string digits, string from)
        {
            var response = new VoiceResponse();
            var mobileNumber = from;
            var receiverMobileNumber = id.Split('#')[0];
            var amount = id.Split('#')[1];

            if (digits == "1")
            {
                var values = new Dictionary<string, string>
                                {
                                { "destinationMobileNumber", "+" + receiverMobileNumber },
                                { "mobileNumber",  mobileNumber},
                                { "amount", amount }
                                };
                HttpResponseMessage httpResponse = await _webAPIRequest.PostAsAJson("http://localhost:3000/v1/customers/wallet/transfer", values);
                WebAPIResponseModel webAPIResponseModel = Newtonsoft.Json.JsonConvert.DeserializeObject<WebAPIResponseModel>(httpResponse.Content.ReadAsStringAsync().Result);
                if (webAPIResponseModel.ResponseCode == ResponseCode.INSUFFICIENT_FUNDS)
                {
                    response.Say("You do not have insufficient funds. Please try again");
                    return GetEndUserMobileNo(receiverMobileNumber, from);

                }
                else if (webAPIResponseModel.ResponseCode == ResponseCode.UNREGISTERED_NUMBER)
                {
                    response.Say("Oops! Entered mobile number is not present in our records. Kindly invite them to Grab World.");
                    response.Hangup();
                }
                else
                {
                    response.Say("Successfully Transferred. Thank you for calling Grab Offline Payment Care. Good bye.");
                    response.Hangup();
                }

            }
            else if (digits == "2")
            {
                return GetEndUserMobileNo(receiverMobileNumber, from);
            }
            else
            {
                response.Hangup();
            }

            return TwiML(response);
        }
    }
}