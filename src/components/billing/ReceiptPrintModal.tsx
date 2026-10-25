import React, { useEffect } from 'react';
import { Invoice } from '../../types/clinic';
import { usePrint } from '../../context/PrintContext';

interface Props {
  invoice: Invoice;
  onClose: () => void;
}

/**
 * Legacy ReceiptPrintModal adapter.
 * Delegates directly to the single global PrintContext implementation.
 */
export const ReceiptPrintModal: React.FC<Props> = ({ invoice, onClose }) => {
  const { printReceipt } = usePrint();

  useEffect(() => {
    printReceipt(invoice);
    onClose();
  }, [invoice, printReceipt, onClose]);

  return null;
};
