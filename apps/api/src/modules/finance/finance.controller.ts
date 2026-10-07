import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, Req, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('finance')
@Controller('finance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post('transactions')
  createTransaction(@Req() req: any, @Body() dto: CreateTransactionDto) {
    return this.financeService.createTransaction(req.user.userId, dto);
  }

  @Get('transactions')
  getTransactions(
    @Req() req: any,
    @Query('type') type?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.financeService.getTransactions(req.user.userId, { type, from, to });
  }

  @Patch('transactions/:id')
  updateTransaction(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.financeService.updateTransaction(req.user.userId, id, dto);
  }

  @Delete('transactions/:id')
  @HttpCode(HttpStatus.OK)
  deleteTransaction(@Req() req: any, @Param('id') id: string) {
    return this.financeService.deleteTransaction(req.user.userId, id);
  }

  @Get('stats')
  getStats(@Req() req: any, @Query('period') period?: 'month' | 'year') {
    return this.financeService.getStats(req.user.userId, period || 'month');
  }

  @Get('chart')
  getChart(@Req() req: any, @Query('months') months?: string) {
    return this.financeService.getMonthlyChart(
      req.user.userId,
      months ? parseInt(months) : 6,
    );
  }

  @Post('budgets')
  createBudget(@Req() req: any, @Body() dto: CreateBudgetDto) {
    return this.financeService.createBudget(req.user.userId, dto);
  }

  @Get('budgets')
  getBudgets(@Req() req: any) {
    return this.financeService.getBudgets(req.user.userId);
  }

  @Delete('budgets/:id')
  @HttpCode(HttpStatus.OK)
  deleteBudget(@Req() req: any, @Param('id') id: string) {
    return this.financeService.deleteBudget(req.user.userId, id);
  }
}
