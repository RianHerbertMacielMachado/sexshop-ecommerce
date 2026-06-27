'use client'

import { useRef, useState, useCallback } from 'react'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'
import { ImageIcon, Loader2, Link2, Upload, X, Star } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

type Tab = 'upload' | 'url'

export default function ImageUploader({ images, onChange, maxImages = 10 }: ImageUploaderProps) {
  const [activeTab, setActiveTab] = useState<Tab>('upload')
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const urlInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const addUrls = useCallback((newUrls: string[]) => {
    const filtered = newUrls.filter((u) => u.trim() && !images.includes(u.trim()))
    if (!filtered.length) return
    const slots = maxImages - images.length
    if (slots <= 0) {
      toast.error(`Máximo de ${maxImages} imagens atingido.`)
      return
    }
    onChange([...images, ...filtered.slice(0, slots)])
  }, [images, maxImages, onChange])

  const uploadFiles = useCallback(async (files: File[]) => {
    if (!files.length) return
    const slots = maxImages - images.length
    if (slots <= 0) {
      toast.error(`Máximo de ${maxImages} imagens atingido.`)
      return
    }

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    const valid = files.filter((f) => {
      if (!allowed.includes(f.type)) {
        toast.error(`${f.name}: tipo não suportado. Use JPG, PNG ou WebP.`)
        return false
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name}: tamanho máximo é 5 MB.`)
        return false
      }
      return true
    }).slice(0, slots)

    if (!valid.length) return

    setUploading(true)
    const toastId = toast.loading(`Enviando ${valid.length} imagem${valid.length > 1 ? 'ns' : ''}...`)

    try {
      const formData = new FormData()
      valid.forEach((f) => formData.append('images', f))
      const { data } = await api.post('/products/upload-temp', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const urls: string[] = data.data.urls
      onChange([...images, ...urls])
      toast.success(`${urls.length} imagem${urls.length > 1 ? 'ns adicionadas' : ' adicionada'}!`, { id: toastId })
    } catch {
      toast.error('Erro ao fazer upload. Tente novamente.', { id: toastId })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [images, maxImages, onChange])

  // ── Handlers de arquivo ───────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    uploadFiles(files)
  }

  // ── Handlers de drag & drop ───────────────────────────────────────────────────

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Só sai do estado dragging se o cursor saiu da drop zone inteira
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    // Caso 1: arquivos arrastados do sistema operacional / explorador de arquivos
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/')
    )

    // Caso 2: imagem arrastada de outro site (src como URL)
    const html = e.dataTransfer.getData('text/html')
    const plain = e.dataTransfer.getData('text/plain')

    if (files.length > 0) {
      uploadFiles(files)
      return
    }

    // Extrai a URL da imagem do HTML copiado (drag de browser)
    if (html) {
      const match = html.match(/src=["']([^"']+)["']/)
      if (match?.[1]) {
        const src = match[1]
        // Filtra data: URIs — não servem como URL permanente
        if (src.startsWith('data:')) {
          toast.error('Não é possível usar imagens em formato data:URI. Tente o upload direto.')
          return
        }
        addUrls([src])
        return
      }
    }

    // Fallback: texto simples (URL colada ou arrastada)
    if (plain?.startsWith('http')) {
      addUrls([plain.trim()])
      return
    }

    toast.error('Arraste um arquivo de imagem ou uma imagem de outro site.')
  }

  // ── Handler de URL manual ─────────────────────────────────────────────────────

  const handleAddUrl = () => {
    const url = urlInputRef.current?.value.trim() ?? ''
    if (!url) {
      toast.error('Cole uma URL válida antes de adicionar.')
      return
    }
    if (!url.startsWith('http')) {
      toast.error('A URL deve começar com http:// ou https://')
      return
    }
    addUrls([url])
    if (urlInputRef.current) urlInputRef.current.value = ''
  }

  const handleUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddUrl()
    }
  }

  const removeImage = (url: string) => {
    onChange(images.filter((u) => u !== url))
  }

  const moveFirst = (url: string) => {
    onChange([url, ...images.filter((u) => u !== url)])
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
            activeTab === 'upload'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Upload className="h-3.5 w-3.5" />
          Upload / Arrastar
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
            activeTab === 'url'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Link2 className="h-3.5 w-3.5" />
          Por URL
        </button>
      </div>

      {/* Tab: Upload / Drag & Drop */}
      {activeTab === 'upload' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
            ${isDragging
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
            }
            ${uploading ? 'pointer-events-none opacity-70' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="text-sm font-medium text-foreground">Enviando para o servidor...</p>
            </div>
          ) : isDragging ? (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-10 w-10 text-primary" />
              <p className="text-sm font-semibold text-primary">Solte aqui!</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                <ImageIcon className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Clique para selecionar ou arraste aqui
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, WebP ou GIF · Máx. 5 MB por arquivo
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Você também pode arrastar imagens diretamente de outros sites
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-1 pointer-events-none"
              >
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                Selecionar Arquivos
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Tab: URL */}
      {activeTab === 'url' && (
        <div className="flex gap-2">
          <Input
            ref={urlInputRef}
            onKeyDown={handleUrlKeyDown}
            placeholder="https://exemplo.com/imagem.jpg"
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={handleAddUrl} className="shrink-0">
            <Link2 className="h-4 w-4 mr-1.5" />
            Adicionar
          </Button>
        </div>
      )}

      {/* Contador */}
      <p className="text-xs text-muted-foreground">
        {images.length}/{maxImages} imagens · A primeira é usada como capa
      </p>

      {/* Grid de imagens */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((url, idx) => (
            <div
              key={url}
              className="relative group aspect-square rounded-lg overflow-hidden border bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Imagem ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = '/placeholder.svg'
                }}
              />

              {/* Badge capa */}
              {idx === 0 && (
                <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                  <Star className="h-2.5 w-2.5" />
                  Capa
                </span>
              )}

              {/* Overlay de ações */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={() => moveFirst(url)}
                    title="Definir como capa"
                    className="bg-white/90 hover:bg-white text-zinc-800 rounded-full p-1.5 transition-colors"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  title="Remover imagem"
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
