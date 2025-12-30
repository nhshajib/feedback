import { getSupabaseClient } from '~/lib/supabase';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export interface Student {
  id: string;
  full_name: string;
  section: string;
  created_at: string;
}

export async function createStudent(
  fullName: string,
  section: string,
  password: string
) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Database configuration error' };
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    const { data, error } = await supabase
      .from('students')
      .insert([
        {
          full_name: fullName,
          section: section,
          password: hashedPassword,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return {
          success: false,
          error: 'An account with this name already exists. Please log in.',
        };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: 'Failed to create account. Please try again.',
    };
  }
}

export async function getStudentByName(fullName: string) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Database configuration error' };
  }

  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('full_name', fullName)
      .single();

    if (error) {
      return { success: false, error: `Student not found: ${error.message}` };
    }
    
    return { success: true, data };
  } catch (err) {
    return { success: false, error: 'Failed to fetch student' };
  }
}

export async function loginStudent(
  fullName: string,
  password: string
) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Database configuration error' };
  }

  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('full_name', fullName)
      .single();

    if (error || !data) {
      return {
        success: false,
        error: 'Incorrect name or password.',
      };
    }

    const passwordMatch = await bcrypt.compare(password, data.password);
    
    if (!passwordMatch) {
      return {
        success: false,
        error: 'Incorrect name or password.',
      };
    }

    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: 'Incorrect name or password.',
    };
  }
}

export async function resetStudentPassword(
  fullName: string,
  newPassword: string
) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Database configuration error' };
  }

  try {
    const studentResult = await getStudentByName(fullName);
    
    if (!studentResult.success) {
      return {
        success: false,
        error: 'No account found with this name.',
      };
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    
    const { error } = await supabase
      .from('students')
      .update({ password: hashedPassword })
      .eq('full_name', fullName);

    if (error) {
      return {
        success: false,
        error: 'Failed to reset password. Please try again.',
      };
    }

    return { success: true, data: null };
  } catch (err) {
    return {
      success: false,
      error: 'Failed to reset password. Please try again.',
    };
  }
}
