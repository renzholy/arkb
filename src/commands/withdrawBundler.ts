import clc from 'cli-color';
import ArgumentsInterface from '../faces/arguments';
import CommandInterface from '../faces/command';
import { getWallet } from '../utils/wallet';
import walletOption from '../options/wallet';
import debugOption from '../options/debug';
import helpOption from '../options/help';
import timeoutOption from '../options/timeout';
import useBundlerOption from '../options/useBundler';
import { JWKInterface } from 'blockweave/dist/faces/lib/wallet';
import Transfer from '../lib/transfer';

const command: CommandInterface = {
  name: 'withdraw-bundler',
  description: 'Withdraw from your bundler balance',
  args: ['amount'],
  usage: ['0.3'],
  options: [walletOption, debugOption, helpOption, timeoutOption, useBundlerOption],
  execute: async (args: ArgumentsInterface): Promise<void> => {
    const { walletPath, bundler, debug, config, blockweave, commandValues, useBundler } = args;

    // Check if we have received a command value
    if (!commandValues || !commandValues.length) {
      console.log(clc.red('You forgot to set the amount.'));
      return;
    }

    // amount in ar
    const amnt = commandValues[0];
    const amount = parseInt(blockweave.ar.arToWinston(amnt), 10);
    const wallet: JWKInterface = await getWallet(walletPath, config, debug);

    if (!wallet) {
      return;
    }

    if (!useBundler) {
      console.log(clc.red('Please set bundler address'));
      return;
    }

    // Initiate withdrawal
    try {
      const transfer = new Transfer(wallet, blockweave);

      const addy = await transfer.withdrawBundler(bundler, amount);
      if (!addy) {
        console.log(clc.red('Error withdrawing to wallet'));
        return;
      }

      // Success response
      console.log(`${clc.cyan(addy)} has been funded with ${clc.yellow(`AR ${amnt} from bundler.`)}`);
    } catch (e) {
      console.log(clc.red('Error withdrawing to wallet'));
      if (debug) console.log(e);
      return;
    }
  },
};

export default command;
