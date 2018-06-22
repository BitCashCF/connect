/* @flow */
'use strict';

import BlockBook from './BitcoreBackend';

import { getCoinInfoByHash, getCoinInfoByCurrency } from '../data/CoinInfo';
import type { CoinInfo } from 'flowtype';

const instances: Array<any> = [];

export const find = (urls: Array<string>): ?BlockBook => {
    for (let i: number = 0; i < instances.length; i++) {
        if (instances[i].options.bitcoreURL === urls) {
            return instances[i];
        }
    }
    return null;
};

export const createFromCurrency = async (currency: string): Promise<BlockBook> => {
    const coinInfo: ?CoinInfo = getCoinInfoByCurrency(currency);
    if (!coinInfo) {
        throw new Error('Currency not found for ' + currency);
    }
    // get bitcore urls from coins.json using currency name/shortcut
    if (coinInfo.bitcore.length < 1) {
        throw new Error('Bitcore urls not found for ' + currency);
    }

    let backend: ?BlockBook = find(coinInfo.bitcore);
    if (!backend) {
        backend = new BlockBook({ bitcoreURL: coinInfo.bitcore, coinInfo: coinInfo });
        instances.push(backend);
    }
    // const backend: BitcoreBackend = new BitcoreBackend({ bitcoreURL: coinInfo.bitcore, coinInfo: coinInfo });
    await backend.loadCoinInfo(coinInfo);
    // instances.push(backend);
    return backend;
};

export const createFromCoinInfo = async (coinInfo: CoinInfo): Promise<BlockBook> => {
    let backend: ?BlockBook = find(coinInfo.bitcore);
    if (!backend) {
        backend = new BlockBook({ bitcoreURL: coinInfo.bitcore, coinInfo: coinInfo });
        instances.push(backend);
    }
    // await backend.loadCoinInfo();
    return backend;
};

// CoinInfo will be find by network hash
export const createFromUrl = async (urls: Array<string>): Promise<BlockBook> => {
    let backend: ?BlockBook = find(urls);
    if (!backend) {
        backend = new BlockBook({ bitcoreURL: urls });
        instances.push(backend);
    }
    await backend.loadCoinInfo();
    return backend;
};

export const create = async (urlsOrCurrency: CoinInfo | Array<string> | string): Promise<BlockBook> => {
    if (Array.isArray(urlsOrCurrency)) {
        return await createFromUrl(urlsOrCurrency);
    } else if (typeof urlsOrCurrency === 'object') {
        return await createFromCoinInfo(urlsOrCurrency);
    } else if (typeof urlsOrCurrency === 'string') {
        return await createFromCurrency(urlsOrCurrency);
    } else {
        throw new Error('Invalid params ' + urlsOrCurrency);
    }
};


export default BlockBook;
