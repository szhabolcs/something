import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseRepository from '../BaseRepository';
import ApiService, { ApiResponse } from '../../services/ApiService';
const api = new ApiService();
export default class CameraRepository extends BaseRepository {
  async uploadImage(image: any, uuid: string) {
    const body = new FormData();
    // @ts-ignore
    body.append('image', {
      uri: image,
      name: 'image',
      type: 'image/jpg'
    });
    body.append('thingId', uuid);

    return await this.api.postFormData<ApiResponse<typeof api.client.images.upload.$post, 200>>('images/upload', {
      body,
      token: (await AsyncStorage.getItem('accessToken')) || ''
    });
  }
}
