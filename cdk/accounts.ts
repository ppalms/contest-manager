import * as fs from 'fs';
import * as path from 'path';

export interface Account {
  accountId: string;
  profile: string;
}

export class Accounts {
  static readonly PATH = path.join(__dirname, '.accounts.json');

  static load(): Accounts {
    try {
      return Object.assign(
        new Accounts(),
        JSON.parse(fs.readFileSync(Accounts.PATH).toString())
      );
    } catch (e) {
      return new Accounts();
    }
  }

  toolchain?: Account;
  network?: Account;
  development?: Account;
  production?: Account;

  store() {
    fs.writeFileSync(Accounts.PATH, JSON.stringify(this, null, 2));
  }
}
