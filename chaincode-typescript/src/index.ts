/*
 * SPDX-License-Identifier: Apache-2.0
 */

import {type Contract} from 'fabric-contract-api';
//import {AssetTransferContract} from './assetTransfer';
//import {TestContract} from './test';
import {ElectionContract} from './election'

export const contracts: typeof Contract[] = [ElectionContract];
