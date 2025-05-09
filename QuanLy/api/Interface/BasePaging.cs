namespace api.Interface
{
    public class BasePaging
    {
        private int? _pageSize = 10;
        private int? _pageNumber = 1;

        public int? pageSize
        {
            get => _pageSize;
            set
            {
                if (value <= 0) throw new ArgumentOutOfRangeException(nameof(pageSize), "PageSize must be greater than 0.");
                _pageSize = value;
            }
        }

        public int? pageNumber
        {
            get => _pageNumber;
            set
            {
                if (value <= 0) throw new ArgumentOutOfRangeException(nameof(pageNumber), "PageNumber must be greater than 0.");
                _pageNumber = value;
            }
        }
    }

}
