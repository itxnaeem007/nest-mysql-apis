import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedService } from './services/shared.service';

@Module({
	imports: [TypeOrmModule.forFeature([])],
	controllers: [],
	providers: [SharedService],
    exports: [SharedService]
})
export class SharedModule { }
