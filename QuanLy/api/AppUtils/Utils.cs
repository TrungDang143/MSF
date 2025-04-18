namespace api.AppUtils
{
    public class Utils
    {
        public static object DbNullIfNull(object value) =>
        value switch
        {
            null => DBNull.Value,
            string s when string.IsNullOrWhiteSpace(s) => DBNull.Value,
            _ => value
        };
    }
}
