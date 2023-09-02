// Copyright 2017-2023 @polkadot/app-explorer authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Something is seriously going wrong here...
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import type { H256 } from '@polkadot/types/interfaces';
import type { BlockHash } from '@polkadot/types/interfaces/chain';
import type { BlockEVMEvent } from '../types';

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { MarkError, Table } from '@polkadot/react-components';

import EVMEvent from './EVMEvent';

interface Props {
  className?: string;
  error?: Error | null;
  emptyLabel?: React.ReactNode;
  events?: BlockEVMEvent[] | null;
  eventClassName?: string;
  label?: React.ReactNode;
}

function renderEvent (className: string | undefined, event: BlockEVMEvent): React.ReactNode {
  const { blockHash, blockNumber, transactionHash, transactionIndex } = event;

  return (
    <tr
      className={className}
      key={(transactionHash as H256)?.toString()}
    >
      <td className='overflow relative'>
        <EVMEvent value={event} />
        {blockNumber && (
          <div className='absolute --digits'>
            <Link to={`/explorer/query/${(blockHash as BlockHash)?.toString() || ''}`}>{blockNumber.toString()}-{transactionIndex?.toString()?.padStart(2, '0')}</Link>
          </div>
        )}
      </td>
    </tr>
  );
}

function EVMEvents ({ className = '', emptyLabel, error, eventClassName, events, label }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const header = useMemo<[React.ReactNode?, string?, number?][]>(
    () => [
      [label || t<string>('recent evm events'), 'start']
    ],
    [label, t]
  );

  return (
    <Table
      className={className}
      empty={emptyLabel || t<string>('No events available')}
      header={header}
    >
      {error
        ? (
          <tr
            className={eventClassName}
            key='error'
          >
            <td><MarkError content={t<string>('Unable to decode the block events. {{error}}', { replace: { error: error.message } })} /></td>
          </tr>
        )
        : events?.map((e) => renderEvent(eventClassName, e))
      }
    </Table>
  );
}

export default React.memo(EVMEvents);
