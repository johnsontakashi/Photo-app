import React, { useMemo, useState } from 'react';
import { PhotoData } from '@/types';

interface PhotoTableProps {
  photos: PhotoData[];
  loading?: boolean;
  onPhotoClick: (photo: PhotoData) => void;
}

const getStatusBadge = (status: PhotoData['status']) => {
  const statusConfig = {
    pending: { className: 'status-badge pending', label: 'Pending' },
    processing: { className: 'status-badge processing', label: 'Processing' },
    done: { className: 'status-badge done', label: 'Done' },
  };
  
  const config = statusConfig[status];
  return <span className={config.className}>{config.label}</span>;
};

export const PhotoTable: React.FC<PhotoTableProps> = ({
  photos,
  loading = false,
  onPhotoClick,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredPhotos = useMemo(() => {
    return photos.filter((photo) => {
      const matchesStatus = statusFilter === 'all' || statusFilter === photo.status;
      const matchesSearch = searchValue === '' || 
        photo.customerEmail.toLowerCase().includes(searchValue.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }, [photos, statusFilter, searchValue]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="glass-card p-8 text-center bounce-in">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="loading-spinner" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Loading Photos...</h3>
        <p className="text-white/70">Fetching latest uploads from the server</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="glass-card p-8 text-center bounce-in">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="40" height="40" fill="white" viewBox="0 0 24 24">
            <path d="M9 3L5 6.5V21h14V6.5L15 3z"/>
            <path d="M12 8a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">No Photos Yet</h3>
        <p className="text-white/70 mb-6 max-w-md mx-auto">
          Customer photo uploads will appear here once they start submitting photos through the upload portal.
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="gradient-button success"
        >
          📸 Go to Upload Portal
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="glass-card p-6 slide-up">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 max-w-md">
            <label className="block text-white font-semibold mb-2">Search Photos</label>
            <div className="relative">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="form-input pl-10"
                placeholder="Search by customer email..."
              />
              <svg 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" 
                width="16" 
                height="16" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3S3 5.91 3 9.5S5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14Z"/>
              </svg>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div>
              <label className="block text-white font-semibold mb-2">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-input min-w-[140px]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="done">Done</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchValue('');
                  setStatusFilter('all');
                }}
                className="gradient-button text-sm px-4 py-2"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Results Summary */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-white/70 text-sm">
            Showing {filteredPhotos.length} of {photos.length} photos
            {(searchValue || statusFilter !== 'all') && (
              <span className="text-white/90"> • Filtered results</span>
            )}
          </p>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="grid gap-6">
        {filteredPhotos.map((photo, index) => (
          <div
            key={photo.id}
            onClick={() => onPhotoClick(photo)}
            className="glass-card p-6 cursor-pointer transition-all hover:scale-[1.02] bounce-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center gap-6">
              {/* Photo Thumbnail */}
              <div className="photo-thumbnail w-20 h-20 flex-shrink-0">
                <img
                  src={photo.photoUrl}
                  alt={`Photo from ${photo.customerEmail}`}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              {/* Photo Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {photo.customerEmail}
                    </h3>
                    <p className="text-white/60 text-sm mt-1">
                      Uploaded {formatDate(photo.createdAt)}
                    </p>
                    <p className="text-white/50 text-xs mt-1">
                      ID: {photo.id}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(photo.status)}
                    <button className="gradient-button text-xs px-3 py-1">
                      View Details
                    </button>
                  </div>
                </div>

                {/* Progress Indicator for Processing */}
                {photo.status === 'processing' && (
                  <div className="mt-3">
                    <div className="progress-bar h-1">
                      <div className="progress-fill w-3/4" />
                    </div>
                    <p className="text-white/60 text-xs mt-1">Processing in progress...</p>
                  </div>
                )}

                {/* Success Message for Done */}
                {photo.status === 'done' && (
                  <div className="mt-3 flex items-center gap-2 text-green-300">
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                    </svg>
                    <span className="text-xs">Processing completed successfully</span>
                  </div>
                )}
              </div>

              {/* Arrow Icon */}
              <div className="text-white/40 transition-colors group-hover:text-white/60">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.59 16.59L10 18L16 12L10 6L8.59 7.41L13.17 12L8.59 16.59Z"/>
                </svg>
              </div>
            </div>
          </div>
        ))}

        {filteredPhotos.length === 0 && photos.length > 0 && (
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24" className="text-yellow-300">
                <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3S3 5.91 3 9.5S5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14Z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Matches Found</h3>
            <p className="text-white/70 mb-4">
              Try adjusting your search terms or filters to find what you&apos;re looking for.
            </p>
            <button
              onClick={() => {
                setSearchValue('');
                setStatusFilter('all');
              }}
              className="gradient-button"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};