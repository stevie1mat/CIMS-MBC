'use client';

import React, { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { updateUserAvatar } from '@/app/actions/profile';

export default function AvatarUpload({ userId, currentAvatarUrl, fallbackUrl }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    setIsUploading(true);
    
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const res = await updateUserAvatar(userId, filePath);
      
      if (!res.success) {
        throw new Error(res.error || 'Failed to save avatar path');
      }

      // Force a reload to show the new avatar
      window.location.reload();

    } catch (err) {
      console.error(err);
      alert('Failed to upload image: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div 
      style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', cursor: 'pointer', overflow: 'hidden', border: '4px solid #f8fafc', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => !isUploading && fileInputRef.current?.click()}
    >
      <img 
        src={currentAvatarUrl || fallbackUrl} 
        alt="Profile Avatar" 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      
      {(isHovered || isUploading) && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          {isUploading ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <>
              <Camera size={24} style={{ marginBottom: '4px' }} />
              <span style={{ fontSize: '12px', fontWeight: 500 }}>Change</span>
            </>
          )}
        </div>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />
    </div>
  );
}
