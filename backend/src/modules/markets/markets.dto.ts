import { IsBoolean, IsEnum, IsIn, IsMongoId, IsNumber, IsOptional, IsString, Length, Min } from "class-validator";
import { Transform } from "class-transformer";

export class FetchMarketsQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  trending?: boolean;

  @IsOptional()
  @Transform(({ value }) => value !== "false" && value !== false)
  @IsBoolean()
  newest?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  qualified?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  open_for_votes?: boolean;
}

export class CastFreeVoteDto {
  @IsOptional()
  @IsMongoId()
  userId?: string;

  @IsOptional()
  @IsMongoId()
  profileId?: string;

  @IsIn(["YES", "NO", "UP", "DOWN"], { message: "Vote side must be YES, NO, UP, or DOWN." })
  side: "YES" | "NO" | "UP" | "DOWN";

  @IsOptional()
  @IsString()
  @Length(1, 60)
  optionId?: string;
}

export class ExecuteTradeDto {
  @IsMongoId({ message: "A valid profile id is required." })
  profileId: string;

  @IsEnum(["YES", "NO"], { message: "Trade side must be YES or NO." })
  side: "YES" | "NO";

  @IsEnum(["BUY", "SELL"], { message: "Trade action must be BUY or SELL." })
  action: "BUY" | "SELL";

  @IsNumber()
  @Min(0.0001, { message: "Amount must be greater than 0." })
  amount: number;

  @IsOptional()
  @IsNumber()
  feeAmount?: number;

  @IsOptional()
  @IsNumber()
  grossAmount?: number;

  @IsOptional()
  @IsString()
  @Length(0, 120)
  txHash?: string;
}

export class SeedMarketLiquidityDto {
  @IsMongoId({ message: "A valid profile id is required." })
  profileId: string;

  @IsEnum(["YES", "NO"], { message: "Seed side must be YES or NO." })
  side: "YES" | "NO";

  @IsString()
  @Length(66, 66, { message: "A valid X Layer transaction hash is required." })
  txHash: string;
}
