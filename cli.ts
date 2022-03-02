#!/usr/bin/env node
import {update} from './index';
import process from 'process';
import c from 'ansi-colors';

update()
    .then((status: number) => {
    status === 1 ?
      console.log(c.blue.bgBlackBright('UPDATE COMPLETED SUCCESSFULLY')) :
      console.log(c.black.bgRed('UPDATED COMPLETED WITH ERROR'));
    process.exit(status);
    })
    .catch((error: Error) => {
      console.error(error);
      process.exit(1);
    });
