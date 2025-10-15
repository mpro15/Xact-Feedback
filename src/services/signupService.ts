import { supabase } from '../lib/supabaseClient';

interface CompanySignupData {
  name: string;
  company_name: string;
  company_domain: string;
  company_address: string;
  company_city: string;
  company_state: string;
  company_zip: string;
  company_country: string;
  admin_phone: string;
  job_title: string;
  industry: string;
  company_size: string;
  current_ats: string;
  monthly_hires: string;
  selected_plan: string;
}

export const completeSignupSetup = async (userId: string) => {
  try {
    console.log('Completing signup setup for user:', userId);
    
    // Get user data from auth metadata
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not found or not authenticated');
    }

    const userData = user.user_metadata as CompanySignupData;
    
    if (!userData) {
      throw new Error('User metadata not found');
    }

    console.log('Creating company with data:', userData);
    
    // Create company
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: userData.company_name,
        domain: userData.company_domain,
        address: userData.company_address,
        city: userData.company_city,
        state: userData.company_state,
        zip_code: userData.company_zip,
        country: userData.company_country,
        industry: userData.industry,
        company_size: userData.company_size,
        current_ats: userData.current_ats,
        monthly_hires: userData.monthly_hires,
        created_by: userId,
        subscription_active: true, // Start trial
        subscription_plan: userData.selected_plan,
        trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      })
      .select()
      .single();

    if (companyError) {
      console.error('Company creation error:', companyError);
      throw new Error(`Failed to create company: ${companyError.message}`);
    }

    console.log('Company created successfully:', companyData.id);

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: user.email,
        name: userData.name,
        phone: userData.admin_phone,
        job_title: userData.job_title,
        company_id: companyData.id,
        account_type: 'admin',
        is_onboarded: false,
        is_approved: true // Admins are auto-approved
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw new Error(`Failed to create user profile: ${profileError.message}`);
    }

    console.log('User profile created successfully');
    
    return {
      company: companyData,
      success: true
    };
    
  } catch (error: any) {
    console.error('Complete signup setup error:', error);
    throw error;
  }
};
