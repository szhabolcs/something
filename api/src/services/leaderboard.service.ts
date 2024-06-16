import { BaseService } from './base.service.js';

export class LeaderboardService extends BaseService {
  public async getLeaderBoard() {
    return this.repositories.leaderboard.getLeaderboard();
  }

  public async getUserVisibility(userId: string) {
    return this.repositories.leaderboard.getUserVisibility(userId);
  }

  public async toggleUserVisibility(userId: string) {
    return this.repositories.leaderboard.toggleUserVisibility(userId);
  }
}
