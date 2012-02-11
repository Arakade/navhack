using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Windows.Forms;
using System.Xml.Linq;

namespace Location
{
    public partial class Form1 : Form
    {
        const double nearbyRadius = 10;
        const double factor = 100000;
        XDocument map = null;
        double olat;
        double olon;
        double maxLat;
        double minLat;
        double maxLon;
        double minLon;
        XElement[] elements = null;
        // List<XElement> list = null;
        List<Point> locs = null;
        Form2 form2 = null;
        List<XElement> crossings = null;
        int crossingIndex = 0;
        Talker talker = null;
        Form3 form3 = null;
        XElement node = null;

        bool showAmenity = true;

        public Form1()
        {
            InitializeComponent();
            form2 = new Form2();
            form3 = new Form3();
        }

        private void Form1_Shown(object sender, EventArgs e)
        {
            checkBox1.Checked = false;
            textBox2.Visible = false;
            button3.Enabled = false;
            LoadData();
            talker = new Talker();
            button3.Enabled = true;
        }

        private void Find()
        {
            panel3.Enabled = false;
            form2.ShowDialog();
            if (form2.URL != null)
            {
                listBox1.Items.Clear();
                textBox1.Text = null;
                textBox2.Text = null;
                pictureBox1.Image = null;
                Log("Please wait ...");
                string[] sa = form2.URL.Split(new char[] { '=' });
                string sc = form2.SessionCookie;
                int ie = sc.IndexOf("=");
                int isc = sc.IndexOf(";");
                Cookie session = new Cookie(sc.Substring(0, ie), sc.Substring(0, isc).Substring(ie + 2), null, "www.openstreetmap.org");

                double minLon = double.Parse(LeftOfAmpersand(sa[1]));
                double minLat = double.Parse(LeftOfAmpersand(sa[2]));
                double maxLon = double.Parse(LeftOfAmpersand(sa[3]));
                double maxLat = double.Parse(LeftOfAmpersand(sa[4]));

                double lat = minLat + (maxLat - minLat) / 2;
                double lon = minLon + (maxLon - minLon) / 2;

                double delta = 0.01;

                minLat = lat - delta / 2;
                maxLat = lat + delta / 2;
                minLon = lon - delta;
                maxLon = lon + delta;

                string formData = string.Format(
                    // "maxlat=51.53363&minlon=-0.13596&maxlon=-0.11205&minlat=51.51932"
                    "maxlat={0}&minlon={1}&maxlon={2}&minlat={3}"
                    + "&format=mapnik&mapnik_format=jpeg&mapnik_scale=14000"
                    + "&osmarender_format=png&osmarender_zoom=4&commit=Export",
                    maxLat, minLon, maxLon, minLat);
                SavePost("http://www.openstreetmap.org/export/finish", formData, "map.jpg", session);
                SaveXML(string.Format("http://www.openstreetmap.org/api/0.6/map?bbox={0},{1},{2},{3}", minLon, minLat, maxLon, maxLat), "map.xml", session);
                LoadData();
            }
            panel3.Enabled = true;
        }

        private void Log(string text)
        {
            textBox1.Text = text;
            Application.DoEvents();
        }

        private void SavePost(string uri, string data, string path, Cookie session)
        {
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(uri);

            request.Method = "POST";
            request.ContentType = "application/x-www-form-urlencoded";
            // request.Accept = "text/html,application/xhtml+xml,application/xml";
            request.CookieContainer = new CookieContainer();
            request.CookieContainer.Add(session);
            // request.CookieContainer.Add(new Cookie("_osm_location", "-0.12400650233031|51.526474001441|15|M", null, "www.openstreetmap.org"));
            byte[] byteArray = Encoding.UTF8.GetBytes(data);
            request.ContentLength = byteArray.Length;
            Stream streamRequest = request.GetRequestStream();
            streamRequest.Write(byteArray, 0, byteArray.Length);
            streamRequest.Close();

            // HttpWebResponse response = (HttpWebResponse)request.GetResponse();
            int counter = 0;
            HttpWebResponseWorker worker = new HttpWebResponseWorker(request);
            while (worker.IsBusy)
            {
                Log(string.Format("Please wait ... {0}", counter++));
                System.Threading.Thread.Sleep(500);
            }
            HttpWebResponse response = worker.Response;
            if (response != null)
            {
                if (response.ContentLength > 0)
                {
                    const int bufferSize = 2048;
                    System.IO.Stream strm = response.GetResponseStream();
                    FileStream fs = File.Open(path, FileMode.Create);
                    int length = 0;
                    do
                    {
                        byte[] buffer = new byte[bufferSize];
                        int bytesRead = strm.Read(buffer, 0, bufferSize);
                        fs.Write(buffer, 0, bytesRead);
                        length += bytesRead;
                    } while (length < response.ContentLength);
                    fs.Close();
                }
                else
                    textBox1.Text = worker.Exception.Message;
                response.Close();
            }
        }

        private void SaveXML(string uri, string path, Cookie session)
        {
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(uri);

            request.Method = "GET";
            // request.Accept = "text/html,application/xhtml+xml,application/xml";
            request.CookieContainer = new CookieContainer();
            request.CookieContainer.Add(session);
            // request.CookieContainer.Add(new Cookie("_osm_location", "-0.12400650233031|51.526474001441|15|M", null, "www.openstreetmap.org"));
            request.Timeout = 1000 * 60 * 5;

            // HttpWebResponse response = (HttpWebResponse)request.GetResponse();
            int counter = 0;
            HttpWebResponseWorker worker = new HttpWebResponseWorker(request);
            while (worker.IsBusy)
            {
                Log(string.Format("Please wait ... {0}", counter++));
                System.Threading.Thread.Sleep(500);
            }
            HttpWebResponse response = worker.Response;
            // if (response.ContentLength > 0)
            {
                const int bufferSize = 2048;
                System.IO.Stream strm = response.GetResponseStream();
                FileStream fs = File.Open(path, FileMode.Create);
                int length = 0;
                int bytesRead = 0;
                do
                {
                    byte[] buffer = new byte[bufferSize];
                    // int 
                    bytesRead = strm.Read(buffer, 0, bufferSize);
                    fs.Write(buffer, 0, bytesRead);
                    length += bytesRead;
                    Log(string.Format("Saving {0} ...", length));
                    // } while (length < response.ContentLength);
                } while (bytesRead > 0);
                fs.Close();
            }
            response.Close();
        }

        private string LeftOfAmpersand(string s)
        {
            int i = s.IndexOf("&");
            if (i != -1)
                return s.Substring(0, i);
            else
                return s;
        }

        private void LoadData()
        {
            if (File.Exists("map.xml"))
            {
                map = XDocument.Load(@"map.xml");
                /*
                var r = from c in map.Element("osm")
                    .Elements("way")
                    where (string)c.Attribute("id") == "22323199"
                    select c;
                */
                /*
                foreach (var w in map.Descendants("way").Elements("tag").Where(x => (string)x.Attribute("v") == "John Bright Street"))
                    Way(w.Parent);
                */
                XElement bounds = map.Descendants("bounds").First();
                minLat = double.Parse(bounds.Attribute("minlat").Value);
                maxLat = double.Parse(bounds.Attribute("maxlat").Value);
                minLon = double.Parse(bounds.Attribute("minlon").Value);
                maxLon = double.Parse(bounds.Attribute("maxlon").Value);
                /*
                var nodes1 = Nodes(WaysFromName("John Bright Street").First());
                var nodes2 = Nodes(WaysFromName("Suffolk Place").First());
                XElement node = null;
                foreach (var n1 in nodes1)
                    foreach (var n2 in nodes2)
                        if ((string)n1.Attribute("id") == (string)n2.Attribute("id"))
                        {
                            node = n2;
                            break;
                        }
                Move(node);
                */
                double lat1 = minLat + (maxLat - minLat) / 2;
                double lon1 = minLon + (maxLon - minLon) / 2;
                XElement node = null;
                double d = double.MaxValue;
                crossings = new List<XElement>();
                foreach (var n in map.Descendants("node"))
                {
                    double lat2 = Lat(n);
                    double lon2 = Lon(n);
                    double dx = (lat1 - lat2);
                    double dy = (lon1 - lon2);
                    double ds = dx * dx + dy * dy;
                    if (ds < d)
                    {
                        d = ds;
                        node = n;
                    }
                    //foreach (var kvp in Tags(n))
                    //    if ((kvp.Key.Equals("crossing_ref")) /*&& (kvp.Value.Equals("pelican"))*/)
                    //        crossings.Add(n);
                }
                button2.Enabled = crossings.Count > 0;
                Move(node);
            }
            if (File.Exists("map.jpg"))
            {
                pictureBox1.Load("map.jpg");
                pictureBox1.Width = pictureBox1.Image.Width;
                pictureBox1.Height = pictureBox1.Image.Height;
                locs = new List<Point>();
            }
            listBox1.DisplayMember = "DisplayName";
        }
/*
        private void Way(XElement element)
        {
            foreach (var e in element.Descendants("nd"))
            {
                var n = map.Descendants("node").Single(x => (string)x.Attribute("id") == (string)e.Attribute("ref"));
                double factor = 100000;
                double lat = Math.Round(factor * double.Parse((string)n.Attribute("lat")));
                double lon = Math.Round(factor * double.Parse((string)n.Attribute("lon")));
                if (first)
                {
                    olat = lat;
                    olon = lon;
                    first = false;
                }
                Write(string.Format("{0} {1} {2}", (string)n.Attribute("id"), lat - olat, lon - olon));
                foreach (var w in map.Descendants("way").Descendants("nd").Where(x => (string)x.Attribute("ref") == (string)n.Attribute("id")).Select(x => x.Parent))
                {
                    try
                    {
                        if ((string)w.Attribute("id") != (string)element.Attribute("id"))
                            Write(string.Format("{0} {1}", (string)w.Attribute("id"), (string)w.Descendants("tag").Single(x => (string)x.Attribute("k") == "name").Attribute("v")));
                    }
                    catch { }
                }
                Write(null);
            }
        }
*/
        private void xGetGoogleNavData(double lat, double lon)
        {
            GetGoogleNavData(lat, lon, lat, lon);
        }

        private void GetGoogleNavData(double lat1, double lon1, double lat2, double lon2)
        {
            const string URL_NAV_STRING = "http://maps.google.com/maps/nav?";
            const string English = "EN";
            StringBuilder url = new StringBuilder();
            url.Append(URL_NAV_STRING).Append("hl=").Append(English)
                .Append("&gl=").Append(English)
                .Append("&output=js&oe=utf8&q=from%3A").Append(lat1).Append(",")
                .Append(lon1).Append("+to%3A").Append(lat2).Append(",").Append(lon2);
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url.ToString());
            HttpWebResponse response = (HttpWebResponse)request.GetResponse();
            StreamReader reader = new StreamReader(response.GetResponseStream(), Encoding.UTF8);
            textBox1.Text += "Google:" + System.Environment.NewLine +
                reader.ReadToEnd();
            reader.Close();
            response.Close();
        }

        private void Move(XElement node)
        {
            this.node = node;
            olat = Lat(node);
            olon = Lon(node);
            WriteNode(node);
            pictureBox1.Invalidate();
            // GetGoogleNavData(olat, olon);
        }
        
        private IEnumerable<XElement> WaysFromName(string name)
        {
            return map.Descendants("way")
                .Elements("tag")
                .Where(x => (string)x.Attribute("v") == name)
                .Select(x => x.Parent);
        }

        private IEnumerable<XElement> WaysFromNode(string id)
        {
            return map.Descendants("way")
                .Elements("nd")
                .Where(x => (string)x.Attribute("ref") == id)
                .Select(x => x.Parent);
        }

        private IEnumerable<XElement> Nodes(XElement way)
        {
            List<XElement> nodes = new List<XElement>();
            foreach (var e in way.Descendants("nd"))
                nodes.Add(map.Descendants("node").Single(x => (string)x.Attribute("id") == (string)e.Attribute("ref")));
            return nodes;
        }

        private Dictionary<string, string> Tags(XElement element)
        {
            Dictionary<string, string> dict = new Dictionary<string, string>();
            foreach (var t in element.Descendants("tag"))
                dict.Add((string)t.Attribute("k"), (string)t.Attribute("v"));
            return dict;
        }

        private string[] Describe(XElement element)
        {
            textBox2.Text += (string)element.Attribute("id") + System.Environment.NewLine;
            Dictionary<string, string> dict = new Dictionary<string,string>();
            var tags = element.Descendants("tag");
            foreach (var t in tags)
            {
                // string k = string.Format("{0} - {1}", prefix, (string)t.Attribute("k"));
                string k = (string)t.Attribute("k");
                string v = (string)t.Attribute("v");
                dict.Add(k, v);
                textBox2.Text += (string.Format("{0} {1}", k, v) + System.Environment.NewLine);
            }
            // StringBuilder sb = new StringBuilder();
            List<string> ls = new List<string>();
            // string name = null;
            if ((showAmenity) && (dict.ContainsKey("amenity")))
            {
                if (dict.ContainsKey("name"))
                {
                    // sb.Append(string.Format("{0} {1} ", dict["name"], dict["amenity"]));
                    ls.Add(string.Format("{0} ({1})", dict["name"], dict["amenity"].Replace("_", " ")));
                }
            }
            if (dict.ContainsKey("highway"))
            {
                switch (dict["highway"])
                {
                    case "crossing":
                        string type = null;
                        if (dict.ContainsKey("crossing_ref"))
                            type = dict["crossing_ref"] + " ";
                        // sb.Append(string.Format("a {0}", WayName(element)));
                        ls.Add(string.Format("a {0}crossing", type));
                        break;
                    case "bus_stop":
                        StringBuilder sb = new StringBuilder();
                        string desc = null;
                        if (dict.ContainsKey("name"))
                            desc += dict["name"];
                        string routes = null;
                        if (dict.ContainsKey("route_ref"))
                            routes = TextFromList(dict["route_ref"].Split(new char[] {';'}), ",", "and");
                        sb.Append("bus stop");
                        if (!string.IsNullOrEmpty(desc))
                            sb.Append(" " + desc);
                        if (!string.IsNullOrEmpty(routes))
                            sb.Append(string.Format(" (route{0} {1})", routes.Length > 1 ? "s" : "", routes));
                        ls.Add(sb.ToString());
                        break;
                    default:
                        ls.Add(string.Format("{0}", dict["highway"]));
                        break;
                }
            }
            /*
            if (sb.Length > 0)
                sb.Append(System.Environment.NewLine);
            
            return sb.ToString();
            */
            return ls.ToArray();
        }

        private string WayName(XElement element)
        {
            string name = null;
            var ways = WaysFromNode((string)element.Attribute("id"));
            if (ways.Count() > 0)
            {
                foreach (var w in ways)
                    foreach (Segment s in listBox1.Items)
                    {
                        if (s.Id == (string)w.Attribute("id"))
                            name = s.Text;
                    }
            }
            return name;
        }

        private string[] DescribeNearby(XElement element)
        {
            List<string> ls = new List<string>();
            StringBuilder sb = new StringBuilder();
            foreach (var n in map.Descendants("node").Where(x => Near(x, element)))
            {
                // if (n.Attribute("id") != element.Attribute("id"))
                {
                    string prefix = "Unnamed";
                    var ways = WaysFromNode((string)n.Attribute("id"));
                    if (ways.Count() > 0)
                    {
                        foreach (var w in ways)
                            foreach (Segment s in listBox1.Items)
                            {
                                if (s.Id == (string)w.Attribute("id"))
                                    prefix = s.Text;
                            }
                    }
                    else
                        // prefix = string.Format("{0}", (string)n.Attribute("id"));
                        prefix = string.Format("({0})", Direction(Angle(element, n)));
                    if (!string.IsNullOrEmpty(prefix))
                        textBox2.Text += prefix + System.Environment.NewLine;
                    string desc = TextFromList(Describe(n), ",", "or");
                    if (!string.IsNullOrEmpty(desc))
                        // sb.Append(prefix + " " + desc);
                        ls.Add(prefix + " " + desc);
                }
            }
            // return sb.ToString();
            return ls.ToArray();
        }

        private double Distance(XElement element1, XElement element2)
        {
            double lat1 = Lat(element1);
            double lon1 = Lon(element1);
            double lat2 = Lat(element2);
            double lon2 = Lon(element2);
            return Distance(lat1, lon1, lat2, lon2);
        }
        
        private double Distance(double lat1, double lon1, double lat2, double lon2)
        {
            /*
            double dx = (lat1 - lat2);
            double dy = (lon1 - lon2);
            return dx * dx + dy * dy;
            */
            // return DistanceAlgorithm.DistanceBetweenPlaces(lon1, lat1, lon2, lat2);
            return DistanceAlgorithm.Distance(lat1, lon1, lat2, lon2) * 1000; // metres
        }

        private bool Near(XElement element1, XElement element2)
        {
            double ds = Distance(element1, element2);
            return ds > 0 && ds < nearbyRadius; // 0.00000010;
        }

        private double Lat(XElement node)
        {
            // return Math.Round(factor * 
            return (
                double.Parse((string)node.Attribute("lat"))
                );
        }

        private double Lon(XElement node)
        {
            // return Math.Round(factor *
            return (
                double.Parse((string)node.Attribute("lon"))
                );
        }

        private Double Angle(double y, double x)
        {
            double a = 90 + -180 / Math.PI * Math.Atan2(x, y);
            if (a < 0)
                a += 360;
            return a;
        }

        private Double Angle(XElement element1, XElement element2)
        {
            double lat1 = Lat(element1);
            double lon1 = Lon(element1);
            double lat2 = Lat(element2);
            double lon2 = Lon(element2);
            return Angle(lon1 - lon2, lat1 - lat2);
        }

        private string Direction(double angle)
        {
            double n = 22.5;
            if (Math.Abs(angle - 45) < n)
                return "north east";
            if (Math.Abs(angle - 90) < n)
                return "east";
            if (Math.Abs(angle - 135) < n)
                return "south east";
            if (Math.Abs(angle - 180) < n)
                return "south";
            if (Math.Abs(angle - 225) < n)
                return "south west";
            if (Math.Abs(angle - 270) < n)
                return "west";
            if (Math.Abs(angle - 315) < n)
                return "north west";
            return "north";
        }

        private void Write(string text)
        {
            textBox1.Text += text + System.Environment.NewLine;
        }

        private void ListWays(XElement node)
        {
            listBox1.Sorted = false;
            listBox1.Items.Clear();

            int index = -1;
            foreach (var w in WaysFromNode((string)node.Attribute("id")))
            {
                string s = null;
                string d = null;
                try
                {
                    s += Tags(w)["name"];
                }
                catch
                {
                    s += "Unknown";
                };

                var nodes = Nodes(w);
                int count = nodes.Count();
                elements = new XElement[count];
                int i = 0;
                foreach (var n in nodes)
                {
                    if ((string)n.Attribute("id") == (string)node.Attribute("id"))
                        index = i;
                    elements[i++] = n;
                }
                if (index < count - 1)
                {
                    double a1 = Angle(elements[index + 1], node);
                    d += Direction(a1);
                    listBox1.Items.Add(new Segment(elements[index + 1], s, d, a1, (string)w.Attribute("id")));
                    d = null;
                }
                if (index > 0)
                {
                    double a2 = Angle(elements[index - 1], node);
                    d += Direction(a2);
                    listBox1.Items.Add(new Segment(elements[index - 1], s, d, a2, (string)w.Attribute("id")));
                }
            }
            listBox1.Sorted = true;
            listBox1.Focus();
        }

        private string TextFromList(string[] strings, string seperator, string terminator)
        {
            StringBuilder sb = new StringBuilder();
            if (strings.Length > 0)
            {
                for (int i = 0; i < strings.Length; i++)
                {
                    sb.Append(strings[i]);
                    if (i < strings.Length - 2)
                        sb.Append(string.Format("{0} ", seperator));
                    else
                        if (i < strings.Length - 1)
                            sb.Append(string.Format(" {0} ", terminator));
                }
            }
            return sb.ToString().Replace("_", " ");
        }

        private void WriteNode(XElement node)
        {
            // double lat = Math.Round(factor * Lat(node));
            // double lon = Math.Round(factor * Lon(node));
            /*
            double lat = Lat(node);
            double lon = Lon(node);
            */
            textBox1.Text = null;
            // Write(string.Format("{0} {1:f5} {2:f5}", (string)node.Attribute("id"), lat - olat, lon - olon));

            textBox2.Text = null;
            /*
            StringBuilder sb = new StringBuilder();
            var tags = Tags(node);
            foreach (string k in tags.Keys)
                sb.Append(string.Format("{0} {1}", k, tags[k]));
            if (sb.Length > 0)
                Write("Here:" + System.Environment.NewLine + sb.ToString());
            */
            ListWays(node);
            if (listBox1.Items.Count == 0)
            {
                panel3.Enabled = false;
                textBox1.Text = "Finding ways ...";
                // use of dictionary is quicker than selecting nod by id!
                // Dictionary<string, string> dict = new Dictionary<string, string>();
                XElement nearest = null;
                double dist = double.MaxValue;
                var v = map.Descendants("way")
                    .Where(x => x.Descendants("tag").Attributes("k").TakeWhile(y => y.Value == "highway").Count() > 0)
                    .Descendants("nd")
                    ;
                foreach (var e in v)
                {
                    XElement n = map.Descendants("node").Single(x => (string)x.Attribute("id") == (string)e.Attribute("ref"));
                    /*
                    try
                    {
                        string id = (string)e.Attribute("ref");
                        dict.Add(id, id);
                    */
                        double d = Distance(n, node);
                        if (d < dist)
                        {
                            dist = d;
                            nearest = n;
                        }
                    /*
                    }
                    catch
                    {
                        // ingore
                    }
                    */
                    Application.DoEvents();
                }
                /*
                foreach (var n in map.Descendants("node"))
                {
                    string id = (string)n.Attribute("id");
                    if (dict.ContainsKey(id))
                    {
                        dict.Remove(id);
                        //
                    }
                    Application.DoEvents();
                }
                */
                if (nearest != null)
                    ListWays(nearest);
                textBox1.Text = null;
                panel3.Enabled = true;
            }

            string dirs = null;
            if (listBox1.Items.Count > 0)
            {
                List<string> ld = new List<string>();
                foreach (Segment seg in listBox1.Items)
                    ld.Add((seg.Description));
                dirs = TextFromList(ld.ToArray(), ",", "or");
            }
            if (!string.IsNullOrEmpty(dirs))
                Write(string.Format("Move {0}.", dirs));
            string[] aHere = Describe(node);
            string here = TextFromList(aHere, ",", "and");
            if (!string.IsNullOrEmpty(here))
            {
                string verb = aHere.Length > 1 ? "are" : "is";
                if ((aHere.Length == 1) && (aHere[0] == ("traffic_signals")))
                    verb = "are";
                Write(string.Format("There {0} {1}.", verb, here));
            }
            string[] aNearby = DescribeNearby(node);;
            string nearby = TextFromList(aNearby, ",", "and");
            if (!string.IsNullOrEmpty(nearby))
                Write(string.Format("Nearby {0} {1}.", (aNearby.Length > 1 ? "are" : "is"), nearby));
        }

        private void listBox1_DoubleClick(object sender, EventArgs e)
        {
            // Move(list[listBox1.SelectedIndex]);
            Move((listBox1.Items[listBox1.SelectedIndex] as Segment).Element);
        }

        private void pictureBox1_Paint(object sender, PaintEventArgs e)
        {
            if (locs == null)
            {
                base.OnPaint(e);
                return;
            }
            double dx = maxLon - minLon;
            double dy = maxLat - minLat;
            PictureBox box = (sender as PictureBox);
            int x = (int)(box.Width * (olon - minLon) / dx);
            int y = (int)(box.Height - box.Height * (olat - minLat) / dy);
            double d = Distance(maxLat, maxLon, minLat, minLon);
            double h = Math.Sqrt(Math.Pow(box.Width, 2) + Math.Pow(box.Height, 2));
            float r = (float)(nearbyRadius * h / d);
            foreach(Point p in locs)
                // e.Graphics.DrawRectangle(new Pen(Color.Blue, 2), p.X - 10, p.Y - 10, 20, 20);
                e.Graphics.DrawEllipse(new Pen(Color.Blue, 2), p.X - r, p.Y - r, r * 2, r * 2);
            locs.Add(new Point(x, y));
            // e.Graphics.DrawRectangle(new Pen(Color.Red, 2), x - 10, y - 10, 20, 20);
            e.Graphics.DrawEllipse(new Pen(Color.Red, 2), x - r, y - r, r * 2, r * 2);
            // Form1.ActiveForm.Text = string.Format("{0} {1}", x, y);
        }

        private void listBox1_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.Enter)
                // Move(list[listBox1.SelectedIndex]);
                Move((listBox1.Items[listBox1.SelectedIndex] as Segment).Element);
        }

        private void button1_Click(object sender, EventArgs e)
        {
            Find();
        }

        private void button2_Click(object sender, EventArgs e)
        {
            if (crossingIndex == crossings.Count)
                crossingIndex = 0;
            Move(crossings[crossingIndex++]);
        }

        private void checkBox1_CheckedChanged(object sender, EventArgs e)
        {
            textBox2.Visible = checkBox1.Checked;
        }

        private void button3_Click(object sender, EventArgs e)
        {
            button3.Enabled = false;
            talker.Say(textBox1.Text, true);
            button3.Enabled = true;
        }

        private void button4_Click(object sender, EventArgs e)
        {
            List<POI> pois = new List<POI>();
            foreach (var n in map.Descendants("node")
                .Elements("tag")
                .Where(x => (string)x.Attribute("k") == "name" || (string)x.Attribute("amenity") != null)
                .Select(x => x.Parent)
                )
            {
                string text = Tags(n)["name"];
                /*
                var w = WaysFromNode((string)n.Attribute("id"));
                if (w.Count() > 0)
                {
                    var t = Tags(w.First());
                    if (t.ContainsKey("name"))
                        text += " on " + t["name"];
                }
                */
                double d = Distance(node, n);
                text += string.Format(" ({0:0.00}m)", d);
                pois.Add(new POI(n, text, d));
            }
            form3.Init(pois);
            form3.ShowDialog();
            if (form3.DialogResult == DialogResult.OK)
                Move(form3.SelectedPOI.Element);
        }

        private void button5_Click(object sender, EventArgs e)
        {
            locs.Clear();
            pictureBox1.Invalidate();
        }
    }

    public class Segment : IComparable
    {
        string text = null;
        string direction = null;
        double angle = 0;
        XElement element = null;
        string id = null;

        public XElement Element
        {
            get { return element; }
            set { element = value; }
        }

        public string Text
        {
            get { return text; }
            set { text = value; }
        }

        public string Id
        {
            get { return id; }
            set { id = value; }
        }

        public string DisplayName { get { return string.Format("{0}: {1}", text, direction); } }

        public string Description { get { return string.Format("{0} on {1}", direction, text); } }

        public Segment(XElement element, string text, string direction, double angle, string id)
        {
            this.element = element;
            this.text = text;
            this.direction = direction;
            this.angle = angle;
            this.id = id;
        }

        public int CompareTo(object obj)
        {
            Segment segment = obj as Segment;
            if (angle < segment.angle)
                return -1;
            if (angle > segment.angle)
                return 1;
            return 0;
        }
    }

    public class POI : IComparable
    {
        XElement element = null;
        string text = null;
        double distance = 0;
        static bool alphabetical = true;

        public static bool Alphabetical
        {
            get { return POI.alphabetical; }
            set { POI.alphabetical = value; }
        }

        public XElement Element
        {
          get { return element; }
          set { element = value; }
        }

        public string Text
        {
          get { return text; }
          set { text = value; }
        }

        double Distance
        {
            get { return distance; }
            set { distance = value; }
        }

        public POI(XElement element, string text, double distance)
        {
            this.element = element;
            this.text = text;
            this.distance = distance;
        }

        public int CompareTo(object obj)
        {
            POI poi = obj as POI;
            if (alphabetical)
                return text.CompareTo(poi.text);
            else
            {
                if (distance < poi.distance)
                    return -1;
                if (distance > poi.distance)
                    return 1;
            }
            return 0;
        }
    }
}
