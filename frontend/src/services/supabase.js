import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const uploadFile = async (file, path) => {
  const { data, error } = await supabase.storage
    .from('nav-documents')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error
  return data
}

export const downloadFile = async (path) => {
  const { data, error } = await supabase.storage
    .from('nav-documents')
    .download(path)

  if (error) throw error
  return data
}

export const deleteFile = async (path) => {
  const { error } = await supabase.storage
    .from('nav-documents')
    .remove([path])

  if (error) throw error
}

export const getPublicUrl = (path) => {
  const { data } = supabase.storage
    .from('nav-documents')
    .getPublicUrl(path)

  return data.publicUrl
}
