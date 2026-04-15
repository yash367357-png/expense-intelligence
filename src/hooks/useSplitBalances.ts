import { useMemo } from 'react';
import { useAppStore } from '../store';

export interface SplitBalancesResult {
  balances: Map<string, number>;
  totalOwedToYou: number;
  totalYouOwe: number;
}

export function useSplitBalances(): SplitBalancesResult {
  const splitExpenses = useAppStore((s) => s.splitExpenses);
  const settlements = useAppStore((s) => s.settlements);

  return useMemo(() => {
    const balances = new Map<string, number>();

    const adjust = (friendId: string, delta: number) => {
      balances.set(friendId, (balances.get(friendId) ?? 0) + delta);
    };

    // Process unsettled split expenses
    for (const split of splitExpenses) {
      if (split.settled) continue;

      if (split.paidBy === 'self') {
        // Each other participant owes you their share
        for (const participant of split.participants) {
          if (participant.personId !== 'self') {
            adjust(participant.personId, participant.shareAmount);
          }
        }
      } else {
        // A friend paid — find self's share and you owe them
        const selfParticipant = split.participants.find((p) => p.personId === 'self');
        if (selfParticipant) {
          adjust(split.paidBy, -selfParticipant.shareAmount);
        }
      }
    }

    // Process settlements
    for (const settlement of settlements) {
      if (settlement.fromPersonId === 'self') {
        // You paid toPersonId — reduces what you owe them (or increases credit)
        adjust(settlement.toPersonId, settlement.amount);
      } else if (settlement.toPersonId === 'self') {
        // fromPersonId paid you — reduces what they owe you
        adjust(settlement.fromPersonId, -settlement.amount);
      }
    }

    // Remove zero-balance entries
    for (const [key, val] of balances) {
      if (val === 0) balances.delete(key);
    }

    let totalOwedToYou = 0;
    let totalYouOwe = 0;

    for (const val of balances.values()) {
      if (val > 0) totalOwedToYou += val;
      else totalYouOwe += Math.abs(val);
    }

    return { balances, totalOwedToYou, totalYouOwe };
  }, [splitExpenses, settlements]);
}
