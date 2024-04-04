import { PersonalThing } from "../../redux/thing/ThingStack";
import BaseRepository from "../BaseRepository";

export default class ThingRepository extends BaseRepository {
    async getAllTodaysPersonalThings<T = any>(token: string) {
        return await this.api.get<T>('things/mine/today/all', { token });
    }
    async getTodaysPersonalThings<T = any>(token: string) {
        return await this.api.get<T>(`things/mine/today`, {
            token
        });
    }

    async getAllPersonalThings<T = any>(token: string) {
        return await this.api.get<T>('things/mine/all', { token });
    }

    async getOtherThingsToday<T = any>(token: string) {
        return await this.api.get<T>('things/others/today', { token });
    }

    async createThing<T = any>(body: {
        name: string;
        description: string;
        occurances: {
            startTime: string;
            endTime: string;
            repeat: string;
            dayOfWeek: string[];
        }[],
        sharedUsernames: string[];
    }, token: string) {
        return await this.api.post<T>('things/create', { body, token });
    }

    async getThingDetails<T = PersonalThing>(thingId: string, token: string) {
        return await this.api.get<T>(`things/${thingId}/details`, { token });
    }
}