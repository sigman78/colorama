export const code = `\
// Type-safe dependency injection & service layer

export type Maybe<T> = T | null | undefined;

export interface Repository<T, ID = string> {
  findById(id: ID): Promise<Maybe<T>>;
  findAll(filter?: Partial<T>): Promise<T[]>;
  save(entity: T): Promise<T>;
  delete(id: ID): Promise<void>;
}

export interface UserDto {
  readonly id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  tags?: string[];
  createdAt: Date;
}

export enum Permission {
  Read = 'read',
  Write = 'write',
  Delete = 'delete',
}

type PermissionSet = Set<Permission>;

function hasPermission(perms: PermissionSet, required: Permission): boolean {
  return perms.has(required);
}

@Injectable()
export class UserService {
  constructor(private readonly repo: Repository<UserDto>) {}

  async getUser(id: string): Promise<Maybe<UserDto>> {
    return this.repo.findById(id);
  }

  async listAdmins(): Promise<UserDto[]> {
    return this.repo.findAll({ role: 'admin' });
  }
}

function identity<T>(value: T): T {
  return value;
}

const result: number[] = [1, 2, 3].map((n) => identity(n * 2));`;
