#!/usr/bin/env node
import {update} from './index';
import process from 'process';

update()
    .then((status: number) => {
      process.exit(status);
    })
    .catch((error: Error) => {
      console.error(error);
      process.exit(1);
    });
