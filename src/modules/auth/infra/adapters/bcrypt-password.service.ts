import { Injectable } from '@nestjs/common';
import { IPasswordService } from '../../core/ports/password.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptPasswordService implements IPasswordService {
    private readonly rounds = 10;

    async hash(password: string): Promise<string> {
        return bcrypt.hash(password, this.rounds);
    }

    async compare(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}
