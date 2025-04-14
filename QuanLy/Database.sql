create database entryTestQly
CREATE TABLE Users (
    UserID        INT IDENTITY(1,1) PRIMARY KEY,  -- ID tự tăng
    Username      VARCHAR(100) UNIQUE NOT NULL,   -- Tên đăng nhập (Không trùng)
    PasswordHash  VARCHAR(255) NOT NULL,         -- Mật khẩu mã hóa
    Email         VARCHAR(100) UNIQUE NOT NULL,  -- Email (Không trùng)
    FullName      NVARCHAR(100) NULL,             -- Họ và tên
    PhoneNumber   VARCHAR(15) NULL,              -- Số điện thoại
    Avatar        VARCHAR(255) NULL,             -- Ảnh đại diện (URL)
    DateOfBirth   DATETIME NULL,                     -- Ngày sinh
    Gender        TINYINT NULL CHECK (Gender IN (0,1,2)), -- Giới tính (0: Nữ, 1: Nam, 2: Khác)
    Address       nvarchar(100) NULL,                     -- Địa chỉ
    --Role          VARCHAR(20) DEFAULT 'User',    -- Vai trò (Mặc định: User)
    Status        TINYINT DEFAULT 1,             -- Trạng thái (0: Inactive, 1: Active)
    CreatedAt     DATETIME DEFAULT GETDATE(),    -- Ngày tạo tài khoản
    UpdatedAt     DATETIME DEFAULT GETDATE(),    -- Ngày cập nhật gần nhất
    GoogleID      VARCHAR(100) NULL,             -- ID Google nếu đăng nhập bằng Google
    FacebookID    VARCHAR(100) NULL,              -- ID Facebook nếu đăng nhập bằng Facebook
	otp varchar(10) null,
	roleID int null,
	LockTime datetime null,
	RemainTime tinyint null
);

alter table users
add IsExternalAvatar bit default 0 

--SELECT name
--FROM sys.check_constraints
--WHERE parent_object_id = OBJECT_ID('Users') AND 
--      definition LIKE '%[Gender]%'
--ALTER TABLE Users
--DROP CONSTRAINT CK__Users__Gender__4BAC3F29;

--alter table users add roleID int null
--UPDATE Users
--SET RoleID = (SELECT RoleID FROM Role WHERE Role.RoleName = Users.Role);
--ALTER TABLE Users ADD CONSTRAINT FK_Users_Role FOREIGN KEY (RoleID) REFERENCES Role(RoleID);
--SELECT name, type_desc 
--FROM sys.default_constraints 
--WHERE parent_object_id = OBJECT_ID('Users');
--ALTER TABLE Users DROP CONSTRAINT DF__Users__Role__4CA06362;
--ALTER TABLE Users DROP COLUMN Role;
--------------------------------------------------------------------------
CREATE TABLE Role (
    RoleID INT IDENTITY(1,1) PRIMARY KEY,
    RoleName VARCHAR(50) NOT NULL UNIQUE,
    Description nvarchar(100),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

INSERT INTO Role (RoleName, Description) VALUES
('Admin', N'Quản trị viên, có toàn quyền'),
('User', N'Người dùng thông thường'),
('Sub-Admin', N'Quản lý người dùng và đơn hàng'),
('Guest', N'Khách vãng lai, chỉ có quyền xem');

-------------------------------------------------------------------------------
CREATE TABLE Permission (
    PermissionID INT IDENTITY(1,1) PRIMARY KEY,
    PermissionName VARCHAR(100) NOT NULL UNIQUE,
    Description nvarchar(100)
);
CREATE TABLE RolePermission (
    RoleID INT,
    PermissionID INT,
    PRIMARY KEY (RoleID, PermissionID),
    FOREIGN KEY (RoleID) REFERENCES Role(RoleID) ON DELETE CASCADE,
    FOREIGN KEY (PermissionID) REFERENCES Permission(PermissionID) ON DELETE CASCADE
);
INSERT INTO Permission (PermissionName, Description) VALUES
('view_users', 'Xem danh sách người dùng'),
('create_users', 'Tạo người dùng mới'),
('edit_users', 'Chỉnh sửa thông tin người dùng'),
('delete_users', 'Xóa người dùng'),

('view_roles', 'Xem danh sách vai trò'),
('create_roles', 'Tạo vai trò mới'),
('edit_roles', 'Chỉnh sửa vai trò'),
('delete_roles', 'Xóa vai trò'),

('view_permissions', 'Xem danh sách quyền'),
('assign_permissions', 'Gán quyền cho vai trò'),

('view_content', 'Xem nội dung'),
('create_content', 'Tạo nội dung mới'),
('edit_content', 'Chỉnh sửa nội dung'),
('delete_content', 'Xóa nội dung'),

('manage_settings', 'Quản lý cài đặt hệ thống'),
('view_logs', 'Xem nhật ký hệ thống'),
('backup_data', 'Sao lưu dữ liệu'),

--('view_orders', 'Xem đơn hàng'),
--('process_orders', 'Xử lý đơn hàng'),
--('cancel_orders', 'Hủy đơn hàng'),

--('manage_payments', 'Quản lý thanh toán'),
--('view_reports', 'Xem báo cáo'),
--('export_data', 'Xuất dữ liệu');

-- Gán quyền cho Admin (được toàn quyền)
INSERT INTO RolePermission (RoleID, PermissionID)
SELECT 1, PermissionID FROM Permission;

-- Gán quyền cho sub-admin
INSERT INTO RolePermission (RoleID, PermissionID) VALUES
(3, (SELECT PermissionID FROM Permission WHERE PermissionName = 'manage_settings')),
(3, (SELECT PermissionID FROM Permission WHERE PermissionName = 'view_logs')),
(3, (SELECT PermissionID FROM Permission WHERE PermissionName = 'backup_data')),

(3, (SELECT PermissionID FROM Permission WHERE PermissionName = 'view_permissions')),

(3, (SELECT PermissionID FROM Permission WHERE PermissionName = 'view_roles')),
(3, (SELECT PermissionID FROM Permission WHERE PermissionName = 'edit_roles')),

(3, (SELECT PermissionID FROM Permission WHERE PermissionName = 'edit_content')),
(3, (SELECT PermissionID FROM Permission WHERE PermissionName = 'view_content')),
(3, (SELECT PermissionID FROM Permission WHERE PermissionName = 'create_content')),

(3, (SELECT PermissionID FROM Permission WHERE PermissionName = 'view_users')),
(3, (SELECT PermissionID FROM Permission WHERE PermissionName = 'create_users')),
(3, (SELECT PermissionID FROM Permission WHERE PermissionName = 'edit_users'))

-- Gán quyền cho User (chỉ xem nội dung)
INSERT INTO RolePermission (RoleID, PermissionID) VALUES
(2, (SELECT PermissionID FROM Permission WHERE PermissionName = 'view_content'));

-- Gán quyền cho Manager (quản lý user & đơn hàng)
INSERT INTO RolePermission (RoleID, PermissionID) VALUES
--(5, (SELECT PermissionID FROM Permission WHERE PermissionName = 'view_orders')),
--(5, (SELECT PermissionID FROM Permission WHERE PermissionName = 'process_orders'));

-- Gán quyền cho Support (hỗ trợ khách hàng)
--INSERT INTO RolePermission (RoleID, PermissionID) VALUES
--(6, (SELECT PermissionID FROM Permission WHERE PermissionName = 'view_users')),
--(6, (SELECT PermissionID FROM Permission WHERE PermissionName = 'view_orders')),
--(6, (SELECT PermissionID FROM Permission WHERE PermissionName = 'process_orders'));

-- Gán quyền cho Guest (chỉ có quyền xem)
INSERT INTO RolePermission (RoleID, PermissionID) VALUES
(4, (SELECT PermissionID FROM Permission WHERE PermissionName = 'view_content'));
--------------------------------------------------------------------------
CREATE TABLE Genders (
    GenderID INT IDENTITY(1,1) PRIMARY KEY,
	GenderName nvarchar(15) not null
);
insert into Genders values (N'Khác')
--------------------------------------------------------------------------
CREATE TABLE Status (
    StatusID INT IDENTITY(1,1) PRIMARY KEY,
	StatusName nvarchar(20) not null
);
insert into Status values (N'Vô hiệu hóa')
------------------------------------------------------------------------------------------
CREATE TABLE SystemLog (
    Id INT PRIMARY KEY IDENTITY,
    Username NVARCHAR(100),
    Role NVARCHAR(50),
    IPAddress NVARCHAR(50),
	UserAgent NVARCHAR(500),
    Url NVARCHAR(500),
    Method NVARCHAR(10),
    RequestBody NVARCHAR(MAX),
    ResponseStatusCode INT,
    ExceptionMessage NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE()
);
------------------------------------------------------------------------------------------
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
-------------------------------------------------------------------------------
CREATE TRIGGER trg_UpdateTimestampsRole
ON Role
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Role
    SET CreatedAt = GETDATE()
    WHERE RoleID IN (SELECT RoleID FROM inserted) AND CreatedAt IS NULL;

    UPDATE Role
    SET UpdatedAt = GETDATE()
    WHERE RoleID IN (SELECT RoleID FROM inserted);
END;
-------------------------------------------------------------------------------
CREATE PROCEDURE sp_CreateUser
    @Username VARCHAR(50),
    @PasswordHash VARCHAR(255),
    @Email VARCHAR(100),
	@ReturnStatus INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (SELECT 1 FROM Users WHERE Username = @Username OR Email = @Email)
    BEGIN
        SET @ReturnStatus = 0;
        RETURN;
    END
    
    INSERT INTO Users (Username, PasswordHash, Email,RoleID, Status, CreatedAt, UpdatedAt)
    VALUES (@Username, @PasswordHash, @Email, 2, 1, GETDATE(), GETDATE());
	SET @ReturnStatus = 1;
END;;
-------------------------------------------------------------------------------
CREATE PROCEDURE sp_LoginUser
    @UsernameOrEmail VARCHAR(100),
    @PasswordHash VARCHAR(255),
	@ReturnStatus INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra tài khoản có tồn tại không
    IF EXISTS (
        SELECT 1 
        FROM Users 
        WHERE ((Username = @UsernameOrEmail OR Email = @UsernameOrEmail) AND Status = 1)
    )
    BEGIN
        -- Tài khoản tồn tại, kiểm tra mật khẩu
        IF EXISTS (
            SELECT 1 
            FROM Users 
            WHERE 
                (Username = @UsernameOrEmail OR Email = @UsernameOrEmail)
                AND PasswordHash = @PasswordHash
        )
        BEGIN
            -- Kiểm tra locktime
            IF EXISTS (
                SELECT 1 
                FROM Users 
                WHERE 
                    (Username = @UsernameOrEmail OR Email = @UsernameOrEmail)
                    AND PasswordHash = @PasswordHash     
                    AND (LockTime IS NULL OR LockTime <= GETDATE())
            )
            BEGIN
				update users
				set remaintime = 5
				WHERE 
                    (Username = @UsernameOrEmail OR Email = @UsernameOrEmail)

                SET @ReturnStatus = 1; -- Đăng nhập thành công
            END
            ELSE
            BEGIN
                SET @ReturnStatus = 2; -- Tài khoản bị khóa
            END
        END
        ELSE
        BEGIN
			if exists ( select 1 from Users where ((Username = @UsernameOrEmail OR Email = @UsernameOrEmail) and remaintime >0))
			begin
				update users
					set remaintime = remaintime-1
					WHERE 
						(Username = @UsernameOrEmail OR Email = @UsernameOrEmail)
			end
			else
			begin
					update users
					set locktime = DATEADD(MINUTE, 5, GETDATE())
					WHERE 
						(Username = @UsernameOrEmail OR Email = @UsernameOrEmail)
			end

            SET @ReturnStatus = 3; -- Sai mật khẩu
        END
    END
    ELSE
    BEGIN
        SET @ReturnStatus = 0; -- Sai tài khoản hoawcj inactive
    END
END;
-------------------------------------------------------------------------------
CREATE PROCEDURE sp_GetFullName
    @UsernameOrEmail VARCHAR(100),
	@ReturnValue NVARCHAR(100) OUTPUT
AS
BEGIN

    SET @ReturnValue = (SELECT FullName FROM Users WHERE (Username = @UsernameOrEmail OR Email = @UsernameOrEmail))

END;
-------------------------------------------------------------------------------
CREATE PROCEDURE sp_VerifyUserInfo
    @Username VARCHAR(50),
	@Email VARCHAR(100),
	@ReturnStatus int OUTPUT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM Users WHERE Username = @Username AND Email = @Email)
    BEGIN
        SET @ReturnStatus = 1;
    END
    ELSE
    BEGIN
        SET @ReturnStatus = 0;
    END
END;
-------------------------------------------------------------------------------
CREATE PROCEDURE sp_CreateOTP
    @Username VARCHAR(50),
	@Email VARCHAR(100),
	@ReturnStatus int OUTPUT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM Users WHERE Username = @Username AND Email = @Email)
    BEGIN
		DECLARE @OTP VARCHAR(4) = FORMAT(ABS(CHECKSUM(NEWID())) % 10000, 'D4');

		UPDATE Users
		SET otp = @OTP
		WHERE Username = @Username AND Email = @Email;

		SET @ReturnStatus = 1;
	END
    ELSE
    BEGIN
        SET @ReturnStatus = 0;
    END
END;
-------------------------------------------------------------------------------
CREATE PROCEDURE sp_GetOTP
    @Username VARCHAR(50),
	@Email VARCHAR(100),
	@ReturnValue varchar(10) output,
	@ReturnStatus int OUTPUT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM Users WHERE Username = @Username AND Email = @Email)
    BEGIN
		SELECT TOP 1 @ReturnValue = otp 
        FROM Users 
        WHERE Username = @Username AND Email = @Email;
        
		SET @ReturnStatus = 1;
	END
    ELSE
    BEGIN
        SET @ReturnStatus = 0;
		SET @ReturnValue = NULL;
    END
END;
-------------------------------------------------------------------------------
CREATE PROCEDURE sp_VerifyOTP
    @Username VARCHAR(50),
	@otp varchar(10),
	@ReturnStatus int OUTPUT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM Users WHERE Username = @Username and otp =  @otp)
    BEGIN
		SET @ReturnStatus = 1;
	END
    ELSE
    BEGIN
        SET @ReturnStatus = 0;
    END
END;
-------------------------------------------------------------------------------
CREATE PROCEDURE sp_ChangePassword
    @Username VARCHAR(50),
	@newpassword varchar(255),
	@ReturnStatus int OUTPUT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM Users WHERE Username = @Username)
    BEGIN
		UPDATE Users
		SET PasswordHash = @newpassword, otp = NULL
		WHERE Username = @Username;

		SET @ReturnStatus = 1;
	END
    ELSE
    BEGIN
        SET @ReturnStatus = 0;
    END
END;

--CREATE PROCEDURE sp_ChangeRole
--    @Username VARCHAR(50),
--	@newRole varchar(20),
--	@ReturnStatus int OUTPUT
--AS
--BEGIN
--    IF EXISTS (SELECT 1 FROM Users WHERE Username = @Username)
--    BEGIN
--		UPDATE Users
--		SET Role = @newRole
--		WHERE Username = @Username;

--		SET @ReturnStatus = 1;
--	END
--    ELSE
--    BEGIN
--        SET @ReturnStatus = 0;
--    END
--END;
-------------------------------------------------------------------------------
create procedure sp_FindUserByFBID
	@FBID varchar(100),
	@Username VARCHAR(100),
	@PasswordHash VARCHAR(255),
	@email varchar(100),
    @FullName NVARCHAR(100) = NULL,
    @Avatar VARCHAR(255) = NULL,
	@rtnValue varchar(50) output,
	@status int output
as
begin
	IF EXISTS (SELECT 1 FROM Users WHERE FacebookID = @FBID)
    BEGIN
		set @rtnValue = @email
		SET @status = 1;

		update users
		set avatar = @Avatar, fullname = @Fullname
		where FacebookID = @FBID
	END
    ELSE
    BEGIN
		IF EXISTS (SELECT 1 FROM Users WHERE FacebookID is NULL and email = @email)
		begin
			update users
			SET FacebookID = @FBID
			where email = @email;

			SET @status = 1;
			set @rtnValue = @email
		end
		else
		begin
			begin try
				INSERT INTO Users (Username, PasswordHash, Email, FullName, Avatar, CreatedAt, UpdatedAt, FacebookID)
				VALUES (@Username, @PasswordHash, @Email, @FullName, @Avatar, GETDATE(), GETDATE(), @FBID);
				SET @status = 1;
				set @rtnValue = @email
			end try
			begin catch
				set @status = 0
				set @rtnValue = ERROR_MESSAGE()
			end catch
		end
    END
end
-------------------------------------------------------------------------------
DECLARE @rtnValue VARCHAR(50);
DECLARE @status int;
exec sp_FindUserByGGID '104530249480229060197', 'bancuaban102@gmail.com', 'password', 'bancuaban102@gmail.com', N'Trung Đặng', 'picture', 
						@rtnValue output, @status output
SELECT @rtnValue ,@status;

create procedure sp_FindUserByGGID
	@GGID varchar(100),
	@Username VARCHAR(100),
	@PasswordHash VARCHAR(255),
	@email varchar(100),
    @FullName NVARCHAR(100) = NULL,
    @Avatar VARCHAR(255) = NULL,

	@rtnValue varchar(50) output,
	@status int output
as
begin
	IF EXISTS (SELECT 1 FROM Users WHERE GoogleID = @GGID)
    BEGIN
		set @rtnValue = @email
		SET @status = 1;

		
		update users
		set avatar = @Avatar, fullname = @Fullname
		where GoogleID = @GGID
	END
    ELSE
    BEGIN
		IF EXISTS (SELECT 1 FROM Users WHERE GoogleID is NULL and email = @email)
		begin
			update users
			SET GoogleID = @GGID
			where email = @email;

			SET @status = 1;
			set @rtnValue = @email
		end
		else
		begin
			begin try
				INSERT INTO Users (Username, PasswordHash, Email, FullName, Avatar, CreatedAt, UpdatedAt, GoogleID)
				VALUES (@Username, @PasswordHash, @Email, @FullName, @Avatar, GETDATE(), GETDATE(), @GGID);
				SET @status = 1;
				set @rtnValue = @email
			end try
			begin catch
				set @status = 0
				set @rtnValue = ERROR_MESSAGE()
			end catch
		end
    END
end

----------------------------------------------------------------------------------------------------
create procedure sp_GetUserByUsernameOrEmail
    @UsernameOrEmail VARCHAR(100)
AS
BEGIN

   SELECT top 1 * FROM Users WHERE (Username = @UsernameOrEmail OR Email = @UsernameOrEmail)

END;
----------------------------------------------------------------------------------------------------
create procedure sp_GetUserByUserID
    @UserID VARCHAR(100)
AS
BEGIN

   SELECT top 1 * FROM Users WHERE (UserID = @UserID)

END;
----------------------------------------------------------------------------------------------------
create procedure sp_GetRoleIDByUsernameOrEmail
    @UsernameOrEmail VARCHAR(100),
	@rtnvalue int output
AS
BEGIN

   set @rtnValue = (SELECT RoleID FROM Users WHERE (Username = @UsernameOrEmail OR Email = @UsernameOrEmail))

END;
declare @rtnValue int;
exec sp_GetRoleIDByUsernameOrEmail 'dtrung', @rtnValue output
select @rtnValue
----------------------------------------------------------------------------------------------------
create procedure sp_GetRoleNameByUsernameOrEmail
    @UsernameOrEmail VARCHAR(100),
	@rtnvalue varchar(50) output
AS
BEGIN

   set @rtnValue = (SELECT top 1 RoleName FROM Users  
					inner join Role on role.roleId = Users.roleid
					WHERE (Username = @UsernameOrEmail OR Email = @UsernameOrEmail))
END;
declare @rtnValue varchar(50);
exec sp_GetRoleNameByUsernameOrEmail 'admin2', @rtnValue output
select @rtnValue
----------------------------------------------------------------------------------------------------
create procedure sp_GetUsersByRoleID
    @RoleID int
AS
BEGIN

  SELECT * FROM Users WHERE (roleID = @RoleID)

END;
declare @rtnValue int;
exec sp_GetRoleIDByUsernameOrEmail 'dtrung', @rtnValue output
select @rtnValue
----------------------------------------------------------------------------------------------------
create procedure sp_GetAllAccount
AS
BEGIN

  SELECT * FROM Users

END;
declare @rtnValue int;
exec sp_GetAllAccount 'dtrung', @rtnValue output
select @rtnValue
----------------------------------------------------------------------------------------------------
create procedure sp_GetGenders
AS
BEGIN

  SELECT * FROM Genders

END;
declare @rtnValue int;
exec sp_GetGenders 'dtrung', @rtnValue output
select @rtnValue
----------------------------------------------------------------------------------------------------
create procedure sp_GetStatus
AS
BEGIN

  SELECT * FROM Status

END;
declare @rtnValue int;
exec sp_GetStatus 'dtrung', @rtnValue output
select @rtnValue
----------------------------------------------------------------------------------------------------
create procedure sp_GetRole
AS
BEGIN

  SELECT * FROM Role

END;
declare @rtnValue int;
exec sp_GetRole 'dtrung', @rtnValue output
select @rtnValue
----------------------------------------------------------------------------------------------------
CREATE PROCEDURE sp_UpdateUserInfo
    @UserID INT,
    @FullName NVARCHAR(100) = NULL,
    @PhoneNumber VARCHAR(15) = NULL,
    @Avatar VARCHAR(255) = NULL,
    @DateOfBirth DATETIME = NULL,
    @Gender TINYINT = NULL,
    @Address NVARCHAR(100) = NULL,
    @Status TINYINT = NULL,
    @GoogleID VARCHAR(100) = NULL,
    @FacebookID VARCHAR(100) = NULL,
    @roleID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

        IF @FullName IS NOT NULL
        UPDATE Users SET FullName = @FullName WHERE UserID = @UserID;

		IF @PhoneNumber IS NOT NULL
			UPDATE Users SET PhoneNumber = @PhoneNumber WHERE UserID = @UserID;

		IF @Avatar IS NOT NULL
			UPDATE Users SET Avatar = @Avatar WHERE UserID = @UserID;

		IF @DateOfBirth IS NOT NULL
			UPDATE Users SET DateOfBirth = @DateOfBirth WHERE UserID = @UserID;

		IF @Gender IS NOT NULL
			UPDATE Users SET Gender = @Gender WHERE UserID = @UserID;

		IF @Address IS NOT NULL
			UPDATE Users SET Address = @Address WHERE UserID = @UserID;

		IF @Status IS NOT NULL
			UPDATE Users SET Status = @Status WHERE UserID = @UserID;

		IF @GoogleID IS NOT NULL
			UPDATE Users SET GoogleID = @GoogleID WHERE UserID = @UserID;

		IF @FacebookID IS NOT NULL
			UPDATE Users SET FacebookID = @FacebookID WHERE UserID = @UserID;

		IF @RoleID IS NOT NULL
			UPDATE Users SET RoleID = @RoleID WHERE UserID = @UserID;

END;
----------------------------------------------------------------------------------------------------
create procedure sp_DeleteUser
@UserID int
AS
BEGIN

  delete from users where UserID = @UserID

END;
declare @rtnValue int;
exec sp_GetRole 'dtrung', @rtnValue output
select @rtnValue
----------------------------------------------------------------------------------------------------
create procedure sp_GetPermissionByRoleID
@RoleID int
as
begin
	SELECT 
        p.PermissionID,
        p.PermissionName
    FROM 
        RolePermission rp
    INNER JOIN 
        Permission p ON rp.PermissionID = p.PermissionID
    WHERE 
        rp.RoleID = @RoleID

end

exec sp_GetPermissionByRoleID 3
----------------------------------------------------------------------------------------------------
create procedure sp_GetPermissionNameByPermissionID
@PermissionID int,
@rtnValue varchar(100) output
as
begin
	set @rtnValue = (select PermissionName from Permission where PermissionID = @PermissionID)
end

declare @rtnValue varchar(100)
exec sp_GetPermissionNameByPermissionID @PermissionID = 2, @rtnValue = @rtnValue OUTPUT;
select @rtnValue
----------------------------------------------------------------------------------------------------
create procedure sp_GetAllPermissions
as
begin
	select * from Permission 
end

----------------------------------------------------------------------------------------------------
CREATE PROCEDURE sp_AddSystemLog
    @Username NVARCHAR(100),
    @Role NVARCHAR(50),
    @IPAddress NVARCHAR(50),
    @Url NVARCHAR(500),
    @Method NVARCHAR(10),
    @RequestBody NVARCHAR(MAX),
    @ResponseStatusCode INT,
    @ExceptionMessage NVARCHAR(MAX),
    @UserAgent NVARCHAR(500),
    @CreatedAt DATETIME
AS
BEGIN
    INSERT INTO SystemLog (
        Username,
        Role,
        IPAddress,
        Url,
        Method,
        RequestBody,
        ResponseStatusCode,
        ExceptionMessage,
        UserAgent,
        CreatedAt
    )
    VALUES (
        @Username,
        @Role,
        @IPAddress,
        @Url,
        @Method,
        @RequestBody,
        @ResponseStatusCode,
        @ExceptionMessage,
        @UserAgent,
        @CreatedAt
    )
END

----------------------------------------------------------------------------------------------------
create procedure sp_GetAllSystemLog
as
begin
	select * from SystemLog order by CreatedAt desc
end
----------------------------------------------------------------------------------------------------
create table UserPermission (
    UserID INT,
    PermissionID INT,
    PRIMARY KEY (UserID, PermissionID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (PermissionID) REFERENCES Permission(PermissionID)
)
----------------------------------------------------------------------------------------------------
CREATE PROCEDURE sp_UpdateUserPermissions
    @UserID INT,
    @PermissionIDs NVARCHAR(MAX) -- VD: '1,3,5'
AS
BEGIN
    SET NOCOUNT ON;

    -- Xoá quyền cũ của user
    DELETE FROM UserPermission WHERE UserID = @UserID;

    -- Thêm quyền mới
    DECLARE @id INT;
    DECLARE @PermissionTable TABLE (ID INT);

    INSERT INTO @PermissionTable (ID)
    SELECT value FROM STRING_SPLIT(@PermissionIDs, ',')

    INSERT INTO UserPermission (UserID, PermissionID)
    SELECT @UserID, ID FROM @PermissionTable;
END

----------------------------------------------------------------------------------------------------
CREATE PROCEDURE sp_GetAllPermissionsForUser
    @UserID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT DISTINCT p.PermissionID, p.PermissionName
    FROM Permission p
    WHERE p.PermissionID IN (
        -- Quyền theo Role
        SELECT rp.PermissionID
        FROM Users u
        JOIN RolePermission rp ON u.RoleID = rp.RoleID
        WHERE u.UserID = @UserID

        UNION

        -- Quyền riêng
        SELECT up.PermissionID
        FROM UserPermission up
        WHERE up.UserID = @UserID
    )
END

----------------------------------------------------------------------------------------------------
CREATE TABLE SystemSettings (
    ID INT PRIMARY KEY IDENTITY,
    SettingKey NVARCHAR(100) UNIQUE NOT NULL,
    SettingValue NVARCHAR(500) NOT NULL,
    Description NVARCHAR(500),
    IsActive BIT DEFAULT 1
)
CREATE PROCEDURE sp_UpdateSystemSetting
    @SettingKey NVARCHAR(100),
    @SettingValue NVARCHAR(500),
    @Description NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM SystemSettings WHERE SettingKey = @SettingKey)
    BEGIN
        UPDATE SystemSettings
        SET SettingValue = @SettingValue,
            Description = CASE 
                WHEN @Description IS NULL OR @Description = '' THEN Description 
                ELSE @Description 
             END
        WHERE SettingKey = @SettingKey;
    END
    ELSE
    BEGIN
        INSERT INTO SystemSettings (SettingKey, SettingValue, Description, IsActive)
        VALUES (@SettingKey, @SettingValue, @Description, 1);
    END
END;

EXEC sp_UpdateSystemSetting 'Password.MinLength', '8', N'Độ dài tối thiểu';
EXEC sp_UpdateSystemSetting 'Password.RequireUpper', 'true', N'Phải có chữ hoa';
EXEC sp_UpdateSystemSetting 'Password.RequireLower', 'true', N'Phải có chữ thường';
EXEC sp_UpdateSystemSetting 'Password.RequireSpecial', 'true', N'Phải có ký tự đặc biệt';
EXEC sp_UpdateSystemSetting 'Password.RequireDigit', 'true', N'Phải có chữ số';

CREATE PROCEDURE sp_GetPasswordRules
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        SettingKey,
        SettingValue,
		description
    FROM 
        SystemSettings
    WHERE 
        SettingKey LIKE 'Password.%'
        AND IsActive = 1;
END;
exec sp_GetPasswordRules
----------------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------------
DECLARE @ReturnValue VARCHAR(100);
DECLARE @ReturnStatus int;
EXEC sp_FindUserByUsernameOrEmail 'ddtrung143@gmail.com', @ReturnValue output
SELECT @ReturnValue ,@ReturnStatus;

select * from Users

SELECT FORMAT(ABS(CHECKSUM(NEWID())) % 10000, 'D4') AS RandomCode;

DECLARE @ReturnValue NVARCHAR(100);
exec sp_CreateUser 'admin3', 'password', 'abc1@gmail.com', N'đặng đức trung', default, default,default,default,default,default,default,default,  @ReturnValue output