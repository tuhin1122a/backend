import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('overview') @ApiOperation({ summary: 'Dashboard overview stats' })
  getOverview() { return this.analyticsService.getOverview(); }

  @Get('revenue-chart') getRevenueChart() { return this.analyticsService.getRevenueChart(); }
  @Get('user-growth') getUserGrowth() { return this.analyticsService.getUserGrowth(); }
}
