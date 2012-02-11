using System;
using SpeechLib;

namespace Location
{
	// public delegate void EndStreamDelegate(int StreamNumber, object StreamPosition);
    public delegate void EndStreamDelegate();
	/// <summary>
	/// Description of Talker.
	/// </summary>
	public class Talker
	{
		private SpVoice m_voice;
		EndStreamDelegate endStream = null;
		bool paused = false;
        string text = null;
        bool purge = false;
        bool bof = false;
        bool eof = false;
		
		public EndStreamDelegate EndStream {
			get { return endStream; }
			set { endStream = value; }
		}

        public bool Eof { get { return eof; } }

		public SpVoice Voice { get { return m_voice; } }
		
		void m_voice_EndStream(int StreamNumber, object StreamPosition)
		{
            eof = true;
            paused = false;
            if (endStream != null)
                endStream();
		}

		public Talker()
		{
			m_voice = new SpVoice();
			m_voice.EndStream += new _ISpeechVoiceEvents_EndStreamEventHandler(m_voice_EndStream);
		}
		
		public Talker(string description)
		{
			m_voice = new SpVoice();
            ISpeechObjectTokens tokens = m_voice.GetAudioOutputs(null, null);
            foreach (ISpeechObjectToken token in tokens)
            {
                if (token.GetDescription(0) == description)
	            	m_voice.AudioOutput = (SpObjectToken)token;
            }
		}

		public void Say(string text, bool purge)
		{
            SpeechVoiceSpeakFlags flags = SpeechVoiceSpeakFlags.SVSFlagsAsync;
            if (purge)
                flags |= SpeechVoiceSpeakFlags.SVSFPurgeBeforeSpeak;
			m_voice.Speak(text, flags);
			paused = false;
            bof = false;
            eof = false;
		}

        public void Prepare(string text, bool purge)
        {
            this.purge = purge;
            this.text = text;
            bof = true;
        }

        public void Pause()
		{
			m_voice.Pause();
			paused = true;
		}
		
		public void Resume()
		{
            if (bof)
                Say(text, purge);
            else
			    m_voice.Resume();
            paused = false;
		}
		
		public void Stop()
		{
			m_voice.Pause();
			paused = false;
		}
		
		public bool IsPaused
		{
			get
			{
				// SpeechLib.ISpeechVoiceStatus status = m_voice.Status;
				// return (status.RunningState == SpeechRunState.SRSEIsSpeaking);
				return paused;
			}
		}
	}
}
