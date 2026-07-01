import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.appService.getDashboardMetrics();
  }

  // --- Projects ---
  @Get('projects')
  async getProjects() {
    return this.appService.getProjects();
  }

  @Post('projects')
  async createProject(@Body() data: any) {
    return this.appService.createProject(data);
  }

  // --- Tasks ---
  @Get('tasks')
  async getTasks() {
    return this.appService.getTasks();
  }

  @Post('tasks')
  async createTask(@Body() data: any) {
    return this.appService.createTask(data);
  }

  @Put('tasks/:id')
  async updateTask(@Param('id') id: string, @Body() data: any) {
    return this.appService.updateTask(id, data);
  }

  @Delete('tasks/:id')
  async deleteTask(@Param('id') id: string) {
    return this.appService.deleteTask(id);
  }

  // --- Sprints ---
  @Get('sprints')
  async getSprints() {
    return this.appService.getSprints();
  }

  @Post('sprints')
  async createSprint(@Body() data: any) {
    return this.appService.createSprint(data);
  }

  @Put('sprints/:id')
  async updateSprint(@Param('id') id: string, @Body() data: any) {
    return this.appService.updateSprint(id, data);
  }

  // --- Issues ---
  @Get('issues')
  async getIssues() {
    return this.appService.getIssues();
  }

  @Post('issues')
  async createIssue(@Body() data: any) {
    return this.appService.createIssue(data);
  }

  @Put('issues/:id')
  async updateIssue(@Param('id') id: string, @Body() data: any) {
    return this.appService.updateIssue(id, data);
  }

  @Delete('issues/:id')
  async deleteIssue(@Param('id') id: string) {
    return this.appService.deleteIssue(id);
  }

  // --- Resource Allocations ---
  @Get('allocations')
  async getAllocations() {
    return this.appService.getAllocations();
  }

  @Post('allocations')
  async createAllocation(@Body() data: any) {
    return this.appService.createAllocation(data);
  }

  @Delete('allocations/:id')
  async deleteAllocation(@Param('id') id: string) {
    return this.appService.deleteAllocation(id);
  }

  // --- Automation Logs ---
  @Get('rules/logs')
  async getRulesLogs() {
    return this.appService.getAutomationLogs();
  }

  // --- Reports & Analytics ---
  @Get('reports')
  async getReports() {
    return this.appService.getReportsMetrics();
  }

  // --- Mock Auth ---
  @Post('auth/login')
  async login(@Body() body: any) {
    return this.appService.login(body);
  }

  @Post('auth/refresh')
  async refresh(@Body() body: any) {
    return this.appService.rotateTokens(body);
  }

  // --- Members ---
  @Get('members')
  async getMembers() {
    return this.appService.getMembers();
  }

  @Post('members')
  async createMember(@Body() data: any) {
    return this.appService.createMember(data);
  }

  // --- Time Logs ---
  @Get('timelogs')
  async getTimeLogs() {
    return this.appService.getTimeLogs();
  }

  @Post('timelogs')
  async logTime(@Body() data: any) {
    return this.appService.logTime(data);
  }

  // --- Automation Rules ---
  @Get('rules')
  async getRules() {
    return this.appService.getRules();
  }

  @Post('rules')
  async createRule(@Body() data: any) {
    return this.appService.createRule(data);
  }

  @Put('rules/:id/toggle')
  async toggleRule(@Param('id') id: string, @Body('active') active: boolean) {
    return this.appService.toggleRule(id, active);
  }

  @Delete('rules/:id')
  async deleteRule(@Param('id') id: string) {
    return this.appService.deleteRule(id);
  }

  // --- Messages ---
  @Get('messages/:channel')
  async getMessages(@Param('channel') channel: string) {
    return this.appService.getMessages(channel);
  }
}
