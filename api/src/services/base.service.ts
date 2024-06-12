import { RepositoryService } from './repository.service.js';

export class BaseService {
  private readonly _repositories: RepositoryService | null = null;

  constructor() {
    if (!this._repositories) {
      this._repositories = new RepositoryService();
    }
  }

  protected get repositories(): RepositoryService {
    if (!this._repositories) {
      throw new Error('Repositories not initialized');
    }
    return this._repositories;
  }
}
