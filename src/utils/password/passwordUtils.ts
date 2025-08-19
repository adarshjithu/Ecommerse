import bcrypt from 'bcrypt'
import { BadRequestError } from '../../constants/constants/customErrors';




// Function to hash a password
export const hashPassword = async (password: string): Promise<string> => {
     const saltRounds = 10; // Number of salt rounds
     try {
          const hashedPassword = await bcrypt.hash(password, saltRounds);

          return hashedPassword;
     } catch (error) {
          console.error("Error hashing password:", error);
          throw new BadRequestError("Error hashing password");
     }
};

export const comparePassword = async (normalPassword: string, encryptedPassword: string) => {
     try {
         
          return await bcrypt.compare(normalPassword, encryptedPassword);
     } catch (error) {
          console.log(error);
        throw new BadRequestError("Error while comparing password")
     }
};