import AuthRepository from "../repositories/auth/AuthRepository";
import { LeaderboardRepository } from "../repositories/leaderboard/LeaderboardRepository";
import ThingRepository from "../repositories/thing/ThingRepository";

export default class RespositoryService {

    private static instance: RespositoryService;

    public constructor() {
        if (RespositoryService.instance) {
            return RespositoryService.instance;
        } else {
            RespositoryService.instance = this;
            return this;
        }
    }

    public readonly authRespoitory = new AuthRepository();
    public readonly thingRepository = new ThingRepository();
    public readonly leaderboardResository = new LeaderboardRepository();
}