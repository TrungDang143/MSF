create database entryTestQly
CREATE TABLE Users (
    UserID        INT IDENTITY(1,1) PRIMARY KEY,  -- ID tự tăng
    Username      VARCHAR(50) UNIQUE NOT NULL,   -- Tên đăng nhập (Không trùng)
    PasswordHash  VARCHAR(255) NOT NULL,         -- Mật khẩu mã hóa
    Email         VARCHAR(100) UNIQUE NOT NULL,  -- Email (Không trùng)
    FullName      VARCHAR(100) NULL,             -- Họ và tên
    PhoneNumber   VARCHAR(15) NULL,              -- Số điện thoại
    Avatar        VARCHAR(255) NULL,             -- Ảnh đại diện (URL)
    DateOfBirth   DATETIME NULL,                     -- Ngày sinh
    Gender        TINYINT NULL CHECK (Gender IN (0,1,2)), -- Giới tính (0: Nữ, 1: Nam, 2: Khác)
    Address       TEXT NULL,                     -- Địa chỉ
    Role          VARCHAR(20) DEFAULT 'User',    -- Vai trò (Mặc định: User)
    Status        TINYINT DEFAULT 1,             -- Trạng thái (0: Inactive, 1: Active)
    CreatedAt     DATETIME DEFAULT GETDATE(),    -- Ngày tạo tài khoản
    UpdatedAt     DATETIME DEFAULT GETDATE(),    -- Ngày cập nhật gần nhất
    GoogleID      VARCHAR(100) NULL,             -- ID Google nếu đăng nhập bằng Google
    FacebookID    VARCHAR(100) NULL              -- ID Facebook nếu đăng nhập bằng Facebook
);

CREATE TRIGGER trg_UpdateTimestamps
ON Users
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Users
    SET CreatedAt = GETDATE()
    WHERE UserID IN (SELECT UserID FROM inserted) AND CreatedAt IS NULL;

    UPDATE Users
    SET UpdatedAt = GETDATE()
    WHERE UserID IN (SELECT UserID FROM inserted);
END;

CREATE PROCEDURE sp_CreateUser
    @Username VARCHAR(50),
    @PasswordHash VARCHAR(255),
    @Email VARCHAR(100),
    @FullName VARCHAR(100),
    @PhoneNumber VARCHAR(15) = NULL,
    @Avatar VARCHAR(255) = NULL,
    @DateOfBirth DATE = NULL,
    @Gender TINYINT = NULL,
    @Address TEXT = NULL,
    @Role VARCHAR(20) = 'User',
    @GoogleID VARCHAR(100) = NULL,
    @FacebookID VARCHAR(100) = NULL,
	@ReturnStatus INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (SELECT 1 FROM Users WHERE Username = @Username OR Email = @Email)
    BEGIN
        SET @ReturnStatus = 0;
        RETURN;
    END
    
    INSERT INTO Users (Username, PasswordHash, Email, FullName, PhoneNumber, Avatar, DateOfBirth, Gender, Address, Role, Status, CreatedAt, UpdatedAt, GoogleID, FacebookID)
    VALUES (@Username, @PasswordHash, @Email, @FullName, @PhoneNumber, @Avatar, @DateOfBirth, @Gender, @Address, @Role, 1, GETDATE(), GETDATE(), @GoogleID, @FacebookID);
	SET @ReturnStatus = 1;
END;

CREATE PROCEDURE sp_LoginUser
    @UsernameOrEmail VARCHAR(100),
    @PasswordHash VARCHAR(255),
	@ReturnStatus INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Users WHERE (Username = @UsernameOrEmail OR Email = @UsernameOrEmail) AND PasswordHash = @PasswordHash)
    BEGIN
        SET @ReturnStatus = 1;
    END
    ELSE
    BEGIN
        SET @ReturnStatus = 0;
    END
END;

select * from Users
