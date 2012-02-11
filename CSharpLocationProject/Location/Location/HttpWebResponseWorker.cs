using System;
using System.ComponentModel;
using System.Net;

namespace Location
{
	/// <summary>
	/// Description of HttpWebResponseWorker.
	/// </summary>
	public class HttpWebResponseWorker : IDisposable // : BackgroundWorker
	{
		private HttpWebRequest request = null;
		private HttpWebResponse response = null;
		private bool isBusy = false;
        private Exception exception = null;

		public HttpWebResponse Response { get { return response; } }
		
		public bool IsBusy { get { return isBusy; } }

        public Exception Exception { get { return exception; } }

		public HttpWebResponseWorker(HttpWebRequest request)
		{
			isBusy = true;
			this.request = request;
			request.BeginGetResponse(new AsyncCallback(ResponseCallback), null);    
	    }
		
	    private void ResponseCallback(IAsyncResult result)
	    {
            try
            {
                response = (HttpWebResponse)request.EndGetResponse(result);
            }
            catch(Exception e)
            {
                exception = e;
            }
	    	isBusy = false;
	    }

        public void Dispose()
        {
            if (isBusy)
              request.Abort();
        }
	}
}
