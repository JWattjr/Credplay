import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { UserSchema } from "./modules/users/users.model";
import { PostSchema } from "./modules/posts/posts.model";
import {
  MarketSchema,
  VoteSchema,
  DailyVoteUsageSchema,
  MarketPositionSchema,
  MarketTradeSchema,
} from "./modules/markets/markets.model";
import { CommentSchema } from "./modules/comments/comments.model";
import { LikeSchema, ReshareSchema } from "./modules/interactions/interactions.model";

dotenv.config();

const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/verity";

// Compile Mongoose models
const UserModel = mongoose.model("User", UserSchema);
const PostModel = mongoose.model("Post", PostSchema);
const MarketModel = mongoose.model("Market", MarketSchema);
const VoteModel = mongoose.model("Vote", VoteSchema);
const DailyVoteUsageModel = mongoose.model("DailyVoteUsage", DailyVoteUsageSchema);
const MarketPositionModel = mongoose.model("MarketPosition", MarketPositionSchema);
const MarketTradeModel = mongoose.model("MarketTrade", MarketTradeSchema);
const CommentModel = mongoose.model("Comment", CommentSchema);
const LikeModel = mongoose.model("Like", LikeSchema);
const ReshareModel = mongoose.model("Reshare", ReshareSchema);

async function createUser(username: string, displayName = username) {
  return UserModel.create({
    username,
    displayName,
    walletAddress: `seed-${username.toLowerCase()}`,
    bio: `${displayName} is testing Verity signal markets.`,
  });
}

async function createNormalPost(authorId: string, content: string) {
  return PostModel.create({
    authorId: new mongoose.Types.ObjectId(authorId),
    type: "normal",
    content,
  });
}

async function createMarketPost(input: {
  authorId: string;
  content: string;
  question: string;
  category: string;
  status?: "open_for_votes" | "qualified";
}) {
  const post = await PostModel.create({
    authorId: new mongoose.Types.ObjectId(input.authorId),
    type: "market",
    content: input.content,
  });

  const market = await MarketModel.create({
    postId: post._id,
    authorId: new mongoose.Types.ObjectId(input.authorId),
    question: input.question,
    category: input.category,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    resolutionSource: "Official public result or primary source report",
    yesCondition: "YES resolves if the stated measurable threshold is reached by the deadline.",
    noCondition: "NO resolves if the stated measurable threshold is not reached by the deadline.",
    status: input.status || "open_for_votes",
  });

  return { post, market };
}

async function addVote(marketId: string, userId: string, side: string) {
  await VoteModel.create({
    marketId: new mongoose.Types.ObjectId(marketId),
    userId: new mongoose.Types.ObjectId(userId),
    side,
    voteType: "free",
  });
}

async function syncMarketCounters(marketId: string) {
  const [freeYesVotes, freeNoVotes, uniqueVotersCount] = await Promise.all([
    VoteModel.countDocuments({ marketId: new mongoose.Types.ObjectId(marketId), voteType: "free", side: "YES" }),
    VoteModel.countDocuments({ marketId: new mongoose.Types.ObjectId(marketId), voteType: "free", side: "NO" }),
    VoteModel.distinct("userId", { marketId: new mongoose.Types.ObjectId(marketId), voteType: "free" }).then((ids) => ids.length),
  ]);
  const totalFreeVotes = freeYesVotes + freeNoVotes;
  const market = await MarketModel.findById(marketId);
  const qualified =
    totalFreeVotes >= (market?.qualificationThreshold || 50) &&
    uniqueVotersCount >= (market?.uniqueVoterThreshold || 30);

  await MarketModel.updateOne(
    { _id: marketId },
    {
      freeYesVotes,
      freeNoVotes,
      totalFreeVotes,
      uniqueVotersCount,
      status: qualified ? "qualified" : market?.status || "open_for_votes",
    },
  );
}

async function clearSeededCollections() {
  await Promise.all([
    CommentModel.deleteMany({}),
    LikeModel.deleteMany({}),
    ReshareModel.deleteMany({}),
    MarketTradeModel.deleteMany({}),
    MarketPositionModel.deleteMany({}),
    DailyVoteUsageModel.deleteMany({}),
    VoteModel.deleteMany({}),
    MarketModel.deleteMany({}),
    PostModel.deleteMany({}),
    UserModel.deleteMany({}),
  ]);
}

async function seed() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri);
  console.log(`Connected to MongoDB for seeding: ${mongoose.connection.name}`);

  await Promise.all([
    UserModel.syncIndexes(),
    PostModel.syncIndexes(),
    MarketModel.syncIndexes(),
    VoteModel.syncIndexes(),
    DailyVoteUsageModel.syncIndexes(),
    CommentModel.syncIndexes(),
    LikeModel.syncIndexes(),
    ReshareModel.syncIndexes(),
  ]);
  await clearSeededCollections();

  const [jude, maya, theo] = await Promise.all([
    createUser("JudeSignal"),
    createUser("MayaOracle", "Maya Oracle"),
    createUser("TheoMarkets", "Theo Markets"),
  ]);
  const generatedVoters = await Promise.all(
    Array.from({ length: 60 }, (_, index) => createUser(`SignalVoter${index + 1}`)),
  );

  const normalOne = await createNormalPost(jude.id, "Signal check: free votes now gate markets before USDC review.");
  const normalTwo = await createNormalPost(maya.id, "Prediction quality starts with measurable outcomes, not vibes.");

  const closeMarket = await createMarketPost({
    authorId: theo.id,
    content: "Will Arc testnet community volume exceed the stated milestone before the deadline?",
    question: "Will Arc testnet community volume exceed 100,000 USDC before the deadline?",
    category: "Crypto",
  });
  const qualifiedMarket = await createMarketPost({
    authorId: jude.id,
    content: "This seed market already qualifies for review.",
    question: "Will the Verity demo feed contain at least 5 seeded interactions by tomorrow?",
    category: "Culture",
    status: "qualified",
  });
  const openMarket = await createMarketPost({
    authorId: maya.id,
    content: "Early open-for-votes seed market.",
    question: "Will Bitcoin close above 100000 USD on the listed deadline?",
    category: "Economics",
  });

  await CommentModel.create([
    { postId: normalOne._id, authorId: maya._id, content: "This makes the feed much clearer.", likesCount: 1 },
    { postId: closeMarket.post._id, authorId: jude._id, content: "Needs a few more unique voters.", likesCount: 0 },
  ]);
  await PostModel.updateOne({ _id: normalOne._id }, { commentsCount: 1 });
  await PostModel.updateOne({ _id: closeMarket.post._id }, { commentsCount: 1 });

  await LikeModel.create({ postId: normalTwo._id, userId: jude._id });
  await ReshareModel.create({ postId: closeMarket.post._id, userId: maya._id });
  await PostModel.updateOne({ _id: normalTwo._id }, { likesCount: 1 });
  await PostModel.updateOne({ _id: closeMarket.post._id }, { resharesCount: 1 });

  for (let index = 0; index < 49; index += 1) {
    await addVote(closeMarket.market.id, generatedVoters[index].id, index % 3 === 0 ? "NO" : "YES");
  }
  for (let index = 0; index < 50; index += 1) {
    await addVote(qualifiedMarket.market.id, generatedVoters[index].id, index % 4 === 0 ? "NO" : "YES");
  }
  await addVote(openMarket.market.id, jude.id, "YES");
  await addVote(openMarket.market.id, theo.id, "NO");

  await Promise.all([
    syncMarketCounters(closeMarket.market.id),
    syncMarketCounters(qualifiedMarket.market.id),
    syncMarketCounters(openMarket.market.id),
  ]);

  console.log("Seed complete: 3 primary users, normal posts, market posts, comments, free votes, and qualification states.");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed", error);
  process.exit(1);
});
