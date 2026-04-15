import { SplitParticipant, SplitType } from '../types';

export function calculateSplit(
  totalAmount: number,
  participantIds: string[],
  splitType: SplitType,
  customValues?: Record<string, number> // percentages or amounts per personId
): SplitParticipant[] {
  const n = participantIds.length;

  if (n === 0) return [];

  switch (splitType) {
    case 'equal': {
      const shareAmount = Math.round((totalAmount / n) * 100) / 100;
      // Distribute rounding remainder to the first participant
      const remainder =
        Math.round((totalAmount - shareAmount * n) * 100) / 100;

      return participantIds.map((personId, index) => ({
        personId,
        shareAmount: index === 0 ? shareAmount + remainder : shareAmount,
        paid: false,
      }));
    }

    case 'percentage': {
      if (!customValues) {
        throw new Error('customValues (percentages) are required for percentage split');
      }

      const totalPercentage = participantIds.reduce(
        (sum, id) => sum + (customValues[id] ?? 0),
        0
      );

      if (Math.round(totalPercentage) !== 100) {
        throw new Error(
          `Percentages must sum to 100. Got ${totalPercentage}`
        );
      }

      return participantIds.map((personId) => {
        const sharePercentage = customValues[personId] ?? 0;
        const shareAmount =
          Math.round((totalAmount * sharePercentage) / 100 * 100) / 100;
        return {
          personId,
          shareAmount,
          sharePercentage,
          paid: false,
        };
      });
    }

    case 'amount': {
      if (!customValues) {
        throw new Error('customValues (amounts) are required for amount split');
      }

      const totalCustom = participantIds.reduce(
        (sum, id) => sum + (customValues[id] ?? 0),
        0
      );

      if (Math.round(totalCustom * 100) !== Math.round(totalAmount * 100)) {
        throw new Error(
          `Split amounts must sum to total (${totalAmount}). Got ${totalCustom}`
        );
      }

      return participantIds.map((personId) => ({
        personId,
        shareAmount: customValues[personId] ?? 0,
        paid: false,
      }));
    }

    default:
      throw new Error(`Unknown split type: ${splitType}`);
  }
}
