import { useState, useEffect, useRef } from 'react';
import { Image, Upload } from 'lucide-react';
import pb from '../../../../lib/pocketbase';
import type { RecordModel } from 'pocketbase';
import { EmptyState } from '../shared';

interface Toast { type: 'success' | 'error'; message: string }

export default function Photos({ onToast }: { onToast: (t: Toast) => void }) {
  const [records, setRecords] = useState<RecordModel[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    pb.collection('site_media').getFullList({ sort: 'name', requestKey: null })
      .then(setRecords).catch(() => {});
  }, []);

  const handleUpload = async (record: RecordModel, file: File) => {
    setUploading(record.id);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('name', record.name);
      fd.append('alt_text', record.alt_text ?? '');
      fd.append('usage_key', record.usage_key ?? '');
      const updated = await pb.collection('site_media').update(record.id, fd);
      setRecords(prev => prev.map(r => r.id === record.id ? updated : r));
      onToast({ type: 'success', message: `"${record.name}" updated!` });
    } catch { onToast({ type: 'error', message: 'Could not upload. Please try again.' }); }
    finally { setUploading(null); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Photos & Images</h2>
        <p className="text-sm text-gray-400 mt-0.5">Click "Change Photo" to upload a new image. Accepted formats: JPG, PNG, WebP.</p>
      </div>

      {!records.length
        ? <EmptyState icon={Image} message="No photos found. Images will appear here once they are added by your administrator." />
        : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {records.map(r => {
              const imgUrl = r.image ? pb.files.getURL(r, r.image) : null;
              const isUploading = uploading === r.id;
              return (
                <div key={r.id} className="bg-gray-800/60 border border-gray-700 rounded-xl overflow-hidden">
                  <div className="aspect-video bg-gray-900 flex items-center justify-center overflow-hidden">
                    {imgUrl
                      ? <img src={imgUrl} alt={r.alt_text ?? r.name} className="w-full h-full object-cover" />
                      : <Image className="w-10 h-10 text-gray-600" />}
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-white text-sm mb-0.5">{r.name}</p>
                    {r.alt_text && <p className="text-xs text-gray-500 mb-3">{r.alt_text}</p>}
                    <input
                      ref={el => { fileRefs.current[r.id] = el; }}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(r, file);
                        e.target.value = '';
                      }}
                    />
                    <button
                      onClick={() => fileRefs.current[r.id]?.click()}
                      disabled={isUploading}
                      className="flex items-center gap-2 w-full justify-center px-4 py-2 bg-gray-700 hover:bg-amber-500/20
                                 hover:text-amber-400 text-gray-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                      <Upload className="w-4 h-4" />
                      {isUploading ? 'Uploading…' : 'Change Photo'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}
