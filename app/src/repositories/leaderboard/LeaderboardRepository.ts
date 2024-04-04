import BaseRepository from "../BaseRepository";

export class LeaderboardRepository extends BaseRepository {
    async getLeaderboard<T = any>(token: string) {
        return await this.api.get<T>('user/leaderboard/all', { token });
    }

    async toggleVisibility<T = any>(token: string) {
        return await this.api.patch<T>('user/leaderboard/toggle-visibility', { token });
    }
}