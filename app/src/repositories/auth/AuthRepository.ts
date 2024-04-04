import BaseRepository from "../BaseRepository";


export default class AuthRepository extends BaseRepository {

    async login<T = any>(body: any) {
        return await this.api.post<T>('auth/login', { body });
    }
    async register<T = any>(body: any) {
        return await this.api.post<T>('auth/register', { body });
    }
    async logout<T = any>(body: any) {
        return await this.api.post<T>('/logout', { body });
    }

    async getUserDetails<T = any>(token: string) {
        return await this.api.get<T>('user/me/profile', { token });
    }
};