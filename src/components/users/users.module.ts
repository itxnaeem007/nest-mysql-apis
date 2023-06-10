import { Module } from '@nestjs/common'
import { UsersController } from './controllers/users.controller'
import { UsersService } from './services/users.service'
import { User } from '../../entities/users.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersAccountService } from './services/users.account.service'
import { UserVerificationService } from './services/users.verification.service'
import { UsersPasswordService } from './services/users.password.service'
import { AdminController } from './controllers/admin.controller'
import { UserEntryService } from './services/user.entry.service';
import { SharedModule } from '../shared/shared.module'

@Module({
	imports: [TypeOrmModule.forFeature([User]), SharedModule],
	controllers: [UsersController, AdminController],
	providers: [UsersService, UsersAccountService, UserVerificationService, UsersPasswordService, UserEntryService],
})
export class UsersModule { }
