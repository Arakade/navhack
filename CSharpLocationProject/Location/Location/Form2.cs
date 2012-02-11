using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Net;
using System.Text;
using System.Windows.Forms;
using System.Xml;

namespace Location
{
    public partial class Form2 : Form
    {
        string sessionCookie = null;

        public string SessionCookie
        {
            get { return sessionCookie; }
            set { sessionCookie = value; }
        }

        public string URL
        {
            get 
            {
                return listBox1.SelectedIndex != -1 ? (listBox1.SelectedItem as ListBoxItem).Value : null;
            }
        }

        public Form2()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            button1.Enabled = false;
            textBox1.Enabled = false;
            string uri = "http://www.openstreetmap.org/geocoder/search_osm_nominatim?maxlat=52.552546106234&maxlon=-0.23679029494161&minlat=52.538557508894&minlon=-0.27138006239628&query={0}";
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(string.Format(uri, textBox1.Text.Replace(" ", "+")));
            HttpWebResponse response = (HttpWebResponse)request.GetResponse();
            foreach (string key in response.Headers)
                // textBox1.Text += " " + key + " " + response.Headers[key];
                if (key == "Set-Cookie")
                    sessionCookie = response.Headers[key];
            XmlDocument doc = new XmlDocument();
            // Mvp.Xml.Common.XmlFragmentStream strm = new Mvp.Xml.Common.XmlFragmentStream(response.GetResponseStream());

            System.IO.MemoryStream ms = new System.IO.MemoryStream();
            System.IO.Stream strm = response.GetResponseStream();
            byte[] buffer = new byte[response.ContentLength];
            strm.Read(buffer, 0, (int)response.ContentLength);

            System.Text.Encoding enc = System.Text.Encoding.ASCII;
            string s = Encoding.ASCII.GetString(buffer);
            string s5 = null;

            do
            {
                string s1 = SubString(s, "<p class=\"search_results_entry\">", "</p>", 0);
                if (s1 == null)
                    break;
                string s2 = SubString(s1, "<a", "</a>", 0);
                string s3 = SubString(s2, "href=\"", "\"", 0);
                string s4 = SubString(s1, "onclick=\"", "\">", 0);
                s5 = s1.Replace("onclick=\"" + s4 + "\"", "");
                s5 = s5.Replace("href=\"" + s3 + "\"", "");
                s5 = s5.Replace("<a  >", "").Replace("</a>", "");
                if ((s3 != null) && (s3.StartsWith("?")))
                    listBox1.Items.Add(new ListBoxItem(s5, s3));
                s = s.Replace("<p class=\"search_results_entry\">" + s1 + "</p>", "");
            } while (true);
            /*
            XmlReaderSettings settings = new XmlReaderSettings();
            settings.ConformanceLevel = ConformanceLevel.Auto;
            settings.IgnoreProcessingInstructions = true;
            settings.ValidationFlags = System.Xml.Schema.XmlSchemaValidationFlags.AllowXmlAttributes;
            settings.ValidationType = ValidationType.Auto;
            settings.ig
            XmlReader reader = XmlReader.Create(strm, settings);

            doc.Load(reader);
            // doc.Load(strm);
            textBox1.Text = doc.OuterXml;
            foreach (XmlNode n in doc.GetElementsByTagName("a"))
                textBox1.Text += n.InnerText + System.Environment.NewLine;
            */
            response.Close();
            button1.Enabled = true;
            textBox1.Enabled = true;
        }

        private string SubString(string s, string t1, string t2, int i)
        {
            if (s == null)
                return null;
            int i1 = s.IndexOf(t1, i);
            if (i1 == -1)
                return null;
            i1 += t1.Length;
            int i2 = s.IndexOf(t2, i1);
            if (i2 == -1)
                return null;
            return s.Substring(i1, i2 - i1);
        }

        private void listBox1_KeyDown(object sender, KeyEventArgs e)
        {
            Close();
        }

        private void listBox1_DoubleClick(object sender, EventArgs e)
        {
            Close();
        }
    }

    public class ListBoxItem
    {
        private string text;
        private string value;

        public string Text
        {
            get { return text; }
            set { text = value; }
        }

        public string Value
        {
            get { return this.value; }
            set { this.value = value; }
        }

        public ListBoxItem(string text, string value)
        {
            this.text = text;
            this.value = value;
        }
    }
}
