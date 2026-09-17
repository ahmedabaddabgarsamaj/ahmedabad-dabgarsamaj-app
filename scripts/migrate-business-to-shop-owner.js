const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://hzremfhvmrgkfsnbhaxj.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6cmVtZmh2bXJna2ZzbmJoYXhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MjYzNTcsImV4cCI6MjEwNDEwMjM1N30.KQ5pPaYOoHgQfYQ_LhgSJvMC2SjfRj_r6jpV2hJtTjc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runMigration() {
  console.log('--- Starting Migration: BUSINESS_OWNER -> SHOP_OWNER ---');

  // 1. Query family_members
  const { data: members, error: memErr } = await supabase
    .from('family_members')
    .select('id, name, occupation_type, occupation_details')
    .ilike('occupation_type', '%business%');

  if (memErr) {
    console.error('Error fetching family_members:', memErr);
  } else {
    console.log(`Found ${members?.length || 0} family_members with BUSINESS_OWNER`);
    for (const m of members || []) {
      console.log(`Updating member: ${m.name} (${m.id}) from ${m.occupation_type} to SHOP_OWNER`);
      const details = m.occupation_details || {};
      const updatedDetails = {
        ...details,
        shop_name: details.shop_name || details.business_name || null,
        shop_type: details.shop_type || details.business_type || null,
        shop_location: details.shop_location || details.business_location || null,
      };

      const { error: updateErr } = await supabase
        .from('family_members')
        .update({
          occupation_type: 'SHOP_OWNER',
          occupation_details: updatedDetails,
        })
        .eq('id', m.id);

      if (updateErr) {
        console.error(`Failed to update member ${m.id}:`, updateErr);
      } else {
        console.log(`Successfully updated member ${m.name} (${m.id})`);
      }
    }
  }

  // 2. Query occupation_records
  const { data: occRecords, error: occErr } = await supabase
    .from('occupation_records')
    .select('id, family_member_id, occupation_type, business_name, business_type, business_location')
    .ilike('occupation_type', '%business%');

  if (occErr) {
    console.warn('Note/Error on occupation_records:', occErr.message);
  } else {
    console.log(`Found ${occRecords?.length || 0} occupation_records with BUSINESS_OWNER`);
    for (const rec of occRecords || []) {
      console.log(`Updating occupation_record ${rec.id} to SHOP_OWNER`);
      const { error: recUpdateErr } = await supabase
        .from('occupation_records')
        .update({
          occupation_type: 'SHOP_OWNER',
          shop_name: rec.business_name || undefined,
          shop_type: rec.business_type || undefined,
          shop_location: rec.business_location || undefined,
        })
        .eq('id', rec.id);

      if (recUpdateErr) {
        // Fallback without dynamic shop_* columns if they don't exist
        const { error: simpleUpdateErr } = await supabase
          .from('occupation_records')
          .update({
            occupation_type: 'SHOP_OWNER',
          })
          .eq('id', rec.id);

        if (simpleUpdateErr) {
          console.error(`Failed to update occupation_record ${rec.id}:`, simpleUpdateErr);
        } else {
          console.log(`Successfully updated occupation_record ${rec.id} (simple)`);
        }
      } else {
        console.log(`Successfully updated occupation_record ${rec.id}`);
      }
    }
  }

  // 3. Verify family_members count
  const { data: remainingMembers } = await supabase
    .from('family_members')
    .select('id, name, occupation_type')
    .ilike('occupation_type', '%business%');

  console.log('Remaining family_members with BUSINESS_OWNER:', remainingMembers?.length || 0);

  const { data: shopMembers } = await supabase
    .from('family_members')
    .select('id, name, occupation_type')
    .eq('occupation_type', 'SHOP_OWNER');

  console.log('Total family_members with SHOP_OWNER:', shopMembers?.length || 0);
  console.log('--- Migration Finished ---');
}

runMigration().catch(console.error);
