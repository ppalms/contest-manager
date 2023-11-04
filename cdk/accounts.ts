import * as fs from 'fs';
import * as path from 'path';

export interface Account {
  accountId: string;
  profile: string;
}

export class Accounts {
  static readonly PATH = '.accounts.json';

  static load(): Accounts {
    try {
      return Object.assign(
        new Accounts(),
        JSON.parse(fs.readFileSync(Accounts.PATH).toString())
      );
    } catch (e) {
      console.error('Could not load accounts file', e);
      console.error('Creating new accounts file');
      fs.writeFileSync(Accounts.PATH, JSON.stringify(new Accounts(), null, 2));
      console.error('Created new accounts file');
      console.error('Please edit the file and try again');
      process.exit(1);
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
