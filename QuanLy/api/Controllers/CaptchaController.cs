using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System;
using api.AppUtils;

[Route("api/[controller]")]
[ApiController]
public class CaptchaController : ControllerBase
{
    private string SecretKey = AppConstant.DEFAULT_KEYCAPTCHA; 

    [HttpGet("generate")]
    public IActionResult GenerateCaptcha()
    {
        var code = CaptchaHelper.GenerateCaptchaCode();
        var imageBase64 = CaptchaHelper.GenerateCaptchaImageBase64(code);
        var token = CaptchaHelper.GenerateCaptchaToken(code, SecretKey);

        return Ok(new
        {
            imageBase64,
            token
        });
    }

    [HttpPost("verify")]
    public IActionResult VerifyCaptcha([FromBody] CaptchaVerificationRequest request)
    {
        if (CaptchaHelper.ValidateCaptchaToken(request.Input, request.Token, SecretKey))
        {
            return Ok(new { success = true, message = "CAPTCHA chính xác." });
        }
        else
        {
            return BadRequest(new { success = false, message = "CAPTCHA không hợp lệ." });
        }
    }
}

public class CaptchaVerificationRequest
{
    public string Input { get; set; }
    public string Token { get; set; }
}

