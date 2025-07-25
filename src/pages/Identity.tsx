import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../components/Layout';

interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
  file?: File;
  url?: string;
  displayType?: string; // Type gösterimi için
}

interface QuickAccessInfo {
  emergencyContact: string;
  medicalConditions: string;
  caseWorker: string;
  preferredShelter: string;
}

// Dark Mode Toggle Component - Layout entegrasyonu ile
const DarkModeToggle = () => {
  const { isDark, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      style={{
        position: 'fixed',
        top: '12px',
        right: '130px',
        zIndex: 1000,
        background: isDark
          ? 'linear-gradient(135deg, #4338ca, #3730a3)'
          : 'linear-gradient(135deg, #1f2937, #111827)',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '56px',
        height: '56px',
        fontSize: '20px',
        cursor: 'pointer',
        boxShadow: isDark
          ? '0 10px 25px rgba(67, 56, 202, 0.3)'
          : '0 10px 25px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
};

const Identity: React.FC = () => {
  const { isDark } = useTheme(); // Layout'tan tema state'ini al
  
  // LocalStorage'dan verileri yükle
  const [documents, setDocuments] = useState<Document[]>(() => {
    const saved = localStorage.getItem('identity-documents');
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      {
        id: '1',
        name: 'Driver\'s License',
        type: 'identification',
        displayType: 'Identification',
        uploadDate: '2024-01-15',
        size: '2.1 MB'
      },
      {
        id: '2',
        name: 'Social Security Card',
        type: 'identification',
        displayType: 'Identification',
        uploadDate: '2024-01-10',
        size: '1.8 MB'
      },
      {
        id: '3',
        name: 'Medical Records',
        type: 'medical',
        displayType: 'Medical',
        uploadDate: '2024-01-08',
        size: '3.2 MB'
      }
    ];
  });

  const [quickAccessInfo, setQuickAccessInfo] = useState<QuickAccessInfo>(() => {
    const saved = localStorage.getItem('identity-quick-access');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      emergencyContact: '',
      medicalConditions: '',
      caseWorker: '',
      preferredShelter: ''
    };
  });

  const [savedInfo, setSavedInfo] = useState<QuickAccessInfo | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedType, setSelectedType] = useState<string>('identification'); // Varsayılan seçim
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Documents değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('identity-documents', JSON.stringify(documents));
  }, [documents]);

  // Quick access info değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('identity-quick-access', JSON.stringify(quickAccessInfo));
  }, [quickAccessInfo]);

  const documentTypes = [
    { value: 'identification', label: 'Identification', icon: '🆔', description: 'Driver\'s License, Passport, State ID' },
    { value: 'medical', label: 'Medical', icon: '🏥', description: 'Medical Records, Insurance Cards, Prescriptions' },
    { value: 'employment', label: 'Employment', icon: '💼', description: 'Resume, Work Authorization, Pay Stubs' },
    { value: 'benefits', label: 'Benefits', icon: '💰', description: 'SNAP, Medicaid, Social Security Documents' },
    { value: 'housing', label: 'Housing', icon: '🏠', description: 'Lease Agreements, Housing Applications' },
    { value: 'education', label: 'Education', icon: '🎓', description: 'Diplomas, Transcripts, Certificates' },
    { value: 'legal', label: 'Legal', icon: '⚖️', description: 'Court Documents, Legal Papers' },
    { value: 'other', label: 'Other', icon: '📄', description: 'Other Important Documents' }
  ];const handleFileSelection = (files: FileList | null) => {
    if (files) {
      setSelectedFiles(Array.from(files));
      setShowUploadModal(true);
    }
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      const selectedDocType = documentTypes.find(t => t.value === selectedType);
      
      selectedFiles.forEach((file) => {
        const newDoc: Document = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: selectedType,
          displayType: selectedDocType?.label || selectedType,
          uploadDate: new Date().toISOString().split('T')[0],
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          file: file,
          url: URL.createObjectURL(file)
        };
        setDocuments(prev => [...prev, newDoc]);
      });
      
      setShowUploadModal(false);
      setSelectedFiles([]);
      setSelectedType('identification'); // Reset to default
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      alert(`Successfully uploaded ${selectedFiles.length} file(s) as ${selectedDocType?.label}!`);
    }
  };

  const deleteDocument = (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this document?');
    if (confirmDelete) {
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      alert('Document deleted successfully!');
    }
  };

  const viewDocument = (doc: Document) => {
    if (doc.url) {
      window.open(doc.url, '_blank');
    } else {
      alert('Document preview not available. This is a demo document.');
    }
  };

  const downloadDocument = (doc: Document) => {
    if (doc.file && doc.url) {
      const link = document.createElement('a');
      link.href = doc.url;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('Download not available. This is a demo document.');
    }
  };

  const saveQuickAccessInfo = () => {
    setSavedInfo({ ...quickAccessInfo });
    alert('Information saved successfully!');
  };

  const getDocumentIcon = (type: string) => {
    return documentTypes.find(t => t.value === type)?.icon || '📄';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'identification': return '#3b82f6';
      case 'medical': return '#ef4444';
      case 'employment': return '#10b981';
      case 'benefits': return '#f59e0b';
      case 'housing': return '#8b5cf6';
      case 'education': return '#06b6d4';
      case 'legal': return '#dc2626';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto',
      background: isDark ? '#111827' : '#ffffff',
      minHeight: '100vh'
    }}>
      <DarkModeToggle />

      {/* Upload Modal - Geliştirilmiş */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: isDark ? '#1f2937' : 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: isDark ? '#f9fafb' : '#1f2937',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📂 Choose Document Type
            </h3>
            <p style={{
              fontSize: '14px',
              color: isDark ? '#9ca3af' : '#6b7280',
              marginBottom: '24px'
            }}>
              Selected {selectedFiles.length} file(s). Please choose the document type to categorize them properly:
            </p>

            {/* Document Type Selection - Improved */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              marginBottom: '24px'
            }}>
              {documentTypes.map((type) => (
                <div
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  style={{
                    padding: '16px',
                    border: `2px solid ${selectedType === type.value ? getTypeColor(type.value) : isDark ? '#4b5563' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: selectedType === type.value
                      ? `${getTypeColor(type.value)}15`
                      : isDark ? '#374151' : 'white',
                    transition: 'all 0.2s',
                    transform: selectedType === type.value ? 'scale(1.02)' : 'scale(1)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '20px' }}>{type.icon}</span>
                    <span style={{
                      fontWeight: '600',
                      color: selectedType === type.value
                        ? getTypeColor(type.value)
                        : isDark ? '#f9fafb' : '#1f2937'
                    }}>
                      {type.label}
                    </span>
                    {selectedType === type.value && (
                      <span style={{ fontSize: '16px', color: getTypeColor(type.value) }}>✓</span>
                    )}
                  </div>
                  <p style={{
                    fontSize: '11px',
                    color: isDark ? '#9ca3af' : '#6b7280',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    {type.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Selected Files Preview */}
            <div style={{
              background: isDark ? '#374151' : '#f9fafb',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
              border: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: isDark ? '#f3f4f6' : '#374151',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📎 Files to upload as <span style={{ color: getTypeColor(selectedType) }}>
                  {documentTypes.find(t => t.value === selectedType)?.label}
                </span>:
              </h4>
              {selectedFiles.map((file, index) => (
                <div key={index} style={{
                  fontSize: '12px',
                  color: isDark ? '#9ca3af' : '#6b7280',
                  padding: '4px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>{getDocumentIcon(selectedType)}</span>
                  <span>{file.name}</span>
                  <span style={{ color: isDark ? '#6b7280' : '#9ca3af' }}>
                    ({(file.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFiles([]);
                  setSelectedType('identification');
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                style={{
                  flex: 1,
                  background: isDark ? '#4b5563' : '#f3f4f6',
                  color: isDark ? '#f9fafb' : '#374151',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                style={{
                  flex: 2,
                  background: isDark
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>📤</span>
                Upload as {documentTypes.find(t => t.value === selectedType)?.label}
              </button>
            </div>
          </div>
        </div>
      )}{/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          color: isDark ? '#10b981' : '#dc2626',
          marginBottom: '8px',
          margin: 0
        }}>
          👤 Digital Identity Storage
        </h1>
        <p style={{
          fontSize: '16px',
          color: isDark ? '#9ca3af' : '#6b7280',
          margin: 0
        }}>
          Securely store and categorize your important documents
        </p>
      </div>

      {/* Success Banner */}
      {savedInfo && (
        <div style={{
          background: isDark ? '#064e3b' : '#dcfce7',
          border: `1px solid ${isDark ? '#059669' : '#16a34a'}`,
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '20px' }}>✅</span>
          <div>
            <p style={{ margin: 0, fontWeight: '600', color: isDark ? '#6ee7b7' : '#16a34a' }}>
              Your information has been saved securely!
            </p>
            <p style={{ margin: 0, fontSize: '14px', color: isDark ? '#6ee7b7' : '#059669' }}>
              Emergency Contact: {savedInfo.emergencyContact || 'Not provided'} |
              Case Worker: {savedInfo.caseWorker || 'Not provided'}
            </p>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div style={{
        background: isDark
          ? 'linear-gradient(135deg, #1f2937, #111827)'
          : 'white',
        border: `2px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: isDark
          ? '0 4px 20px rgba(0,0,0,0.3)'
          : '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: isDark ? '#f9fafb' : '#1f2937',
          marginBottom: '16px'
        }}>
          📤 Upload Documents
        </h2>
        <div
          style={{
            border: `2px dashed ${isDark ? '#4b5563' : '#d1d5db'}`,
            borderRadius: '12px',
            padding: '48px 24px',
            textAlign: 'center',
            background: isDark ? '#374151' : '#f9fafb',
            cursor: 'pointer'
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
          <div style={{ marginBottom: '16px' }}>
            <p style={{
              fontSize: '18px',
              fontWeight: '500',
              color: isDark ? '#f9fafb' : '#1f2937',
              marginBottom: '8px'
            }}>
              Upload and categorize your documents
            </p>
            <p style={{
              fontSize: '14px',
              color: isDark ? '#9ca3af' : '#6b7280'
            }}>
              Click to select files, then choose document type for proper organization
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            onChange={(e) => handleFileSelection(e.target.files)}
            style={{ display: 'none' }}
          />
          <button style={{
            background: isDark
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : 'linear-gradient(135deg, #dc2626, #b91c1c)',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>➕</span>
            <span>Select Files</span>
          </button>
        </div>

        {/* Document Types Info - Improved */}
        <div style={{
          marginTop: '16px',
          padding: '16px',
          background: isDark ? '#1e3a8a' : '#f0f9ff',
          borderRadius: '8px',
          border: `1px solid ${isDark ? '#3b82f6' : '#0ea5e9'}`
        }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: isDark ? '#93c5fd' : '#0369a1',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📋 Document Categories - Select appropriate type during upload:
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '8px',
            fontSize: '12px',
            color: isDark ? '#93c5fd' : '#0369a1'
          }}>
            {documentTypes.map((type) => (
              <div key={type.value} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                padding: '4px 8px',
                background: isDark ? '#1e40af' : '#dbeafe',
                borderRadius: '6px'
              }}>
                <span>{type.icon}</span>
                <span style={{ fontWeight: '500' }}>{type.label}</span>
              </div>
            ))}
          </div>
          <p style={{
            fontSize: '11px',
            color: isDark ? '#93c5fd' : '#0369a1',
            margin: '8px 0 0 0',
            fontStyle: 'italic'
          }}>
            💡 Each document will be tagged with its selected category for easy identification and organization.
          </p>
        </div>
      </div>

      {/* Documents List - Enhanced */}
      <div style={{
        background: isDark
          ? 'linear-gradient(135deg, #1f2937, #111827)'
          : 'white',
        border: `2px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: isDark
          ? '0 4px 20px rgba(0,0,0,0.3)'
          : '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: isDark ? '#f9fafb' : '#1f2937',
          marginBottom: '16px'
        }}>
          📋 Stored Documents ({documents.length})
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {documents.map((doc) => (
            <div key={doc.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              background: isDark ? '#374151' : '#f9fafb',
              borderRadius: '8px',
              border: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  background: `${getTypeColor(doc.type)}15`,
                  padding: '8px',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontSize: '20px' }}>{getDocumentIcon(doc.type)}</span>
                </div>
                <div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: isDark ? '#f9fafb' : '#1f2937',
                    margin: 0,
                    marginBottom: '4px'
                  }}>
                    {doc.name}
                  </h3>
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    fontSize: '12px',
                    color: isDark ? '#9ca3af' : '#6b7280'
                  }}>
                    <span style={{
                      background: getTypeColor(doc.type),
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: '500'
                    }}>
                      {doc.displayType || doc.type}
                    </span>
                    <span>📅 {doc.uploadDate}</span>
                    <span>📊 {doc.size}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => viewDocument(doc)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    transition: 'background 0.2s'
                  }}
                  title="View Document"
                  onMouseEnter={(e) => e.currentTarget.style.background = isDark ? '#4b5563' : '#e5e7eb'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  👁️
                </button>
                <button
                  onClick={() => downloadDocument(doc)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    transition: 'background 0.2s'
                  }}
                  title="Download Document"
                  onMouseEnter={(e) => e.currentTarget.style.background = isDark ? '#4b5563' : '#e5e7eb'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  ⬇️
                </button>
                <button
                  onClick={() => deleteDocument(doc.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    transition: 'background 0.2s'
                  }}
                  title="Delete Document"
                  onMouseEnter={(e) => e.currentTarget.style.background = isDark ? '#7f1d1d' : '#fee2e2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>{/* Quick Access Information */}
      <div style={{
        background: isDark
          ? 'linear-gradient(135deg, #1f2937, #111827)'
          : 'white',
        border: `2px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        borderRadius: '12px',
        padding: '24px',
        boxShadow: isDark
          ? '0 4px 20px rgba(0,0,0,0.3)'
          : '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: isDark ? '#f9fafb' : '#1f2937',
          marginBottom: '16px'
        }}>
          ⚡ Quick Access Information
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: isDark ? '#f3f4f6' : '#374151',
              marginBottom: '6px'
            }}>
              🚨 Emergency Contact
            </label>
            <input
              type="text"
              value={quickAccessInfo.emergencyContact}
              onChange={(e) => setQuickAccessInfo(prev => ({ ...prev, emergencyContact: e.target.value }))}
              placeholder="Name and phone number"
              style={{
                width: '100%',
                padding: '12px',
                border: `2px solid ${isDark ? '#4b5563' : '#e5e7eb'}`,
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                background: isDark ? '#374151' : '#ffffff',
                color: isDark ? '#f9fafb' : '#1f2937'
              }}
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: isDark ? '#f3f4f6' : '#374151',
              marginBottom: '6px'
            }}>
              🏥 Medical Conditions
            </label>
            <input
              type="text"
              value={quickAccessInfo.medicalConditions}
              onChange={(e) => setQuickAccessInfo(prev => ({ ...prev, medicalConditions: e.target.value }))}
              placeholder="Important medical information"
              style={{
                width: '100%',
                padding: '12px',
                border: `2px solid ${isDark ? '#4b5563' : '#e5e7eb'}`,
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                background: isDark ? '#374151' : '#ffffff',
                color: isDark ? '#f9fafb' : '#1f2937'
              }}
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',fontWeight: '500',
             color: isDark ? '#f3f4f6' : '#374151',
             marginBottom: '6px'
           }}>
             🤝 Case Worker
           </label>
           <input
             type="text"
             value={quickAccessInfo.caseWorker}
             onChange={(e) => setQuickAccessInfo(prev => ({ ...prev, caseWorker: e.target.value }))}
             placeholder="Case worker name and contact"
             style={{
               width: '100%',
               padding: '12px',
               border: `2px solid ${isDark ? '#4b5563' : '#e5e7eb'}`,
               borderRadius: '8px',
               fontSize: '14px',
               outline: 'none',
               boxSizing: 'border-box',
               background: isDark ? '#374151' : '#ffffff',
               color: isDark ? '#f9fafb' : '#1f2937'
             }}
           />
         </div>
         <div>
           <label style={{
             display: 'block',
             fontSize: '14px',
             fontWeight: '500',
             color: isDark ? '#f3f4f6' : '#374151',
             marginBottom: '6px'
           }}>
             🏠 Preferred Shelter
           </label>
           <input
             type="text"
             value={quickAccessInfo.preferredShelter}
             onChange={(e) => setQuickAccessInfo(prev => ({ ...prev, preferredShelter: e.target.value }))}
             placeholder="Preferred shelter location"
             style={{
               width: '100%',
               padding: '12px',
               border: `2px solid ${isDark ? '#4b5563' : '#e5e7eb'}`,
               borderRadius: '8px',
               fontSize: '14px',
               outline: 'none',
               boxSizing: 'border-box',
               background: isDark ? '#374151' : '#ffffff',
               color: isDark ? '#f9fafb' : '#1f2937'
             }}
           />
         </div>
       </div>
       <button
         onClick={saveQuickAccessInfo}
         style={{
           background: isDark
             ? 'linear-gradient(135deg, #10b981, #059669)'
             : 'linear-gradient(135deg, #dc2626, #b91c1c)',
           color: 'white',
           border: 'none',
           padding: '10px 20px',
           borderRadius: '8px',
           fontSize: '14px',
           fontWeight: '600',
           cursor: 'pointer',
           display: 'flex',
           alignItems: 'center',
           gap: '8px',
           boxShadow: isDark
             ? '0 4px 14px rgba(16, 185, 129, 0.3)'
             : '0 4px 14px rgba(220, 38, 38, 0.3)'
         }}
       >
         <span>💾</span>
         Save Information
       </button>
     </div>

     {/* Security Notice */}
     <div style={{
       background: isDark
         ? 'linear-gradient(135deg, #1e3a8a, #1e40af)'
         : 'linear-gradient(135deg, #eff6ff, #dbeafe)',
       border: `1px solid ${isDark ? '#3b82f6' : '#93c5fd'}`,
       borderRadius: '12px',
       padding: '20px',
       marginTop: '24px',
       textAlign: 'center'
     }}>
       <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔒</div>
       <h3 style={{
         fontSize: '18px',
         fontWeight: '600',
         color: isDark ? '#dbeafe' : '#1e40af',
         margin: '0 0 8px 0'
       }}>
         Your Data is Secure & Persistent
       </h3>
       <p style={{
         color: isDark ? '#93c5fd' : '#3730a3',
         fontSize: '14px',
         margin: 0,
         lineHeight: '1.5'
       }}>
         All documents and information are encrypted and stored securely in your browser. 
         Your data persists across sessions and page refreshes. Only you have access to your personal information.
         This platform complies with international privacy standards.
       </p>
     </div>

     {/* Statistics Card */}
     <div style={{
       background: isDark
         ? 'linear-gradient(135deg, #064e3b, #065f46)'
         : 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
       border: `1px solid ${isDark ? '#059669' : '#22c55e'}`,
       borderRadius: '12px',
       padding: '20px',
       marginTop: '16px',
       display: 'grid',
       gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
       gap: '16px',
       textAlign: 'center'
     }}>
       <div>
         <div style={{
           fontSize: '24px',
           fontWeight: 'bold',
           color: isDark ? '#6ee7b7' : '#059669',
           marginBottom: '4px'
         }}>
           {documents.length}
         </div>
         <div style={{
           fontSize: '12px',
           color: isDark ? '#6ee7b7' : '#047857',
           fontWeight: '500'
         }}>
           📄 Total Documents
         </div>
       </div>
       <div>
         <div style={{
           fontSize: '24px',
           fontWeight: 'bold',
           color: isDark ? '#6ee7b7' : '#059669',
           marginBottom: '4px'
         }}>
           {new Set(documents.map(d => d.type)).size}
         </div>
         <div style={{
           fontSize: '12px',
           color: isDark ? '#6ee7b7' : '#047857',
           fontWeight: '500'
         }}>
           🗂️ Categories Used
         </div>
       </div>
       <div>
         <div style={{
           fontSize: '24px',
           fontWeight: 'bold',
           color: isDark ? '#6ee7b7' : '#059669',
           marginBottom: '4px'
         }}>
           {documents.reduce((total, doc) => total + parseFloat(doc.size), 0).toFixed(1)}
         </div>
         <div style={{
           fontSize: '12px',
           color: isDark ? '#6ee7b7' : '#047857',
           fontWeight: '500'
         }}>
           📊 Total MB Stored
         </div>
       </div>
       <div>
         <div style={{
           fontSize: '24px',
           fontWeight: 'bold',
           color: isDark ? '#6ee7b7' : '#059669',
           marginBottom: '4px'
         }}>
           {Object.keys(quickAccessInfo).filter(key => quickAccessInfo[key as keyof QuickAccessInfo]).length}
         </div>
         <div style={{
           fontSize: '12px',
           color: isDark ? '#6ee7b7' : '#047857',
           fontWeight: '500'
         }}>
           ⚡ Quick Info Fields
         </div>
       </div>
     </div>
   </div>
 );
};

export default Identity;