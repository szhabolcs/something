export default class ApiService {
    private readonly baseUrl = process.env.EXPO_PUBLIC_API_URL;
    private static instance: ApiService;

    public constructor() {
        if (ApiService.instance) {
            return ApiService.instance;
        } else {
            ApiService.instance = this;
            return this;
        }
    }

    async fetchData(endPoint: string, method: string, options?: {
        token?: string,
        body?: any
    }) {
        try {
            // console.log('Current token:', options?.token);

            if (!options?.token) {
              console.error("Token not found");
              return;
            }

            console.log('Fetching data from:', `${this.baseUrl}/${endPoint}`);

            const response = await fetch(`${this.baseUrl}/${endPoint}`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': options?.token ? `Bearer ${options.token}` : ''
                },
                body: JSON.stringify(options?.body),

            });

            if (!response.ok) {
                console.error('Error while fetching: ', JSON.stringify(response, null, 2));
                return null;
            }

            return await response.json();
        } catch (e) {
            console.log('Error while fetching: ', JSON.stringify(e, null, 2));
            return null;
        }
    }

    async get<T = object | null>(endPoint: string, options?: {
        token?: string
    }) {
        return await this.fetchData(endPoint, 'GET', {
            token: options?.token
        }) as T;
    }

    async post<T = object | null>(endPoint: string, options?: { body?: any, token?: string }) {
        return await this.fetchData(endPoint, 'POST',
            options
        ) as T;
    }

    async postFormData<T = object | null>(endPoint: string, options: { body: FormData, token: string }) {
        try {
            const response = await fetch(`${this.baseUrl}/${endPoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': options?.token ? `Bearer ${options.token}` : '',
                    'Content-Type': 'multipart/form-data'
                },
                body: options?.body
            });
        } catch (e) {
            console.log('Error while fetching: ', JSON.stringify(e, null, 2));
        }
    }

    async patch<T = any>(endPoint: string, options: { token: string }) {
        return await this.fetchData(endPoint, 'PATCH', options) as T;
    }

}