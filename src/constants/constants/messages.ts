export const forgetPasswordMessage = (otp:string)=>{

   return  `Dear User,
    
Welcome to MasterMind! 🎉

We received a request to reset your password. To proceed with resetting your password, please use the following One-Time Password (OTP):

OTP: ${otp}

This OTP is valid for [insert validity time, e.g., 15 minutes]. If you did not request a password reset, please ignore this email.

For security reasons, after successfully resetting your password, we recommend updating it to something more secure.

If you have any questions or need further assistance, feel free to contact our support team.

Best regards,
The MasterMind Team`
}