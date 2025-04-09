using System.Data;
using System.Reflection;

namespace api.AppUtils
{
    public static class DataTableExtensions
    {
        public static List<T> ConvertToList<T>(this DataTable table) where T : new()
        {
            List<T> list = new List<T>();

            foreach (DataRow row in table.Rows)
            {
                T obj = new T();
                foreach (DataColumn column in table.Columns)
                {
                    PropertyInfo prop = typeof(T).GetProperty(column.ColumnName, BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
                    if (prop != null && row[column] != DBNull.Value)
                    {
                        var targetType = Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType;
                        prop.SetValue(obj, Convert.ChangeType(row[column], targetType));
                    }
                }
                list.Add(obj);
            }

            return list;
        }
    }
}
