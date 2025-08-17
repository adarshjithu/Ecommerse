import userModel from "../../../models/userModel";
import { BaseRepository } from "../../../repository/baseRepository";

export class AuthRepository extends BaseRepository<any> {
constructor() {
    super(userModel);
    
  }
}