import { IsArray, IsBoolean, IsIn, IsISO8601, IsMongoId, IsOptional, IsString, Length, ValidateNested } from "class-validator";
import { Transform, Type } from "class-transformer";

export class FeedQueryDto {
  @IsOptional()
  @IsMongoId()
  viewerProfileId?: string;

  @IsOptional()
  @IsMongoId()
  userId?: string;

  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  onlyMarkets?: boolean;
}

export class CreatePostDto {
  @IsOptional()
  @IsMongoId()
  authorId?: string;

  @IsOptional()
  @IsMongoId()
  profileId?: string;

  @IsString()
  @Length(1, 1000, { message: "Post content must be between 1 and 1000 characters." })
  content: string;
}

export class MarketOptionInputDto {
  @IsString()
  @Length(1, 40)
  label: string;
}

export class CreateMarketPostDto {
  @IsOptional()
  @IsMongoId()
  authorId?: string;

  @IsOptional()
  @IsMongoId()
  profileId?: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  content?: string;

  @IsString()
  @Length(1, 240, { message: "Market question is required (max 240 chars)." })
  question: string;

  @IsString()
  @Length(1, 60)
  category: string;

  @IsOptional()
  @IsIn(["binary", "multi_option"])
  kind?: "binary" | "multi_option";

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MarketOptionInputDto)
  options?: MarketOptionInputDto[];

  @IsISO8601({}, { message: "A valid deadline date is required." })
  deadline: string;

  @IsOptional()
  @IsString()
  @Length(1, 240)
  resolutionSource?: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  yesCondition?: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  noCondition?: string;

  @IsString()
  @Length(1, 120, { message: "Prediction posts require a verified X Layer creation transaction." })
  creationFeeTxHash: string;

  @IsString()
  @Length(1, 120, { message: "Prediction posts require the X Layer market contract address." })
  feeCollectorAddress: string;

  @IsString()
  @Length(66, 66, { message: "Prediction posts require the on-chain market key." })
  chainMarketKey: string;
}
