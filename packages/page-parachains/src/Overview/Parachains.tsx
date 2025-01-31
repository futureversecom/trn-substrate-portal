// Copyright 2017-2025 @polkadot/app-parachains authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ParaId } from '@polkadot/types/interfaces';
import type { LeasePeriod, QueuedAction, ScheduledProposals } from '../types';

import React, { useMemo, useRef } from 'react';

import { Table } from '@polkadot/react-components';
import { useBestNumber, useIsParasLinked } from '@polkadot/react-hooks';

import { useTranslation } from '../translate';
import Parachain from './Parachain';
import useEvents from './useEvents';
import useValidators from './useValidators';

interface Props {
  actionsQueue: QueuedAction[];
  ids?: ParaId[];
  leasePeriod?: LeasePeriod;
  scheduled?: ScheduledProposals[];
}

function extractScheduledIds (scheduled: ScheduledProposals[] = []): Record<string, boolean> {
  return scheduled.reduce((all: Record<string, boolean>, { scheduledIds }: ScheduledProposals): Record<string, boolean> =>
    scheduledIds.reduce((all: Record<string, boolean>, id) => ({
      ...all,
      [id.toString()]: true
    }), all), {});
}

function extractActions (actionsQueue: QueuedAction[], knownIds: [ParaId, string][] = []): Record<string, QueuedAction | undefined> {
  return knownIds.reduce((all: Record<string, QueuedAction | undefined>, [id, key]) => ({
    ...all,
    [key]: actionsQueue.find(({ paraIds }) => paraIds.some((p) => p.eq(id)))
  }), {});
}

function extractIds (hasLinksMap: Record<string, boolean>, ids: ParaId[]): [ParaId, string][] | undefined {
  return ids
    .map((id): [ParaId, string] => [id, id.toString()])
    .sort(([aId, aIds], [bId, bIds]): number => {
      const aKnown = hasLinksMap[aIds] || false;
      const bKnown = hasLinksMap[bIds] || false;

      return aKnown === bKnown
        ? aId.cmp(bId)
        : aKnown
          ? -1
          : 1;
    });
}

function Parachains ({ actionsQueue, ids, leasePeriod, scheduled }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const bestNumber = useBestNumber();
  const { lastBacked, lastIncluded, lastTimeout } = useEvents();
  const hasLinksMap = useIsParasLinked(ids);
  const [validators, validatorMap] = useValidators(ids);

  const headerRef = useRef<([React.ReactNode?, string?, number?] | false)[]>([
    [t<string>('parachains'), 'start', 2],
    ['', 'media--1400'],
    [t<string>('head'), 'start media--1500'],
    [t<string>('lifecycle'), 'start'],
    [],
    [t<string>('included'), undefined, 2],
    [t<string>('backed'), 'no-pad-left media--900'],
    [t<string>('timeout'), 'no-pad-left media--1600'],
    [t<string>('chain'), 'no-pad-left'],
    [t<string>('in/out'), 'media--1700', 2],
    [t<string>('leases'), 'media--1100']
  ]);

  const scheduledIds = useMemo(
    () => extractScheduledIds(scheduled),
    [scheduled]
  );

  const knownIds = useMemo(
    () => ids && extractIds(hasLinksMap, ids),
    [ids, hasLinksMap]
  );

  const nextActions = useMemo(
    () => extractActions(actionsQueue, knownIds),
    [actionsQueue, knownIds]
  );

  return (
    <Table
      empty={knownIds && t<string>('There are no registered parachains')}
      header={headerRef.current}
    >
      {knownIds?.map(([id, key]): React.ReactNode => (
        <Parachain
          bestNumber={bestNumber}
          id={id}
          isScheduled={scheduledIds[key]}
          key={key}
          lastBacked={lastBacked[key]}
          lastInclusion={lastIncluded[key]}
          lastTimeout={lastTimeout[key]}
          leasePeriod={leasePeriod}
          nextAction={nextActions[key]}
          sessionValidators={validators}
          validators={validatorMap[key]}
        />
      ))}
    </Table>
  );
}

export default React.memo(Parachains);
