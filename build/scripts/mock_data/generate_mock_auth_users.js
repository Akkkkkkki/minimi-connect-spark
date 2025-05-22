import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs/promises';
const url = process.env.SUPABASE_PROJECT_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRole) {
    console.error('⚠️  Please set SUPABASE_PROJECT_URL and SUPABASE_SERVICE_ROLE_KEY first.');
    process.exit(1);
}
const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false } // no local storage
});
const HOW_MANY = 99; // mockuser1 … mockuser100
const PASSWORD = 'password'; // ≥6 chars meets GoTrue minimum
(async () => {
    for (let i = 2; i <= HOW_MANY; i++) {
        const email = `mockuser${i}@example.com`;
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password: PASSWORD,
            email_confirm: true //,             // mark e-mail as verified
            //   user_metadata: {
            //     first_name: `MockFirst${i}`,
            //     last_name:  `MockLast${i}`
            //   }
        });
        if (error) {
            console.error(`❌  ${email}: ${error.message}`);
        }
        else {
            console.log(`✔️  ${data.user.id}  ${email}`);
        }
    }
    console.log(`\n🏁  Finished creating ${HOW_MANY} users`);
})();
