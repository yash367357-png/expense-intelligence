import * as XLSX from 'xlsx';
import { useAppStore } from '../store';
import { Transaction } from '../types';

export function useExcelIO() {
  const transactions = useAppStore((s) => s.transactions);
  const categories = useAppStore((s) => s.categories);
  const accounts = useAppStore((s) => s.accounts);
  const splitExpenses = useAppStore((s) => s.splitExpenses);
  const friends = useAppStore((s) => s.friends);
  const importData = useAppStore((s) => s.importData);

  // ─── Export ────────────────────────────────────────────────────────────────

  function exportToExcel(): void {
    const wb = XLSX.utils.book_new();

    // Sheet 1 – Transactions
    const txRows = transactions.map((t) => {
      const category = categories.find((c) => c.id === t.categoryId);
      const account = accounts.find((a) => a.id === t.accountId);
      return {
        Date: t.date,
        Type: t.type,
        Amount: t.amount,
        Category: category?.name ?? '',
        Account: account?.name ?? '',
        Description: t.description,
        Tags: t.tags.join(', '),
      };
    });
    const txSheet = XLSX.utils.json_to_sheet(txRows);
    XLSX.utils.book_append_sheet(wb, txSheet, 'Transactions');

    // Sheet 2 – Split Expenses
    const splitRows = splitExpenses.map((s) => {
      const paidByName =
        s.paidBy === 'self'
          ? 'You'
          : friends.find((f) => f.id === s.paidBy)?.name ?? s.paidBy;

      const participantNames = s.participants
        .map((p) =>
          p.personId === 'self'
            ? 'You'
            : friends.find((f) => f.id === p.personId)?.name ?? p.personId
        )
        .join(', ');

      return {
        Date: s.date,
        Description: s.description,
        'Total Amount': s.totalAmount,
        'Paid By': paidByName,
        'Split Type': s.splitType,
        Participants: participantNames,
        Status: s.settled ? 'Settled' : 'Pending',
      };
    });
    const splitSheet = XLSX.utils.json_to_sheet(splitRows);
    XLSX.utils.book_append_sheet(wb, splitSheet, 'Split Expenses');

    // Trigger download
    XLSX.writeFile(wb, 'expense-tracker-export.xlsx');
  }

  // ─── Import ────────────────────────────────────────────────────────────────

  async function importFromExcel(
    file: File
  ): Promise<{ success: boolean; imported: number; errors: string[] }> {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const errors: string[] = [];

        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: 'array' });

          // Find "Transactions" sheet
          const txSheetName = wb.SheetNames.find(
            (n) => n.toLowerCase() === 'transactions'
          );
          if (!txSheetName) {
            resolve({
              success: false,
              imported: 0,
              errors: ['No "Transactions" sheet found in the workbook.'],
            });
            return;
          }

          const sheet = wb.Sheets[txSheetName];
          const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

          const imported: Transaction[] = [];

          rows.forEach((row, idx) => {
            const rowNum = idx + 2; // 1-based + header row

            // Account (required)
            const accountName = String(row['Account'] ?? '').trim();
            const account = accounts.find(
              (a) => a.name.toLowerCase() === accountName.toLowerCase()
            );
            if (!account) {
              errors.push(
                `Row ${rowNum}: Account "${accountName}" not found – row skipped.`
              );
              return;
            }

            // Category (optional fallback to 'other')
            const categoryName = String(row['Category'] ?? '').trim();
            const category =
              categories.find(
                (c) => c.name.toLowerCase() === categoryName.toLowerCase()
              ) ?? categories.find((c) => c.id === 'other');

            const type = (
              ['expense', 'income', 'investment'].includes(
                String(row['Type']).toLowerCase()
              )
                ? String(row['Type']).toLowerCase()
                : 'expense'
            ) as Transaction['type'];

            const tagsRaw = String(row['Tags'] ?? '').trim();
            const tags = tagsRaw ? tagsRaw.split(',').map((t) => t.trim()) : [];

            const now = new Date().toISOString();
            const id = `imported-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 9)}`;

            imported.push({
              id,
              type,
              amount: Number(row['Amount']) || 0,
              categoryId: category?.id ?? 'other',
              accountId: account.id,
              description: String(row['Description'] ?? '').trim(),
              date: String(row['Date'] ?? '').trim(),
              tags,
              createdAt: now,
              updatedAt: now,
            });
          });

          if (imported.length > 0) {
            importData({ transactions: imported });
          }

          resolve({
            success: true,
            imported: imported.length,
            errors,
          });
        } catch (err) {
          resolve({
            success: false,
            imported: 0,
            errors: [
              `Failed to parse file: ${err instanceof Error ? err.message : String(err)}`,
            ],
          });
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          imported: 0,
          errors: ['Failed to read the file.'],
        });
      };

      reader.readAsArrayBuffer(file);
    });
  }

  return { exportToExcel, importFromExcel };
}
