import { supabase } from '../src/lib/supabaseClient.js';

const testBucketConnection = async () => {
  try {
    // List files in the bucket
    const { data, error } = await supabase.storage.from('profile-images').list();
    if (error) {
      console.error('Error accessing bucket:', error);
    } else {
      console.log('Bucket contents:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
};

testBucketConnection();
