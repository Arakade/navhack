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
    public partial class Form3 : Form
    {
        List<POI> pois = null;

        public Form3()
        {
            InitializeComponent();
            checkBox1.Checked = true;
        }

        public POI SelectedPOI { get { return listBox1.SelectedItem as POI; } }

        public void Init(List<POI> pois)
        {
            this.pois = pois;
            Init();
        }

        public void Init()
        {
            listBox1.DisplayMember = "Text";
            listBox1.Sorted = false;
            listBox1.Items.Clear();
            // listBox1.DataSource = pois;
            foreach (var item in pois)
                listBox1.Items.Add(item);
            listBox1.Sorted = true;
        }

        private void button1_Click(object sender, EventArgs e)
        {
            DialogResult = DialogResult.OK;
            Close();
        }

        private void listBox1_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.Enter)
            {
                DialogResult = DialogResult.OK;
                Close();
            }
        }

        private void listBox1_DoubleClick(object sender, EventArgs e)
        {
            DialogResult = DialogResult.OK;
            Close();
        }

        private void checkBox1_CheckedChanged(object sender, EventArgs e)
        {
            panel1.Enabled = false;
            POI.Alphabetical = checkBox1.Checked;
            if (pois != null)
                Init();
            panel1.Enabled = true;
        }
    }
}
