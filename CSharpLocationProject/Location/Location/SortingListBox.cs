using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Location
{
    class SortingListBox : System.Windows.Forms.ListBox
    {
        protected override void Sort()
        {
            QuickSort(0, Items.Count - 1);
        }

        private void QuickSort(int left, int right)
        {
            if (right > left)
            {
                int pivotIndex = left;
                int pivotNewIndex = QuickSortPartition(left, right, pivotIndex);

                QuickSort(left, pivotNewIndex - 1);
                QuickSort(pivotNewIndex + 1, right);
            }
        }

        private int QuickSortPartition(int left, int right, int pivot)
        {
            var pivotValue = (IComparable)Items[pivot];
            Swap(pivot, right);

            int storeIndex = left;
            for (int i = left; i < right; ++i)
            {
                if (pivotValue.CompareTo(Items[i]) >= 0)
                {
                    Swap(i, storeIndex);
                    ++storeIndex;
                }
            }

            Swap(storeIndex, right);
            return storeIndex;
        }

        private void Swap(int left, int right)
        {
            var temp = Items[left];
            Items[left] = Items[right];
            Items[right] = temp;
        }
    }
}
