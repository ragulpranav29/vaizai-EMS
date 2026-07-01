import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CollaborationGateway } from './collaboration.gateway';
import {
  Project,
  ProjectSchema,
  Task,
  TaskSchema,
  Sprint,
  SprintSchema,
  Issue,
  IssueSchema,
  TeamMember,
  TeamMemberSchema,
  TimeLog,
  TimeLogSchema,
  AutomationRule,
  AutomationRuleSchema,
  Message,
  MessageSchema,
  Allocation,
  AllocationSchema,
  AutomationLog,
  AutomationLogSchema,
  User,
  UserSchema,
} from './database/schemas';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        signOptions: {
          expiresIn: (configService.get<string>('ACCESS_TOKEN_EXPIRY') ||
            '15m') as any,
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Sprint.name, schema: SprintSchema },
      { name: Issue.name, schema: IssueSchema },
      { name: TeamMember.name, schema: TeamMemberSchema },
      { name: TimeLog.name, schema: TimeLogSchema },
      { name: AutomationRule.name, schema: AutomationRuleSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Allocation.name, schema: AllocationSchema },
      { name: AutomationLog.name, schema: AutomationLogSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, CollaborationGateway, AuthService],
})
export class AppModule {}
