namespace api.AppUtils
{
    public class Utils
    {
        /// <summary>
        /// check null
        /// </summary>
        /// <param name="value"></param>
        /// <returns></returns>
        public static object DbNullIfNull(object? value)
        {
            if (value == null)
                return DBNull.Value;

            if (value is string s && string.IsNullOrWhiteSpace(s))
                return DBNull.Value;

            return value;
        }

        /// <summary>
        /// check null co validator bo sung
        /// </summary>
        /// <param name="value"></param>
        /// <param name="isValid"></param>
        /// <returns></returns>
        public static object DbNullIfNull(object? value, bool isValid = true)
        {

            return (!isValid || value == null || (value is string s && string.IsNullOrWhiteSpace(s)))
            ? DBNull.Value
            : value;

        }

        /// <summary>
        /// check so lon hon 0
        /// </summary>
        /// <param name="number"></param>
        /// <returns></returns>
        public static bool IsGreaterThanZero(int? number)
        {
            return number != null && number > 0;
        }
    }
}
