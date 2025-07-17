export const CandidatesPage: React.FC = () => {
   const { addNotification } = useNotification();
   const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
   const [showModal, setShowModal] = useState(false);
   const [showUploadModal, setShowUploadModal] = useState(false);
   const [modalCandidate, setModalCandidate] = useState<any>(null);
   const [searchTerm, setSearchTerm] = useState('');
   const [showFilters, setShowFilters] = useState(false);
   const [candidates, setCandidates] = useState([]);

   return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Candidates</h1>
          <p className="text-gray-600">Manage feedback for rejected candidates</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="neumorphic-btn-primary px-6 py-3 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Candidate</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="neumorphic-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
          <div className="flex-1 neumorphic-search px-4 py-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidates by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-6 w-full bg-transparent border-0 outline-none text-gray-700 placeholder-gray-500"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="w-full sm:w-auto neumorphic-btn px-4 py-3 flex items-center justify-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
          <button 
            onClick={handleExport}
            className="w-full sm:w-auto neumorphic-btn px-4 py-3 flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCandidates.length > 0 && (
        <div className="neumorphic-card"><BulkActions 
          selectedCount={selectedCandidates.length}
          onClear={() => setSelectedCandidates([])}
          onSendFeedback={handleSendFeedback}
          onEditTemplates={handleEditTemplates}
          onExport={handleExport}
        /></div>
      )}

      {/* Candidates Table */}
      <div className="neumorphic-table">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full">
            <thead className="neumorphic-table-header">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCandidates.length === candidates.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded shadow-neumorphic-sm"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Rejection Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-shadow/20">
              {candidates.map((candidate) => (
                <tr key={candidate.id} className="neumorphic-table-row">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedCandidates.includes(candidate.id)}
                      onChange={() => handleSelectCandidate(candidate.id)}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded shadow-neumorphic-sm"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{candidate.name}</div>
                      <div className="text-sm text-gray-500">{candidate.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {candidate.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {candidate.rejectionStage}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`neumorphic-badge text-xs font-semibold ${getStatusColor(candidate.status)}`}>
                      {candidate.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    <div className="flex space-x-4">
                      <span>Opens: {candidate.openRate}</span>
                      <span>Clicks: {candidate.clickRate}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewCandidate(candidate)}
                        className="neumorphic-btn p-2 text-primary-600 hover:text-primary-800"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="neumorphic-btn p-2 text-green-600 hover:text-green-800">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="neumorphic-btn p-2 text-purple-600 hover:text-purple-800">
                        <Send className="w-4 h-4" />
                      </button>
                      <button className="neumorphic-btn p-2 text-gray-600 hover:text-gray-800">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="neumorphic-card p-4 flex items-center justify-between">
        <div className="text-sm font-medium text-gray-700">
          Showing 1 to 5 of 2,847 candidates
        </div>
        <div className="flex items-center space-x-2">
          <button className="neumorphic-btn px-3 py-2 text-sm">Previous</button>
          <button className="neumorphic-btn-primary px-3 py-2 text-sm">1</button>
          <button className="neumorphic-btn px-3 py-2 text-sm">2</button>
          <button className="neumorphic-btn px-3 py-2 text-sm">3</button>
          <button className="neumorphic-btn px-3 py-2 text-sm">Next</button>
        </div>
      </div>
    </div>
  );
}