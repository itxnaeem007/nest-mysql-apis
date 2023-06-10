import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UsersModule } from './components/users/users.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/users.entity'
import * as dotenv from 'dotenv'
import { SharedModule } from './components/shared/shared.module'
import { I18nJsonParser, I18nModule } from 'nestjs-i18n'
import path = require('path')
dotenv.config()
@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: 'mysql',
			host: process.env.HOST,
			port: +process.env.DB_PORT,
			username: process.env.DB_USERNAME,
			password: process.env.DB_PASSWORD,
			database: process.env.DATABASE,
			synchronize: false, // This should always be false, if you want to add , then please do through migration
			logging: false,
			autoLoadEntities: true,
		}),
		TypeOrmModule.forFeature([User]),
		I18nModule.forRoot({
			fallbackLanguage: 'en',
			fallbacks: {
				'en-*': 'en',
				'fr-*': 'fr',
			  },
			parser: I18nJsonParser,
			parserOptions: {
			  path: path.join(__dirname, '/i18n/'),
			},
		  }),
		UsersModule,
		SharedModule
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule { }
