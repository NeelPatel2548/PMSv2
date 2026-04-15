async function testAuth() {
  const email = `testuser_${Date.now()}@test.com`;
  const url = 'http://127.0.0.1:5000/api';

  console.log(`[TEST] Starting tests with email: ${email}`);
  try {
    // 1. Register
    console.log('[TEST] Registering new student...');
    let res = await fetch(`${url}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Student',
        email: email,
        password: 'password123',
        role: 'student'
      })
    });
    let data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    console.log('[TEST] Register Response:', data.message);

    // 2. Verify OTP (using BYPASS_OTP_CODE "SKIP2025")
    console.log('[TEST] Verifying OTP...');
    res = await fetch(`${url}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        otp: 'SKIP2025' // From .env BYPASS_OTP_CODE
      })
    });
    data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    console.log('[TEST] Verify OTP Response:', data.message);

    // 3. Login
    console.log('[TEST] Logging in...');
    res = await fetch(`${url}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        password: 'password123'
      })
    });
    data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    console.log('[TEST] Login Response:', data.message);

    if (data.data?.requiresOTP) {
        console.log('[TEST] Verifying Login OTP...');
        res = await fetch(`${url}/auth/login/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            otp: 'SKIP2025'
          })
        });
        data = await res.json();
        if (!res.ok) throw new Error(JSON.stringify(data));
        console.log('[TEST] Login Verify Response:', data.message);
    }
    console.log('[TEST] DONE - System is working!');
  } catch (err) {
    console.error('[TEST] ERROR:', err);
  }
}

testAuth();
