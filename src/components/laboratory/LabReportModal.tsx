import React, { useEffect } from 'react';
import { LabTestOrder } from '../../types/clinic';
import { usePrint } from '../../context/PrintContext';

interface Props {
  order: LabTestOrder;
  onClose: () => void;
}

/**
 * Legacy LabReportModal adapter.
 * Delegates directly to the single global PrintContext implementation.
 */
export const LabReportModal: React.FC<Props> = ({ order, onClose }) => {
  const { printLabReport } = usePrint();

  useEffect(() => {
    printLabReport(order);
    onClose();
  }, [order, printLabReport, onClose]);

  return null;
};
