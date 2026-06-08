import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private notifService: NotificationsService) {}

  @Get() findAll(@Query('userId') userId?: string) { return this.notifService.findAll(userId); }

  @Post('send')
  @ApiOperation({ summary: 'Send notification to user or all' })
  send(@Body() dto: { userId: string; title: string; body: string }) { return this.notifService.send(dto); }

  @Post('broadcast')
  @ApiOperation({ summary: 'Broadcast to all users' })
  broadcast(@Body() dto: { title: string; body: string }) { return this.notifService.sendToAll(dto); }
}
