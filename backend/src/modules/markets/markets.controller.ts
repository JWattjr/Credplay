import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from "@nestjs/common";
import { MarketsService } from "./markets.service";
import { FetchMarketsQueryDto, CastFreeVoteDto, ExecuteTradeDto, SeedMarketLiquidityDto } from "./markets.dto";

@Controller("markets")
export class MarketsController {
  constructor(private readonly marketsService: MarketsService) {}

  @Get()
  async fetchMarkets(@Query() query: FetchMarketsQueryDto) {
    return this.marketsService.fetchMarkets({
      status: query.status as any,
      category: query.category,
      trending: query.trending,
      newest: query.newest,
      qualified: query.qualified,
      open_for_votes: query.open_for_votes,
    });
  }

  @Get(":marketId")
  async fetchMarketDetail(
    @Param("marketId") marketId: string,
    @Query("userId") userId?: string,
  ) {
    return this.marketsService.fetchMarketDetail(marketId, userId);
  }

  @Get(":marketId/positions")
  async fetchMarketPositions(
    @Param("marketId") marketId: string,
    @Query("profileId") profileId: string,
  ) {
    return this.marketsService.fetchMarketPositions(marketId, profileId);
  }

  @Get(":marketId/trades")
  async fetchMarketTrades(@Param("marketId") marketId: string) {
    return this.marketsService.fetchMarketTrades(marketId);
  }

  @Post(":marketId/vote")
  @HttpCode(HttpStatus.OK)
  async castFreeVoteDirect(
    @Param("marketId") marketId: string,
    @Body() dto: CastFreeVoteDto,
  ) {
    const authorId = dto.userId || dto.profileId;
    return this.marketsService.castFreeVote(marketId, authorId!, dto.side, dto.optionId);
  }

  @Post(":marketId/free-vote")
  @HttpCode(HttpStatus.OK)
  async castFreeVote(
    @Param("marketId") marketId: string,
    @Body() dto: CastFreeVoteDto,
  ) {
    const authorId = dto.userId || dto.profileId;
    return this.marketsService.castFreeVote(marketId, authorId!, dto.side, dto.optionId);
  }

  @Post(":marketId/approve-trading")
  @HttpCode(HttpStatus.OK)
  async approveMarketForTrading(@Param("marketId") marketId: string) {
    return this.marketsService.approveMarketForTrading(marketId);
  }

  @Post(":marketId/seed")
  @HttpCode(HttpStatus.OK)
  async seedMarketLiquidity(
    @Param("marketId") marketId: string,
    @Body() dto: SeedMarketLiquidityDto,
  ) {
    return this.marketsService.seedMarketLiquidity({
      marketId,
      profileId: dto.profileId,
      side: dto.side,
      txHash: dto.txHash,
    });
  }

  @Post(":marketId/trade")
  @HttpCode(HttpStatus.OK)
  async executeMarketTrade(
    @Param("marketId") marketId: string,
    @Body() dto: ExecuteTradeDto,
  ) {
    return this.marketsService.executeMarketTrade(dto);
  }
}
