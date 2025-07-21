
import React from 'react';
import { FiDownload } from 'react-icons/fi';
import Button from '../../Button.tsx';

interface ReportHeaderProps {
  title: string;
  onExport: (format: 'pdf' | 'excel') => void;
  isExporting: boolean;
  children?: React.ReactNode;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({ title, onExport, isExporting, children }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h2>
      <div className="bg-gray-50 dark:bg-brand-dark p-4 rounded-lg flex flex-wrap items-center gap-4 border border-gray-200 dark:border-gray-700">
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {children}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onExport('pdf')}
            disabled={isExporting}
            title="Export as PDF"
          >
            <FiDownload className="mr-2" /> PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => onExport('excel')}
            disabled={isExporting}
            title="Export as Excel"
          >
            <FiDownload className="mr-2" /> Excel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportHeader;
