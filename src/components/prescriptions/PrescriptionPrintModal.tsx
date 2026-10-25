import React, { useEffect } from 'react';
import { Prescription } from '../../types/clinic';
import { usePrint } from '../../context/PrintContext';

interface Props {
  prescription: Prescription;
  onClose: () => void;
}

/**
 * Legacy PrescriptionPrintModal adapter.
 * Delegates directly to the single global PrintContext implementation.
 */
export const PrescriptionPrintModal: React.FC<Props> = ({ prescription, onClose }) => {
  const { printPrescription } = usePrint();

  useEffect(() => {
    printPrescription(prescription);
    onClose();
  }, [prescription, printPrescription, onClose]);

  return null;
};
