import { ScoreRepository } from '../repositories/score.repository.js';
import { SessionRepository } from '../repositories/session.repository.js';
import { UserRepository } from '../repositories/user.repository.js';

export class RepositoryService {
  public readonly user = new UserRepository();
  public readonly score = new ScoreRepository();
  public readonly session = new SessionRepository();
}
