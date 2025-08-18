export const sendOtpToPhone = async (phone: string, code: string): Promise<void> => {
    try {
        // Here you would integrate with an SMS service to send the OTP
        // For example, using Twilio, Nexmo, etc.
        console.log(`Sending OTP ${code} to phone number ${phone}`);
        
        // Simulate sending OTP
        // await smsService.sendSms(phone, `Your OTP code is: ${code}`);
        
        console.log(`OTP sent successfully to ${phone}`);
    } catch (error) {
        console.error(`Failed to send OTP to ${phone}:`, error);
        throw new Error("Failed to send OTP");
    }
}