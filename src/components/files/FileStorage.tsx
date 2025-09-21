"use client"

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { 
  Cloud, 
  Upload, 
  Download, 
  Share2, 
  Trash2, 
  Search,
  File,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  Folder,
  MoreVertical,
  Eye,
  Link
} from 'lucide-react'
import { format } from 'date-fns'
import { formatBytes } from '@/lib/utils'

interface FileItem {
  id: string
  userId: string
  fileName: string
  originalName: string
  filePath: string
  fileSize: number
  mimeType: string
  category: string
  isPublic: boolean
  isShared: boolean
  downloadCount: number
  description?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    profileImage?: string
  }
  shares: Array<{
    id: string
    sharedType: string
    permission: string
    expiresAt?: string
    user: {
      id: string
      name: string
      email: string
      profileImage?: string
    }
  }>
}

interface StorageQuota {
  maxStorage: number
  usedStorage: number
  availableStorage: number
  usagePercentage: number
}

export default function FileStorage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [files, setFiles] = useState<FileItem[]>([])
  const [storageQuota, setStorageQuota] = useState<StorageQuota | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [uploadData, setUploadData] = useState({
    category: 'general',
    isPublic: false,
    description: '',
    tags: [] as string[],
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchFiles()
    }
  }, [session, selectedCategory])

  const fetchFiles = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/files?category=${selectedCategory}`)
      if (response.ok) {
        const data = await response.json()
        setFiles(data.files)
        setStorageQuota(data.storageQuota)
      }
    } catch (error) {
      console.error('Failed to fetch files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('metadata', JSON.stringify(uploadData))

      const response = await fetch('/api/files?action=upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        fetchFiles()
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    } catch (error) {
      console.error('Failed to upload file:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const response = await fetch(`/api/files?id=${fileId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchFiles()
        if (selectedFile?.id === fileId) {
          setSelectedFile(null)
        }
      }
    } catch (error) {
      console.error('Failed to delete file:', error)
    }
  }

  const handleShareFile = async (fileId: string) => {
    try {
      const response = await fetch('/api/files?action=share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId,
          sharedType: 'link',
          permission: 'view',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Copy share link to clipboard
        navigator.clipboard.writeText(`${window.location.origin}/api/files?action=download&id=${fileId}`)
        alert('Share link copied to clipboard!')
        fetchFiles()
      }
    } catch (error) {
      console.error('Failed to share file:', error)
    }
  }

  const handleDownloadFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files?action=download&id=${fileId}`)
      if (response.ok) {
        const data = await response.json()
        // Create download link
        const link = document.createElement('a')
        link.href = data.fileUrl
        link.download = data.fileName
        link.click()
      }
    } catch (error) {
      console.error('Failed to download file:', error)
    }
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <FileImage className="h-8 w-8 text-blue-500" />
    if (mimeType.startsWith('video/')) return <FileVideo className="h-8 w-8 text-green-500" />
    if (mimeType.startsWith('audio/')) return <FileAudio className="h-8 w-8 text-purple-500" />
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
      return <FileText className="h-8 w-8 text-red-500" />
    }
    return <File className="h-8 w-8 text-gray-500" />
  }

  const filteredFiles = files.filter(file =>
    file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const categories = [
    { id: 'all', name: 'All Files', icon: Folder },
    { id: 'general', name: 'General', icon: File },
    { id: 'academic', name: 'Academic', icon: FileText },
    { id: 'assignment', name: 'Assignments', icon: FileText },
    { id: 'project', name: 'Projects', icon: Folder },
    { id: 'certificate', name: 'Certificates', icon: FileText },
  ]

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Storage Quota */}
          {storageQuota && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5" />
                  Storage Quota
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Used: {formatBytes(storageQuota.usedStorage)}</span>
                    <span>Total: {formatBytes(storageQuota.maxStorage)}</span>
                  </div>
                  <Progress value={storageQuota.usagePercentage} className="h-2" />
                  <div className="text-xs text-gray-600">
                    {storageQuota.usagePercentage}% used
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Upload File</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Choose File'}
              </Button>
              
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={uploadData.category}
                  onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="general">General</option>
                  <option value="academic">Academic</option>
                  <option value="assignment">Assignment</option>
                  <option value="project">Project</option>
                  <option value="certificate">Certificate</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input
                  placeholder="File description..."
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={uploadData.isPublic}
                  onChange={(e) => setUploadData({ ...uploadData, isPublic: e.target.checked })}
                />
                <label htmlFor="isPublic" className="text-sm">Make public</label>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[300px]">
                {categories.map((category) => {
                  const Icon = category.icon
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors ${
                        selectedCategory === category.id ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{category.name}</span>
                    </button>
                  )
                })}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* File List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-12rem)]">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredFiles.map((file) => (
                      <div
                        key={file.id}
                        onClick={() => setSelectedFile(file)}
                        className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedFile?.id === file.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {getFileIcon(file.mimeType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium truncate">{file.originalName}</span>
                              <div className="flex items-center gap-1">
                                {file.isPublic && (
                                  <Badge variant="secondary" className="text-xs">
                                    Public
                                  </Badge>
                                )}
                                {file.isShared && (
                                  <Badge variant="outline" className="text-xs">
                                    Shared
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 mb-1">
                              {formatBytes(file.fileSize)} • {file.category}
                            </div>
                            {file.description && (
                              <div className="text-sm text-gray-500 truncate">
                                {file.description}
                              </div>
                            )}
                            <div className="text-xs text-gray-400">
                              {format(new Date(file.createdAt), 'MMM d, yyyy')} • {file.downloadCount} downloads
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* File Details */}
        <div className="lg:col-span-1">
          {selectedFile ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">File Details</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadFile(selectedFile.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShareFile(selectedFile.id)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFile(selectedFile.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center">
                  {getFileIcon(selectedFile.mimeType)}
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Name</h3>
                  <p className="text-sm text-gray-600">{selectedFile.originalName}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Size</h3>
                  <p className="text-sm text-gray-600">{formatBytes(selectedFile.fileSize)}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Type</h3>
                  <p className="text-sm text-gray-600">{selectedFile.mimeType}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Category</h3>
                  <Badge variant="outline">{selectedFile.category}</Badge>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Uploaded</h3>
                  <p className="text-sm text-gray-600">
                    {format(new Date(selectedFile.createdAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Downloads</h3>
                  <p className="text-sm text-gray-600">{selectedFile.downloadCount}</p>
                </div>

                {selectedFile.description && (
                  <div>
                    <h3 className="font-medium mb-1">Description</h3>
                    <p className="text-sm text-gray-600">{selectedFile.description}</p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="font-medium">Visibility:</span>
                  {selectedFile.isPublic ? (
                    <Badge variant="secondary">Public</Badge>
                  ) : (
                    <Badge variant="outline">Private</Badge>
                  )}
                </div>

                {selectedFile.isShared && selectedFile.shares.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Shared With</h3>
                    <div className="space-y-1">
                      {selectedFile.shares.map((share) => (
                        <div key={share.id} className="flex items-center justify-between text-sm">
                          <span>{share.sharedType === 'link' ? 'Public Link' : share.user.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {share.permission}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent>
                <div className="text-center text-gray-500">
                  <File className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a file to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}