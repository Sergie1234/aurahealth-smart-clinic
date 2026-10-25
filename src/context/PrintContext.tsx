import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Prescription, Invoice, LabTestOrder } from '../types/clinic';
import { triggerRealtimePrint } from '../utils/printDocument';

export type PrintableDocument =
  | { type: 'prescription'; data: Prescription }
  | { type: 'receipt'; data: Invoice }
  | { type: 'lab_report'; data: LabTestOrder };

export interface PrintContextType {
  activeDocument: PrintableDocument | null;
  isPrinting: boolean;
  printPrescription: (prescription: Prescription) => void;
  printReceipt: (invoice: Invoice) => void;
  printLabReport: (labOrder: LabTestOrder) => void;
  closePrint: () => void;
  triggerPrint: () => void;
}

const PrintContext = createContext<PrintContextType | undefined>(undefined);

export const PrintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeDocument, setActiveDocument] = useState<PrintableDocument | null>(null);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  const getDocTitle = useCallback((doc: PrintableDocument | null): string => {
    if (!doc) return 'SmartClinic-Document';
    switch (doc.type) {
      case 'prescription':
        return `SmartClinic-Prescription-${doc.data.prescriptionNumber}`;
      case 'receipt':
        return `SmartClinic-OfficialReceipt-${doc.data.invoiceNumber}`;
      case 'lab_report':
        return `SmartClinic-LabReport-${doc.data.orderNumber}`;
    }
  }, []);

  const triggerPrint = useCallback(() => {
    if (!activeDocument) return;
    setIsPrinting(true);
    const title = getDocTitle(activeDocument);
    triggerRealtimePrint({
      title,
      documentType: activeDocument.type,
    });
    // Reset printing state indicator after brief delay
    setTimeout(() => {
      setIsPrinting(false);
    }, 500);
  }, [activeDocument, getDocTitle]);

  const printPrescription = useCallback((prescription: Prescription) => {
    setActiveDocument({ type: 'prescription', data: prescription });
  }, []);

  const printReceipt = useCallback((invoice: Invoice) => {
    setActiveDocument({ type: 'receipt', data: invoice });
  }, []);

  const printLabReport = useCallback((labOrder: LabTestOrder) => {
    setActiveDocument({ type: 'lab_report', data: labOrder });
  }, []);

  const closePrint = useCallback(() => {
    setActiveDocument(null);
    setIsPrinting(false);
  }, []);

  const value = useMemo(
    () => ({
      activeDocument,
      isPrinting,
      printPrescription,
      printReceipt,
      printLabReport,
      closePrint,
      triggerPrint,
    }),
    [activeDocument, isPrinting, printPrescription, printReceipt, printLabReport, closePrint, triggerPrint]
  );

  return <PrintContext.Provider value={value}>{children}</PrintContext.Provider>;
};

export const usePrint = (): PrintContextType => {
  const context = useContext(PrintContext);
  if (!context) {
    throw new Error('usePrint must be used within a PrintProvider');
  }
  return context;
};
