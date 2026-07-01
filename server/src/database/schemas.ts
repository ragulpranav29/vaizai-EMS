import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Map MongoDB _id to frontend-friendly id
const toJSONConfig = {
  virtuals: true,
  versionKey: false,
  transform: (doc: any, ret: any) => {
    delete ret._id;
  }
};

// --- Projects ---
@Schema({ toJSON: toJSONConfig })
export class Project extends Document {
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) key: string;
  @Prop() description: string;
  @Prop() lead: string;
  @Prop({ default: 'active' }) status: string;
  @Prop({ default: Date.now }) createdAt: Date;
}
export const ProjectSchema = SchemaFactory.createForClass(Project);

// --- Sprints ---
@Schema({ toJSON: toJSONConfig })
export class Sprint extends Document {
  @Prop({ required: true }) name: string;
  @Prop({ default: 'future' }) status: string;
  @Prop() startDate: string;
  @Prop() endDate: string;
  @Prop() goal: string;
}
export const SprintSchema = SchemaFactory.createForClass(Sprint);

// --- Tasks ---
@Schema({ toJSON: toJSONConfig })
export class Task extends Document {
  @Prop({ required: true }) key: string;
  @Prop({ required: true }) title: string;
  @Prop() description: string;
  @Prop({ default: 'todo' }) status: string;
  @Prop({ default: 'medium' }) priority: string;
  @Prop() assignee: string;
  @Prop() reporter: string;
  @Prop() sprintId: string;
  @Prop({ required: true }) projectId: string;
  @Prop({ default: 0 }) timeEstimated: number;
  @Prop({ default: 0 }) timeSpent: number;
  @Prop() dueDate: string;
  @Prop({ type: [String], default: [] }) labels: string[];
  @Prop({ type: Object }) subTasks: any;
  @Prop({ type: Object }) comments: any;
  @Prop({ type: Object }) attachments: any;
  @Prop({ type: Object }) activities: any;
  @Prop({ default: Date.now }) createdAt: Date;
}
export const TaskSchema = SchemaFactory.createForClass(Task);

// --- Issues ---
@Schema({ toJSON: toJSONConfig })
export class Issue extends Document {
  @Prop({ required: true }) key: string;
  @Prop({ required: true }) title: string;
  @Prop() description: string;
  @Prop({ default: 'open' }) status: string;
  @Prop({ default: 'medium' }) priority: string;
  @Prop({ default: 'bug' }) type: string;
  @Prop() assignee: string;
  @Prop() reporter: string;
  @Prop({ type: Object }) comments: any;
  @Prop({ type: Object }) attachments: any;
  @Prop({ type: Object }) activities: any;
  @Prop({ default: Date.now }) createdAt: Date;
}
export const IssueSchema = SchemaFactory.createForClass(Issue);

// --- Team Members ---
@Schema({ toJSON: toJSONConfig })
export class TeamMember extends Document {
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) role: string;
  @Prop({ required: true }) email: string;
  @Prop() avatar: string;
  @Prop({ default: 40 }) capacity: number;
}
export const TeamMemberSchema = SchemaFactory.createForClass(TeamMember);

// --- Time Logs ---
@Schema({ toJSON: toJSONConfig })
export class TimeLog extends Document {
  @Prop({ required: true }) taskId: string;
  @Prop({ required: true }) taskTitle: string;
  @Prop({ required: true }) durationHours: number;
  @Prop() description: string;
  @Prop({ required: true }) date: string;
  @Prop({ required: true }) memberName: string;
  @Prop({ default: true }) billable: boolean;
}
export const TimeLogSchema = SchemaFactory.createForClass(TimeLog);

// --- Allocations ---
@Schema({ toJSON: toJSONConfig })
export class Allocation extends Document {
  @Prop({ required: true }) memberName: string;
  @Prop({ required: true }) projectName: string;
  @Prop({ required: true }) allocatedHours: number;
  @Prop({ required: true }) startDate: string;
  @Prop({ required: true }) endDate: string;
}
export const AllocationSchema = SchemaFactory.createForClass(Allocation);

// --- Automation Rules ---
@Schema({ toJSON: toJSONConfig })
export class AutomationRule extends Document {
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) triggerEvent: string;
  @Prop({ required: true }) actionType: string;
  @Prop({ required: true }) config: string;
  @Prop({ default: true }) active: boolean;
}
export const AutomationRuleSchema = SchemaFactory.createForClass(AutomationRule);

// --- Automation Logs ---
@Schema({ toJSON: toJSONConfig })
export class AutomationLog extends Document {
  @Prop({ required: true }) ruleName: string;
  @Prop({ required: true }) triggerEvent: string;
  @Prop({ required: true }) entityKey: string;
  @Prop({ required: true }) actionExecuted: string;
  @Prop({ default: 'success' }) status: string;
  @Prop() details: string;
  @Prop({ default: Date.now }) timestamp: Date;
}
export const AutomationLogSchema = SchemaFactory.createForClass(AutomationLog);

// --- Messages ---
@Schema({ toJSON: toJSONConfig })
export class Message extends Document {
  @Prop({ required: true }) channel: string;
  @Prop({ required: true }) text: string;
  @Prop({ required: true }) sender: string;
  @Prop({ default: Date.now }) timestamp: Date;
}
export const MessageSchema = SchemaFactory.createForClass(Message);
