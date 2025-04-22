namespace api.AppUtils
{
    public class Utils
    {
        /// <summary>
        /// check null
        /// </summary>
        /// <param name="value"></param>
        /// <returns></returns>
        public static object DbNullIfNull(object value) =>
        value switch
        {
            null => DBNull.Value,
            string s when string.IsNullOrWhiteSpace(s) => DBNull.Value,
            _ => value
        };
    }
}
