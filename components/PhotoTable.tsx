import React, { useMemo, useState } from 'react';
import { PhotoData } from '@/types';

interface PhotoTableProps {
  photos: PhotoData[];
  loading?: boolean;
  onPhotoClick: (photo: PhotoData) => void;
}

const getStatusBadge = (status: PhotoData['status']) => {
  const statusConfig = {
    pending: { className: 'badge badge-warning', label: 'Pending' },
    processing: { className: 'badge badge-info', label: 'Processing' },
    done: { className: 'badge badge-success', label: 'Done' },
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
      <div className="card text-center bounce-in">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-lg">
          <div className="loading-spinner" />
        </div>
        <h3 className="heading-4 text-primary mb-sm">Loading Photos...</h3>
        <p className="text-secondary">Fetching latest uploads from the server</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="card text-center bounce-in">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-3xl flex items-center justify-center mx-auto mb-xl">
          <svg width="40" height="40" fill="white" viewBox="0 0 24 24">
            <path d="M9 3L5 6.5V21h14V6.5L15 3z"/>
            <path d="M12 8a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
          </svg>
        </div>
        <h3 className="heading-3 text-primary mb-md">No Photos Yet</h3>
        <p className="text-secondary mb-xl max-w-md mx-auto leading-relaxed">
          Customer photo uploads will appear here once they start submitting photos through the upload portal.
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="btn btn-secondary"
        >
          📸 Go to Upload Portal
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-xl">
      {/* Search and Filters */}
      <div className="card slide-up">
        <div className="flex flex-col md:flex-row gap-lg items-start md:items-center justify-between">
          <div className="flex-1 max-w-md">
            <label className="block text-primary font-semibold mb-sm">Search Photos</label>
            <div className="relative">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="input pl-10"
                placeholder="Search by customer email..."
              />
              <svg 
                className="absolute left-md top-1/2 transform -translate-y-1/2 text-muted" 
                width="16" 
                height="16" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3S3 5.91 3 9.5S5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14Z"/>
              </svg>
            </div>
          </div>
          
          <div className="flex gap-md">
            <div>
              <label className="block text-primary font-semibold mb-sm">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input min-w-[140px]"
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
                className="btn btn-outline btn-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Results Summary */}
        <div className="mt-lg pt-lg border-t border-glass-border">
          <p className="text-secondary text-small">
            Showing {filteredPhotos.length} of {photos.length} photos
            {(searchValue || statusFilter !== 'all') && (
              <span className="text-primary"> • Filtered results</span>
            )}
          </p>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="grid gap-xl">
        {filteredPhotos.map((photo, index) => (
          <div
            key={photo.id}
            onClick={() => onPhotoClick(photo)}
            className="card cursor-pointer transition-all hover:scale-[1.02] bounce-in group"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center gap-xl">
              {/* Photo Thumbnail */}
              <div className="w-20 h-20 flex-shrink-0">
                <img
                  src={photo.photoUrl}
                  alt={`Photo from ${photo.customerEmail}`}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              {/* Photo Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-lg">
                  <div className="flex-1 min-w-0">
                    <h3 className="heading-5 text-primary truncate">
                      {photo.customerEmail}
                    </h3>
                    <p className="text-secondary text-small mt-xs">
                      Uploaded {formatDate(photo.createdAt)}
                    </p>
                    <p className="text-muted text-xs mt-xs">
                      ID: {photo.id}
                    </p>
                  </div>

                  <div className="flex items-center gap-md">
                    {getStatusBadge(photo.status)}
                    <button className="btn btn-outline btn-sm">
                      View Details
                    </button>
                  </div>
                </div>

                {/* Progress Indicator for Processing */}
                {photo.status === 'processing' && (
                  <div className="mt-md">
                    <div className="progress-bar h-1 mb-xs">
                      <div className="progress-fill w-3/4" />
                    </div>
                    <p className="text-secondary text-xs">Processing in progress...</p>
                  </div>
                )}

                {/* Success Message for Done */}
                {photo.status === 'done' && (
                  <div className="mt-md flex items-center gap-sm text-emerald-300">
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                    </svg>
                    <span className="text-xs">Processing completed successfully</span>
                  </div>
                )}
              </div>

              {/* Arrow Icon */}
              <div className="text-muted transition-colors group-hover:text-secondary">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.59 16.59L10 18L16 12L10 6L8.59 7.41L13.17 12L8.59 16.59Z"/>
                </svg>
              </div>
            </div>
          </div>
        ))}

        {filteredPhotos.length === 0 && photos.length > 0 && (
          <div className="card text-center">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-lg">
              <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24" className="text-yellow-300">
                <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3S3 5.91 3 9.5S5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14Z"/>
              </svg>
            </div>
            <h3 className="heading-4 text-primary mb-sm">No Matches Found</h3>
            <p className="text-secondary mb-lg">
              Try adjusting your search terms or filters to find what you&apos;re looking for.
            </p>
            <button
              onClick={() => {
                setSearchValue('');
                setStatusFilter('all');
              }}
              className="btn btn-primary"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};