import { useState, useEffect } from 'react';
import { Satellite, Filter, Search, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';

interface SatelliteData {
  satname: string;
  country: string;
  launch_date: string;
  period: number;
  inclination: number;
  current: boolean;
  rcs_value: string;
}

interface DashboardData {
  satelliteStatus: SatelliteData[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    currentPage: number;
    totalPages: number;
  };
  activeSatellites: {
    count: number;
    percentageChange: number;
  };
  decommissionedSatellites: {
    count: number;
  };
  operationalIssues: {
    count: number;
  };
}

const ITEMS_PER_PAGE = 13;

const SatelliteStatusModule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false); // New state for table loading
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ column: string; order: 'asc' | 'desc' | null }>({ column: '', order: null });

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setTableLoading(true);
        const offset = (currentPage - 1) * ITEMS_PER_PAGE;
        const searchParams = new URLSearchParams({
          limit: ITEMS_PER_PAGE.toString(),
          offset: offset.toString(),
          search: searchTerm,
          sortColumn: sortConfig.column,
          sortOrder: sortConfig.order || '',
        });
        
        const response = await fetch(`/api/dashboard?${searchParams.toString()}`);
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch data');
        }
        
        setData(result.data);
        setTotalPages(Math.ceil(result.data.totalCount / ITEMS_PER_PAGE));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setTableLoading(false); // Reset table loading after data fetch
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, searchTerm, sortConfig]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSort = (column: string) => {
    setSortConfig((prevConfig) => ({
      column,
      order: prevConfig.column === column && prevConfig.order === 'asc' ? 'desc' : 'asc',
    }));
    setCurrentPage(1); // Reset to the first page when sorting
  };

  const getSortIndicator = (column: string) => {
    if (sortConfig.column === column) {
      return sortConfig.order === 'asc' ? <ArrowUp className="inline-block ml-1 w-4 h-4" /> : <ArrowDown className="inline-block ml-1 w-4 h-4" />;
    }
    return null;
  };


  if (loading) {
    return <div className="p-6 text-white">Loading satellite data...</div>;
  }

  if (error || !data) {
    return <div className="p-6 text-red-400">Error loading satellite data: {error}</div>;
  }

  return (
    <div className="p-6 space-y-6 text-white">
      <h1 className="text-3xl font-bold">Satellite Status</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-[#2c2c2c] rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium text-white">Active Satellites</h2>
            <Satellite className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {data.activeSatellites.count} {/* Display the total count of active satellites */}
          </div>
        </div>

        <div className="bg-[#2c2c2c] rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium text-white">Decommissioned Satellites</h2>
            <Satellite className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {data.decommissionedSatellites.count}
          </div>
        </div>

        <div className="bg-[#2c2c2c] rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium text-white">Operational Issues</h2>
            <Filter className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {data.operationalIssues.count}
          </div>
        </div>
      </div>

      {/* Full-width Search Bar */}
      <div className="w-full relative">
        <input
          type="text"
          placeholder="Search satellites by name or country..."
          className="w-full bg-[#2c2c2c] border border-gray-700 rounded-md p-3 pl-10 text-white"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
      </div>

      {/* Detailed Table */}
      <div className="rounded-lg overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1c1c1c]">
            <tr>
                <th className="p-4 text-left text-white font-semibold cursor-pointer" onClick={() => handleSort('satname')}>
                  Name {getSortIndicator('satname')}
                </th>
                <th className="p-4 text-left text-white font-semibold cursor-pointer" onClick={() => handleSort('country')}>
                  Country {getSortIndicator('country')}
                </th>
                <th className="p-4 text-left text-white font-semibold cursor-pointer" onClick={() => handleSort('launch_date')}>
                  Launch Date {getSortIndicator('launch_date')}
                </th>
                <th className="p-4 text-left text-white font-semibold cursor-pointer" onClick={() => handleSort('period')}>
                  Period (min) {getSortIndicator('period')}
                </th>
                <th className="p-4 text-left text-white font-semibold cursor-pointer" onClick={() => handleSort('inclination')}>
                  Inclination {getSortIndicator('inclination')}
                </th>
                <th className="p-4 text-left text-white font-semibold cursor-pointer" onClick={() => handleSort('current')}>
                  Status {getSortIndicator('current')}
                </th>
              </tr>
            </thead>
            <tbody>
              {tableLoading ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-400">
                    Loading page data...
                  </td>
                </tr>
              ) : (
                data.satelliteStatus.map((sat) => (
                  <tr 
                    key={sat.satname} 
                    className="border-t border-gray-700 hover:bg-[#3c3c3c] transition-colors"
                  >
                    <td className="p-4">{sat.satname}</td>
                    <td className="p-4">{sat.country}</td>
                    <td className="p-4">{new Date(sat.launch_date).toLocaleDateString()}</td>
                    <td className="p-4">{sat.period ? sat.period.toFixed(1) : 'N/A'}</td>
                    <td className="p-4">{sat.inclination ? sat.inclination.toFixed(2) : 'N/A'}°</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        sat.current ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                      }`}>
                        {sat.current ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="bg-[#1c1c1c] px-4 py-3 border-t border-gray-700 flex items-center justify-between">
        <div className="flex items-center justify-between mt-4 p-2 text-sm text-gray-400">
              <div>
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, data.pagination.total)} of {data.pagination.total} satellites
              </div>
              <div>Page {currentPage} of {data.pagination.totalPages}</div>
        </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded ${currentPage === 1 ? 'text-gray-600' : 'text-white hover:bg-[#3c3c3c]'}`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = currentPage - 2 + i;
                if (pageNum > 0 && pageNum <= totalPages) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded ${
                        currentPage === pageNum 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-400 hover:bg-[#3c3c3c]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                return null;
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded ${currentPage === totalPages ? 'text-gray-600' : 'text-white hover:bg-[#3c3c3c]'}`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SatelliteStatusModule;
