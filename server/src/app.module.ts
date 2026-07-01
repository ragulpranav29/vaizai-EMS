import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CollaborationGateway } from './collaboration.gateway';
import { 
  Project, ProjectSchema,
  Task, TaskSchema,
  Sprint, SprintSchema,
  Issue, IssueSchema,
  TeamMember, TeamMemberSchema,
  TimeLog, TimeLogSchema,
  AutomationRule, AutomationRuleSchema,
  Message, MessageSchema,
  Allocation, AllocationSchema,
  AutomationLog, AutomationLogSchema
} from './database/schemas';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
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
      { name: AutomationLog.name, schema: AutomationLogSchema }
    ])
  ],
  controllers: [AppController],
  providers: [AppService, CollaborationGateway],
})
export class AppModule {}
