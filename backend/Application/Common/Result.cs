namespace OnlineShop.Application.Common;

public class Result
{
    public bool IsSuccess { get; }
    public IReadOnlyList<string> Errors { get; }

    protected Result(bool isSuccess, IReadOnlyList<string> errors)
    {
        IsSuccess = isSuccess;
        Errors = errors;
    }

    public static Result Success() => new(true, []);
    public static Result Failure(string error) => new(false, [error]);
    public static Result Failure(IReadOnlyList<string> errors) => new(false, errors);
}

public class Result<T> : Result
{
    public T? Data { get; }

    private Result(bool isSuccess, T? data, IReadOnlyList<string> errors)
        : base(isSuccess, errors)
    {
        Data = data;
    }

    public static Result<T> Success(T data) => new(true, data, []);
    public static new Result<T> Failure(string error) => new(false, default, [error]);
    public static new Result<T> Failure(IReadOnlyList<string> errors) => new(false, default, errors);
}
