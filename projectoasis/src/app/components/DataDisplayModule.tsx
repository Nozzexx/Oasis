// src/app/components/DataDisplayModule.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { FileDown, Search } from 'lucide-react';
import { Select } from "@/components/ui/select";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TableData {
  columns: string[];
  rows: Record<string, any>[];
}

const DataDisplayModule = () => {
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableData, setTableData] = useState<TableData>({ columns: [], rows: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [filteredData, setFilteredData] = useState<Record<string, any>[]>([]);

  // Available tables in the database
  const availableTables = [
    { value: 'sat_cat', label: 'Satellite Catalog' },
    { value: 'gp', label: 'General Perturbations' },
    { value: 'neo_objects', label: 'Near Earth Objects' },
    { value: 'donki_solar_flare', label: 'Solar Flares' },
    { value: 'donki_cme', label: 'Coronal Mass Ejections' },
    { value: 'geostorm_kp_index', label: 'Geomagnetic Storms' }
  ];

  // Fetch table data when selection changes
  useEffect(() => {
    if (!selectedTable) return;
    
    const fetchTableData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/table-data?table=${selectedTable}`);
        if (!response.ok) throw new Error('Failed to fetch table data');
        
        const data = await response.json();
        if (!data.success) throw new Error(data.message);
        
        setTableData({
          columns: data.columns,
          rows: data.rows
        });
        setFilteredData(data.rows);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTableData();
  }, [selectedTable]);

  // Handle filtering
  useEffect(() => {
    if (!filter) {
      setFilteredData(tableData.rows);
      return;
    }

    const filtered = tableData.rows.filter(row =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(filter.toLowerCase())
      )
    );
    setFilteredData(filtered);
  }, [filter, tableData.rows]);

  // Export functions
  const exportData = async (format: 'csv' | 'json' | 'pdf') => {
    if (!selectedTable || filteredData.length === 0) return;
  
    try {
      switch (format) {
        case 'csv': {
          const headers = tableData.columns.join(',');
          const rows = filteredData.map(row =>
            tableData.columns.map(col => `"${row[col] || ''}"`).join(',')
          );
          const csv = [headers, ...rows].join('\n');
          downloadFile(csv, `${selectedTable}.csv`, 'text/csv');
          break;
        }
        case 'json': {
          const json = JSON.stringify(filteredData, null, 2);
          downloadFile(json, `${selectedTable}.json`, 'application/json');
          break;
        }
        case 'pdf': {
          const response = await fetch('/api/export-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              table: selectedTable,
              data: filteredData,
              columns: tableData.columns
            })
          });
  
          if (!response.ok) {
            throw new Error('Failed to generate PDF');
          }
  
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${selectedTable}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during export');
      console.error('Export error:', err);
    }
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Format column headers for better display
  const formatColumnHeader = (header: string) => {
    return header
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format cell content and handle long text
  const formatCellContent = (content: any) => {
    if (content === null || content === undefined) return '';
    
    // Format numbers
    if (typeof content === 'number') {
      if (Number.isInteger(content)) {
        return content.toString();
      }
      return Number(content).toFixed(2);
    }

    // Format dates
    if (content instanceof Date || !isNaN(Date.parse(content))) {
      try {
        return new Date(content).toLocaleDateString();
      } catch {
        return content;
      }
    }

    // Convert to string
    return String(content);
  };

  return (
    <div className="fixed-content-area"> {/* This class will be styled to maintain fixed dimensions */}
      {/* Header */}
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Data Display</h1>
          
          {selectedTable && (
            <DropdownMenu
              trigger={
                <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">
                  <FileDown className="w-4 h-4" />
                  Export Data
                </button>
              }
              items={[
                { label: 'Export as CSV', onClick: () => exportData('csv') },
                { label: 'Export as JSON', onClick: () => exportData('json') },
                { label: 'Export as PDF', onClick: () => exportData('pdf') },
              ]}
            />
          )}
        </div>
  
        <div className="mt-4 space-y-4">
          <div className="w-full max-w-xs">
            <Select
              options={availableTables}
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
            />
          </div>
  
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
  
          {selectedTable && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Filter data..."
                className="pl-10 p-2 rounded-lg bg-[#333] text-white w-full"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
  
      {/* Table Container */}
      {selectedTable && (
        <div className="px-6">
          <div className="border border-gray-700 rounded-lg bg-[#2c2c2c] overflow-hidden">
            {/* Table scroll container */}
            <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#1c1c1c]">
                    {tableData.columns.map((column) => (
                      <th 
                        key={column} 
                        className="p-3 text-left font-semibold text-sm whitespace-nowrap bg-[#1c1c1c]"
                      >
                        {formatColumnHeader(column)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={tableData.columns.length} className="text-center p-4">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Loading data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={tableData.columns.length} className="text-center p-4">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((row, idx) => (
                      <tr 
                        key={idx} 
                        className="hover:bg-[#333] transition-colors duration-150"
                      >
                        {tableData.columns.map((column) => (
                          <td 
                            key={column} 
                            className="p-3 text-sm whitespace-nowrap"
                            title={String(row[column] ?? '')}
                          >
                            {formatCellContent(row[column])}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-2 text-sm text-gray-400">
            Showing {filteredData.length} of {tableData.rows.length} records
          </div>
        </div>
      )}
    </div>
  );
  
};

export default DataDisplayModule;