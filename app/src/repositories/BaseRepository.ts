import ApiService from '../services/ApiService';

export default class BaseRepository {
  public readonly api = new ApiService();
}
